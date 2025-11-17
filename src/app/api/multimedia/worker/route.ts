/**
 * Multimedia Processing Worker
 * Auto-processes next available job in queue
 * 
 * This can be called by:
 * 1. Manual trigger (for development)
 * 2. Cron job (Vercel Cron, GitHub Actions, etc.)
 * 3. BullMQ/Inngest (for production)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  updateProcessingJobStatus,
  updateDocumentTranscription,
} from "@/lib/supabase/multimedia";
import {
  transcribeAudioFromStorage,
  transcribeVideoFromStorage,
} from "@/lib/openai/transcription";
import {
  analyzeImageFromStorage,
} from "@/lib/openai/vision";
import { chunkDocument } from "@/lib/workers/document-chunker";
import { generateBatchEmbeddings, estimateEmbeddingCost } from "@/lib/openai/embeddings";
import { createDocumentChunks } from "@/lib/supabase/documents";
import type { DocumentChunk } from "@/lib/workers/document-chunker";
import { logUsage } from "@/lib/supabase/billing";

export async function POST(_request: NextRequest) {
  try {
    // Use service role for worker - has full access to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get next job from queue
    const { data: jobs, error: queueError } = await supabase.rpc(
      "get_next_processing_job"
    );

    if (queueError) {
      console.error("Queue error:", queueError);
      return NextResponse.json({ error: queueError.message }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        message: "No jobs in queue",
        processed: 0,
      });
    }

    const job = jobs[0];
    const { queue_id, document_id, media_type, storage_path } = job;

    console.log(`🔄 Processing job:`, {
      queueId: queue_id,
      documentId: document_id,
      mediaType: media_type,
    });

    // Update status to processing
    await updateProcessingJobStatus(queue_id, "processing", 0, undefined, supabase);

    try {
      let extractedText = "";
      let processingCost = 0;

      // Get document details including owner_id for usage tracking
      const { data: document } = await supabase
        .from("documents")
        .select("title, storage_path, media_type, owner_id")
        .eq("id", document_id)
        .single();

      if (!document) {
        throw new Error("Document not found");
      }

      // Process based on media type
      switch (media_type) {
        case "audio":
          console.log("🎤 Transcribing audio...");
          await updateProcessingJobStatus(queue_id, "processing", 25, undefined, supabase);

          const transcriptionResult = await transcribeAudioFromStorage(
            supabase,
            "audio",
            storage_path,
            document.title,
            {
              language: undefined,
              temperature: 0,
            }
          );

          if (transcriptionResult.error) {
            throw new Error(transcriptionResult.error);
          }

          extractedText = transcriptionResult.text;
          processingCost = transcriptionResult.cost || 0;

          await updateDocumentTranscription(
            document_id,
            {
              transcriptionStatus: "completed",
              transcriptionText: extractedText,
              transcriptionCost: processingCost,
            },
            supabase
          );

          console.log("✅ Transcription completed");
          break;

        case "video":
          console.log("🎬 Transcribing video (extracting audio first)...");
          await updateProcessingJobStatus(queue_id, "processing", 25, undefined, supabase);

          // Video transcription: extract audio first, then transcribe
          // This allows videos >25MB as long as extracted audio is <25MB
          const videoTranscriptionResult = await transcribeVideoFromStorage(
            supabase,
            "videos", // videos bucket
            storage_path,
            document.title,
            {
              language: undefined, // auto-detect
              temperature: 0,
            }
          );

          if (videoTranscriptionResult.error) {
            throw new Error(videoTranscriptionResult.error);
          }

          extractedText = videoTranscriptionResult.text;
          processingCost = videoTranscriptionResult.cost || 0;

          await updateDocumentTranscription(
            document_id,
            {
              transcriptionStatus: "completed",
              transcriptionText: extractedText,
              transcriptionCost: processingCost,
            },
            supabase
          );

          console.log("✅ Video transcription completed");
          break;


        case "image":
          console.log("🖼️  Analyzing image with Vision API...");
          await updateProcessingJobStatus(queue_id, "processing", 25, undefined, supabase);

          const visionResult = await analyzeImageFromStorage(
            supabase,
            "images",
            storage_path,
            {
              detail: "high", // High detail for better analysis
              maxTokens: 1500,
              language: "en", // You can make this configurable
            }
          );

          if (visionResult.error) {
            throw new Error(visionResult.error);
          }

          extractedText = visionResult.text;
          processingCost = visionResult.cost || 0;

          await updateDocumentTranscription(
            document_id,
            {
              transcriptionStatus: "completed",
              transcriptionText: extractedText,
              transcriptionCost: processingCost,
            },
            supabase
          );

          console.log("✅ Image analysis completed");
          break;

        default:
          throw new Error(`Unsupported media type: ${media_type}`);
      }

      // Chunk the text
      console.log("✂️  Chunking text...");
      await updateProcessingJobStatus(queue_id, "processing", 50, undefined, supabase);

      const chunkingResult = chunkDocument(extractedText);
      const chunks = chunkingResult.chunks;
      console.log(`📑 Created ${chunks.length} chunks`);

      // Generate embeddings
      console.log("🧠 Generating embeddings...");
      await updateProcessingJobStatus(queue_id, "processing", 75, undefined, supabase);

      const chunkTexts = chunks.map((c: DocumentChunk) => c.text);
      const embeddingsResult = await generateBatchEmbeddings(chunkTexts);

      if (embeddingsResult.error) {
        throw new Error(String(embeddingsResult.error) || "Embeddings generation failed");
      }

      const embeddings = (embeddingsResult.data || []).map(item => item.embedding);
      
      // Calculate actual embedding cost based on tokens used
      const totalTokens = (embeddingsResult.data || []).reduce((sum, item) => sum + (item.tokens || 0), 0);
      const embeddingCost = estimateEmbeddingCost(totalTokens, 'text-embedding-3-small');
      const totalCost = processingCost + embeddingCost;

      console.log(
        `✅ Generated ${embeddings.length} embeddings, ${totalTokens} tokens, cost: $${embeddingCost.toFixed(4)}`
      );

      // Track API usage for billing and quota management
      if (document.owner_id) {
        const usageResult = await logUsage({
          user_id: document.owner_id,
          tutor_id: null,
          action: 'embedding',
          api_calls: 1,
          tokens_used: totalTokens,
          cost_estimate: embeddingCost,
          metadata: {
            document_id: document_id,
            document_type: media_type,
            chunks_count: chunks.length,
            embeddings_count: embeddings.length,
            processing_cost: processingCost,
            embedding_cost: embeddingCost,
            total_cost: totalCost,
            worker_type: 'auto_processing'
          }
        });

        if (usageResult.error) {
          console.error('⚠️ Failed to log usage:', usageResult.error);
        } else if (usageResult.data) {
          console.log(`📊 Usage logged. Quota: ${usageResult.data.current_value || 'N/A'}/${usageResult.data.max_value || 'N/A'}`);
          
          // Check if user exceeded quota
          if (usageResult.data.quota_exceeded) {
            console.warn(`⚠️ User ${document.owner_id} has exceeded their quota!`);
            // Note: We continue processing as the document is already processed
            // In a real-world scenario, you might want to prevent processing before it starts
          }
        }
      } else {
        console.warn('⚠️ No owner_id found for document, skipping usage tracking');
      }

      // Save chunks with embeddings
      console.log("💾 Saving chunks...");
      await updateProcessingJobStatus(queue_id, "processing", 90, undefined, supabase);

      const chunksWithEmbeddings = chunks.map(
        (chunk: DocumentChunk, index: number) => ({
          document_id: document_id,
          chunk_index: chunk.index,
          text: chunk.text,
          tokens: chunk.tokens,
          embedding: embeddings[index],
        })
      );

      const { error: saveError } = await createDocumentChunks(
        chunksWithEmbeddings,
        supabase
      );

      if (saveError) {
        throw new Error(saveError);
      }

      // Mark as completed
      await updateProcessingJobStatus(queue_id, "completed", 100, undefined, supabase);

      // Update document status
      await supabase
        .from("documents")
        .update({ status: "ready" })
        .eq("id", document_id);

      // Update queue with results
      await supabase
        .from("media_processing_queue")
        .update({
          chunks_created: chunks.length,
          embeddings_generated: embeddings.length,
          processing_cost: totalCost,
        })
        .eq("id", queue_id);

      console.log("✅ Processing completed successfully");

      return NextResponse.json({
        success: true,
        processed: 1,
        queueId: queue_id,
        documentId: document_id,
        chunks: chunks.length,
        embeddings: embeddings.length,
        cost: totalCost,
      });
    } catch (processingError) {
      // Mark job as failed
      const errorMessage =
        processingError instanceof Error
          ? processingError.message
          : "Processing failed";

      await updateProcessingJobStatus(queue_id, "failed", 0, errorMessage, supabase);

      await updateDocumentTranscription(
        document_id,
        {
          transcriptionStatus: "failed",
        },
        supabase
      );

      console.error("❌ Processing error:", errorMessage);

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          queueId: queue_id,
          documentId: document_id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Worker error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Worker failed",
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Check worker status and queue info
 */
export async function GET() {
  try {
    // Use service role for worker - has full access to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get queue stats
    const { data: queueStats } = await supabase
      .from("media_processing_queue")
      .select("status")
      .in("status", ["queued", "processing"]);

    const queued = queueStats?.filter((j) => j.status === "queued").length || 0;
    const processing =
      queueStats?.filter((j) => j.status === "processing").length || 0;

    return NextResponse.json({
      status: "online",
      queue: {
        queued,
        processing,
        total: queued + processing,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Failed to get status",
      },
      { status: 500 }
    );
  }
}

