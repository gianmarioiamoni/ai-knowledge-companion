/**
 * Document Chunker - Divide il testo in chunk per il processing
 * Sprint 1: Implementazione locale senza embeddings
 */

import { CHUNK_CONFIG } from "@/types/documents";

export interface DocumentChunk {
  index: number;
  text: string;
  tokens: number;
  startChar: number;
  endChar: number;
  metadata: {
    wordCount: number;
    sentences: number;
    hasOverlap: boolean;
  };
}

export interface ChunkingResult {
  chunks: DocumentChunk[];
  totalTokens: number;
  totalChunks: number;
  metadata: {
    originalLength: number;
    averageChunkSize: number;
    overlapPercentage: number;
  };
}

/**
 * Divide un documento in chunk
 */
export function chunkDocument(
  text: string,
  options: {
    minTokens?: number;
    maxTokens?: number;
    overlapTokens?: number;
  } = {}
): ChunkingResult {
  const {
    minTokens = CHUNK_CONFIG.MIN_TOKENS,
    maxTokens = CHUNK_CONFIG.MAX_TOKENS,
    overlapTokens = CHUNK_CONFIG.OVERLAP_TOKENS,
  } = options;

  // Chunking document

  // Preprocessing del testo
  const cleanText = preprocessText(text);

  // Dividi in paragrafi per mantenere la struttura semantica
  const paragraphs = splitIntoParagraphs(cleanText);

  // Crea i chunk
  const chunks: DocumentChunk[] = [];
  let currentChunk = "";
  let currentTokens = 0;
  let chunkIndex = 0;
  let charPosition = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);

    // Se il paragrafo da solo supera maxTokens, dividilo in frasi
    if (paragraphTokens > maxTokens) {
      const sentences = splitIntoSentences(paragraph);

      for (const sentence of sentences) {
        const sentenceTokens = estimateTokens(sentence);

        // Se anche una singola frase supera maxTokens, dividila per forza
        if (sentenceTokens > maxTokens) {
          const forcedChunks = forceChunkLongText(sentence, maxTokens);

          for (const forcedChunk of forcedChunks) {
            if (currentChunk && currentTokens > 0) {
              // Salva il chunk corrente
              chunks.push(
                createChunk(
                  currentChunk,
                  chunkIndex++,
                  charPosition,
                  currentTokens
                )
              );
              charPosition += currentChunk.length;

              // Applica overlap
              const overlapText = getOverlapText(currentChunk, overlapTokens);
              currentChunk = overlapText + "\n\n" + forcedChunk;
              currentTokens = estimateTokens(currentChunk);
            } else {
              currentChunk = forcedChunk;
              currentTokens = estimateTokens(forcedChunk);
            }
          }
        } else {
          // Controlla se aggiungere la frase al chunk corrente
          if (currentTokens + sentenceTokens <= maxTokens) {
            currentChunk += (currentChunk ? " " : "") + sentence;
            currentTokens += sentenceTokens;
          } else {
            // Salva il chunk corrente e inizia uno nuovo
            if (currentChunk) {
              chunks.push(
                createChunk(
                  currentChunk,
                  chunkIndex++,
                  charPosition,
                  currentTokens
                )
              );
              charPosition += currentChunk.length;

              // Applica overlap
              const overlapText = getOverlapText(currentChunk, overlapTokens);
              currentChunk = overlapText + (overlapText ? " " : "") + sentence;
              currentTokens = estimateTokens(currentChunk);
            } else {
              currentChunk = sentence;
              currentTokens = sentenceTokens;
            }
          }
        }
      }
    } else {
      // Controlla se aggiungere il paragrafo al chunk corrente
      if (currentTokens + paragraphTokens <= maxTokens) {
        currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
        currentTokens += paragraphTokens;
      } else {
        // Salva il chunk corrente e inizia uno nuovo
        if (currentChunk) {
          chunks.push(
            createChunk(currentChunk, chunkIndex++, charPosition, currentTokens)
          );
          charPosition += currentChunk.length;

          // Applica overlap
          const overlapText = getOverlapText(currentChunk, overlapTokens);
          currentChunk = overlapText + (overlapText ? "\n\n" : "") + paragraph;
          currentTokens = estimateTokens(currentChunk);
        } else {
          currentChunk = paragraph;
          currentTokens = paragraphTokens;
        }
      }
    }
  }

  // Salva l'ultimo chunk se non vuoto
  if (currentChunk && currentTokens > 0) {
    // Per documenti brevi, accetta chunk anche sotto minTokens
    if (currentTokens >= minTokens || chunks.length === 0) {
      chunks.push(
        createChunk(currentChunk, chunkIndex, charPosition, currentTokens)
      );
    }
  }

  const totalTokens = chunks.reduce((sum, chunk) => sum + chunk.tokens, 0);
  const averageChunkSize = chunks.length > 0 ? totalTokens / chunks.length : 0;

  // Document chunked successfully

  return {
    chunks,
    totalTokens,
    totalChunks: chunks.length,
    metadata: {
      originalLength: text.length,
      averageChunkSize,
      overlapPercentage: (overlapTokens / maxTokens) * 100,
    },
  };
}

