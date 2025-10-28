/**
 * Document Processor - Coordina parsing, chunking e embeddings dei documenti
 * Sprint 2: Implementazione con OpenAI Embeddings per RAG
 */

import { parseDocument, type ParsedDocument } from "./document-parser";
import {
  chunkDocument,
  estimateTokens,
  type ChunkingResult,
  type DocumentChunk,
} from "./document-chunker";
import { generateBatchEmbeddings } from "@/lib/openai/embeddings";
import { createDocumentChunks } from "@/lib/supabase/documents";
import type { SupportedMimeType } from "@/types/documents";
import type { Database } from "@/types/database";

type DocumentChunkInsert =
  Database["public"]["Tables"]["document_chunks"]["Insert"];

export interface ProcessingResult {
  success: boolean;
  documentId?: string;
  chunks?: DocumentChunk[];
  totalTokens?: number;
  embeddingsGenerated?: number;
  embeddingCost?: number;
  error?: string;
  metadata?: {
    parsing: ParsedDocument["metadata"];
    chunking: ChunkingResult["metadata"];
    embeddings?: {
      model: string;
      totalTokens: number;
      cost: number;
    };
  };
}

export interface ProcessingOptions {
  minTokens?: number;
  maxTokens?: number;
  overlapTokens?: number;
  saveToDatabase?: boolean;
}

/**
 * Processa un documento: parsing + chunking + salvataggio
 */
