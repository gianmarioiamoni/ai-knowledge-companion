/**
 * Multimedia Processing Worker API
 * Processes multimedia files (transcription, vision analysis, etc.)
 * This endpoint should be called by background workers or manually for testing
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  updateProcessingJobStatus,
  updateDocumentTranscription,
} from "@/lib/supabase/multimedia";
import {
  transcribeAudioFromStorage,
} from "@/lib/openai/transcription";
import { chunkDocument } from "@/lib/workers/document-chunker";
import { generateBatchEmbeddings, estimateEmbeddingCost } from "@/lib/openai/embeddings";
import { createDocumentChunks } from "@/lib/supabase/documents";
import type { DocumentChunk } from "@/lib/workers/document-chunker";
import { withRateLimit } from "@/lib/middleware/rate-limit-guard";
import { sanitize } from "@/lib/utils/log-sanitizer";
import { logUsage } from "@/lib/supabase/billing";

export const POST = withRateLimit('ai', async (request: NextRequest, _context) => {
  try {
    // This endpoint processes a specific document
    // In production, this would be called by a background worker (BullMQ, Inngest, etc.)

    const supabase = await createClient();
    const { documentId, queueId } = await request.json();

    if (!documentId || !queueId) {
      return NextResponse.json(
        { success: false, error: "documentId and queueId are required" },
        { status: 400 }
      );
    }

    console.log(`🔄 Processing multimedia:`, { documentId, queueId });

    // Update status to processing
    await updateProcessingJobStatus(queueId, "processing", 0);

    // Get document details
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (fetchError || !document) {
      await updateProcessingJobStatus(
        queueId,
        "failed",
        0,
        "Document not found"
      );
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    let extractedText = "";
    let processingCost = 0;

    // Process based on media type
    switch (document.media_type) {
      case "audio":
        // Transcribe audio
        console.log("🎤 Transcribing audio...");
        await updateProcessingJobStatus(queueId, "processing", 25);

        const transcriptionResult = await transcribeAudioFromStorage(
          supabase,
          "audio",
          document.storage_path,
          document.title,
          {
            language: undefined, // Auto-detect
            temperature: 0, // More focused
          }
        );

        if (transcriptionResult.error) {
          await updateProcessingJobStatus(
            queueId,
            "failed",
            0,
            transcriptionResult.error
          );
          await updateDocumentTranscription(documentId, {
            transcriptionStatus: "failed",
          });
          return NextResponse.json(
            { success: false, error: transcriptionResult.error },
            { status: 500 }
          );
        }

        extractedText = transcriptionResult.text;
        processingCost = transcriptionResult.cost || 0;

        // Update document with transcription
        await updateDocumentTranscription(documentId, {
          transcriptionStatus: "completed",
          transcriptionText: extractedText,
          transcriptionCost: processingCost,
        });

        console.log("✅ Transcription completed:", {
          textLength: extractedText.length,
          cost: processingCost,
        });
        break;

      case "video":
        // TODO: Extract audio from video, then transcribe
        await updateProcessingJobStatus(
          queueId,
          "failed",
          0,
          "Video processing not yet implemented"
        );
        return NextResponse.json(
          { success: false, error: "Video processing not yet implemented" },
          { status: 501 }
        );

      case "image":
        // TODO: Use GPT-4 Vision for OCR and description
        await updateProcessingJobStatus(
          queueId,
          "failed",
          0,
          "Image processing not yet implemented"
        );
        return NextResponse.json(
          { success: false, error: "Image processing not yet implemented" },
          { status: 501 }
        );

      default:
        await updateProcessingJobStatus(
          queueId,
          "failed",
          0,
          `Unsupported media type: ${document.media_type}`
        );
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported media type: ${document.media_type}`,
          },
          { status: 400 }
        );
    }

    // Chunk the extracted text
    console.log("✂️  Chunking text...");
    await updateProcessingJobStatus(queueId, "processing", 50);

    const chunkingResult = chunkDocument(extractedText);
    const chunks = chunkingResult.chunks;
    console.log(`📑 Created ${chunks.length} chunks`);

    // Generate embeddings
    console.log("🧠 Generating embeddings...");
    await updateProcessingJobStatus(queueId, "processing", 75);

    const chunkTexts = chunks.map((c: DocumentChunk) => c.text);
    const embeddingsResult = await generateBatchEmbeddings(chunkTexts);

    if (embeddingsResult.error) {
      const errorMessage = String(embeddingsResult.error);
      await updateProcessingJobStatus(
        queueId,
        "failed",
        75,
        errorMessage
      );
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }

    const embeddings = (embeddingsResult.data || []).map(r => r.embedding);
    
    // Calculate actual embedding cost based on tokens used
    const totalTokens = (embeddingsResult.data || []).reduce((sum, r) => sum + (r.tokens || 0), 0);
    const embeddingCost = estimateEmbeddingCost(totalTokens, 'text-embedding-3-small');
    const totalCost = processingCost + embeddingCost;

    console.log(`✅ Generated ${embeddings.length} embeddings, ${totalTokens} tokens, cost: $${embeddingCost.toFixed(4)}`);

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
          document_id: documentId,
          document_type: document.media_type,
          chunks_count: chunks.length,
          embeddings_count: embeddings.length,
          processing_cost: processingCost,
          embedding_cost: embeddingCost,
          total_cost: totalCost
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

    // Save chunks with embeddings to database
    console.log("💾 Saving chunks to database...");
    await updateProcessingJobStatus(queueId, "processing", 90);

    const chunksWithEmbeddings = chunks.map((chunk: DocumentChunk, index: number) => ({
      document_id: documentId,
      chunk_index: chunk.index,
      text: chunk.text,
      tokens: chunk.tokens,
      embedding: embeddings[index],
    }));

    const { error: saveError } = await createDocumentChunks(
      chunksWithEmbeddings,
      supabase
    );

    if (saveError) {
      await updateProcessingJobStatus(queueId, "failed", 90, saveError);
      return NextResponse.json(
        { success: false, error: saveError },
        { status: 500 }
      );
    }

    // Mark as completed
    await updateProcessingJobStatus(queueId, "completed", 100);

    // Update document status
    await supabase
      .from("documents")
      .update({ status: "ready" })
      .eq("id", documentId);

    // Update queue with results
    await supabase
      .from("media_processing_queue")
      .update({
        chunks_created: chunks.length,
        embeddings_generated: embeddings.length,
        processing_cost: totalCost,
      })
      .eq("id", queueId);

    console.log("✅ Processing completed successfully:", {
      documentId,
      chunks: chunks.length,
      embeddings: embeddings.length,
      totalCost: `$${totalCost.toFixed(4)}`,
    });

    return NextResponse.json({
      success: true,
      documentId,
      chunksCreated: chunks.length,
      embeddingsGenerated: embeddings.length,
      processingCost: totalCost,
    });
  } catch (error) {
    console.error("❌ Processing error:", sanitize(error));
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Processing failed",
      },
      { status: 500 }
    );
  }
});