/**
 * Preprocessing del testo
 */
function preprocessText(text: string): string {
  return text
    .replace(/\r\n/g, "\n") // Normalizza line endings
    .replace(/\n{3,}/g, "\n\n") // Riduci line breaks multipli
    .replace(/[ \t]+/g, " ") // Normalizza spazi
    .trim();
}

/**
 * Divide il testo in paragrafi
 */
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Divide il testo in frasi
 */
function splitIntoSentences(text: string): string[] {
  // Regex semplificata per dividere le frasi
  return text
    .split(/[.!?]+\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s, i, arr) => (i < arr.length - 1 ? s + "." : s));
}

/**
 * Forza la divisione di testo molto lungo
 */
function forceChunkLongText(text: string, maxTokens: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentTokens = 0;

  for (const word of words) {
    const wordTokens = estimateTokens(word);

    if (currentTokens + wordTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [word];
      currentTokens = wordTokens;
    } else {
      currentChunk.push(word);
      currentTokens += wordTokens;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}

/**
 * Ottiene il testo di overlap dalla fine del chunk
 */
function getOverlapText(text: string, overlapTokens: number): string {
  if (overlapTokens <= 0) return "";

  const words = text.split(/\s+/);
  const overlapWords = Math.min(overlapTokens, Math.floor(words.length * 0.3));

  return words.slice(-overlapWords).join(" ");
}

/**
 * Crea un oggetto chunk
 */
function createChunk(
  text: string,
  index: number,
  startChar: number,
  tokens: number
): DocumentChunk {
  const sentences = splitIntoSentences(text).length;
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  return {
    index,
    text: text.trim(),
    tokens,
    startChar,
    endChar: startChar + text.length,
    metadata: {
      wordCount,
      sentences,
      hasOverlap: index > 0, // Tutti i chunk tranne il primo hanno overlap
    },
  };
}

/**
 * Stima approssimativa dei token (1 token ≈ 0.75 parole per l'inglese)
 */
export function estimateTokens(text: string): number {
  const words = text.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.ceil(words * 1.3); // Fattore di conversione approssimativo
}

/**
 * Valida i parametri di chunking
 */
export function validateChunkingParams(params: {
  minTokens: number;
  maxTokens: number;
  overlapTokens: number;
}): { valid: boolean; error?: string } {
  const { minTokens, maxTokens, overlapTokens } = params;

  if (minTokens <= 0) {
    return { valid: false, error: "minTokens must be greater than 0" };
  }

  if (maxTokens <= minTokens) {
    return { valid: false, error: "maxTokens must be greater than minTokens" };
  }

  if (overlapTokens < 0) {
    return { valid: false, error: "overlapTokens cannot be negative" };
  }

  if (overlapTokens >= maxTokens) {
    return { valid: false, error: "overlapTokens must be less than maxTokens" };
  }

  return { valid: true };
}