export async function processDocument(
  file: File,
  documentId: string,
  options: ProcessingOptions = {},
  supabaseClient?: any
): Promise<ProcessingResult> {
  const {
    minTokens = 500,
    maxTokens = 800,
    overlapTokens = 100,
    saveToDatabase = true,
  } = options;

  try {
    // Step 1: Validazione del file
    if (!file.type || !isSupportedMimeType(file.type)) {
      return {
        success: false,
        error: `Unsupported file type: ${file.type}`,
      };
    }

    // Step 2: Parsing del documento
    const parseResult = await parseDocument(
      file,
      file.type as SupportedMimeType
    );

    if (!parseResult.data) {
      return {
        success: false,
        error: parseResult.error || "Failed to parse document",
      };
    }

    const { text, metadata: parsingMetadata } = parseResult.data;

    // Step 3: Chunking del testo
    // Per documenti molto brevi, usa parametri più permissivi
    const textTokens = estimateTokens(text);
    const adjustedMinTokens = textTokens < minTokens ? Math.max(10, Math.floor(textTokens * 0.8)) : minTokens;
    
    const chunkingResult = chunkDocument(text, {
      minTokens: adjustedMinTokens,
      maxTokens,
      overlapTokens,
    });

    if (chunkingResult.chunks.length === 0) {
      return {
        success: false,
        error: `No chunks generated from document. Text too short (${textTokens} tokens, minimum ${adjustedMinTokens} required)`,
      };
    }

    // Step 4: Generazione embeddings per i chunk
    console.log(`🔄 Generating embeddings for ${chunkingResult.chunks.length} chunks...`);
    
    const chunkTexts = chunkingResult.chunks.map(chunk => chunk.text);
    const embeddingsResult = await generateBatchEmbeddings(chunkTexts);
    
    if (embeddingsResult.error) {
      return {
        success: false,
        error: `Failed to generate embeddings: ${embeddingsResult.error.error}`,
      };
    }

    if (!embeddingsResult.data) {
      return {
        success: false,
        error: "No embeddings data returned from OpenAI",
      };
    }

    // Aggiungi embeddings ai chunk
    const chunksWithEmbeddings = chunkingResult.chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddingsResult.data![index].embedding,
    }));

    const totalEmbeddingTokens = embeddingsResult.data.reduce((sum, item) => sum + item.tokens, 0);
    const embeddingCost = (totalEmbeddingTokens / 1000) * 0.00002; // text-embedding-3-small pricing

    console.log(`✅ Generated ${embeddingsResult.data.length} embeddings (${totalEmbeddingTokens} tokens, $${embeddingCost.toFixed(4)} cost)`);

    // Step 5: Salvataggio nel database (se richiesto)
    if (saveToDatabase) {
      const saveResult = await saveChunksToDatabase(
        documentId,
        chunksWithEmbeddings,
        supabaseClient
      );

      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error || "Failed to save chunks to database",
        };
      }
    }

    // Document processing completed successfully
    console.log(`✅ Document processing completed: ${chunksWithEmbeddings.length} chunks with embeddings`);

    return {
      success: true,
      documentId,
      chunks: chunksWithEmbeddings,
      totalTokens: chunkingResult.totalTokens,
      embeddingsGenerated: embeddingsResult.data.length,
      embeddingCost,
      metadata: {
        parsing: parsingMetadata,
        chunking: chunkingResult.metadata,
        embeddings: {
          model: embeddingsResult.data[0].model,
          totalTokens: totalEmbeddingTokens,
          cost: embeddingCost,
        },
      },
    };
  } catch (error) {
    console.error("❌ Document processing error:", error);
    return {
      success: false,
      error: `Processing failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Salva i chunk con embeddings nel database
 */
async function saveChunksToDatabase(
  documentId: string,
  chunks: (DocumentChunk & { embedding?: number[] })[],
  supabaseClient?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Converte i chunk nel formato del database
    const dbChunks: DocumentChunkInsert[] = chunks.map((chunk) => ({
      document_id: documentId,
      chunk_index: chunk.index,
      text: chunk.text,
      tokens: chunk.tokens,
      embedding: chunk.embedding || null, // Includi l'embedding se presente
    }));

    if (supabaseClient) {
      // Usa il client fornito (service client per bypassare RLS)
      const { error } = await supabaseClient
        .from('document_chunks')
        .insert(dbChunks);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Usa il client normale
      const result = await createDocumentChunks(dbChunks);
      if (result.error) {
        return { success: false, error: result.error };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Database save error:", error);
    return {
      success: false,
      error: `Failed to save chunks: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Processa un documento in background (per uso futuro con Web Workers)
 */
export async function processDocumentInBackground(
  file: File,
  documentId: string,
  options: ProcessingOptions = {},
  onProgress?: (progress: number, status: string) => void
): Promise<ProcessingResult> {
  // Per ora, esegue il processing normale
  // In futuro, questo potrebbe usare Web Workers

  onProgress?.(10, "Starting document processing...");

  const result = await processDocument(file, documentId, options);

  onProgress?.(
    100,
    result.success ? "Processing completed" : "Processing failed"
  );

  return result;
}

/**
 * Stima il tempo di processing
 */
export function estimateProcessingTime(fileSize: number): {
  parsing: number;
  chunking: number;
  total: number;
} {
  // Stime approssimative in secondi
  const parsing = Math.max(1, Math.ceil((fileSize / (1024 * 1024)) * 2)); // 2 sec per MB
  const chunking = Math.max(1, Math.ceil((fileSize / (1024 * 1024)) * 0.5)); // 0.5 sec per MB

  return {
    parsing,
    chunking,
    total: parsing + chunking,
  };
}

/**
 * Verifica se il tipo MIME è supportato
 */
function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
  const supportedTypes = [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  return supportedTypes.includes(mimeType);
}

/**
 * Ottiene statistiche di processing per un batch di documenti
 */
export function getProcessingStats(results: ProcessingResult[]): {
  total: number;
  successful: number;
  failed: number;
  totalTokens: number;
  totalChunks: number;
  averageTokensPerChunk: number;
} {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const totalTokens = successful.reduce(
    (sum, r) => sum + (r.totalTokens || 0),
    0
  );
  const totalChunks = successful.reduce(
    (sum, r) => sum + (r.chunks?.length || 0),
    0
  );

  return {
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    totalTokens,
    totalChunks,
    averageTokensPerChunk: totalChunks > 0 ? totalTokens / totalChunks : 0,
  };
}
