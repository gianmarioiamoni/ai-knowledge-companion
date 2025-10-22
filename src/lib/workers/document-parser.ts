/**
 * Document Parser - Estrae testo da diversi formati di file
 * Sprint 1: Implementazione locale senza embeddings
 */

import { SupportedMimeType } from "@/types/documents";

export interface ParsedDocument {
  text: string;
  metadata: {
    title?: string;
    author?: string;
    pages?: number;
    wordCount: number;
    charCount: number;
  };
}

/**
 * Parsa un file e estrae il testo
 */
export async function parseDocument(
  file: File,
  mimeType: SupportedMimeType
): Promise<{ data?: ParsedDocument; error?: string }> {
  try {
    console.log("📄 Parsing document:", {
      name: file.name,
      type: mimeType,
      size: file.size,
    });

    let text: string;
    let metadata: ParsedDocument["metadata"];

    switch (mimeType) {
      case "text/plain":
      case "text/markdown":
        const result = await parseTextFile(file);
        text = result.text;
        metadata = result.metadata;
        break;

      case "application/pdf":
        // Per ora, implementiamo un parser PDF semplificato
        // In produzione, useremmo pdf-parse o simili
        const pdfResult = await parsePDFFile(file);
        text = pdfResult.text;
        metadata = pdfResult.metadata;
        break;

      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        // Per ora, implementiamo un parser DOC semplificato
        // In produzione, useremmo mammoth.js o simili
        const docResult = await parseDocFile(file);
        text = docResult.text;
        metadata = docResult.metadata;
        break;

      default:
        return { error: `Unsupported file type: ${mimeType}` };
    }

    // Validazione del testo estratto
    if (!text || text.trim().length === 0) {
      return { error: "No text content found in document" };
    }

    if (text.length < 50) {
      return { error: "Document content too short (minimum 50 characters)" };
    }

    console.log("✅ Document parsed successfully:", {
      textLength: text.length,
      wordCount: metadata.wordCount,
      charCount: metadata.charCount,
    });

    return {
      data: {
        text: text.trim(),
        metadata,
      },
    };
  } catch (error) {
    console.error("❌ Document parsing error:", error);
    return {
      error: `Failed to parse document: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

/**
 * Parsa file di testo (.txt, .md)
 */
async function parseTextFile(file: File): Promise<ParsedDocument> {
  const text = await file.text();

  return {
    text,
    metadata: {
      wordCount: countWords(text),
      charCount: text.length,
    },
  };
}

/**
 * Parsa file PDF (implementazione semplificata)
 * TODO: Integrare pdf-parse in produzione
 */
async function parsePDFFile(file: File): Promise<ParsedDocument> {
  // Per ora, restituiamo un placeholder
  // In produzione, useremmo una libreria come pdf-parse
  const text = `[PDF Content from ${
    file.name
  }]\n\nThis is a placeholder for PDF parsing. In production, this would extract actual text from the PDF file using pdf-parse or similar library.\n\nFile size: ${(
    file.size /
    1024 /
    1024
  ).toFixed(2)} MB`;

  return {
    text,
    metadata: {
      title: file.name.replace(".pdf", ""),
      wordCount: countWords(text),
      charCount: text.length,
      pages: 1, // Placeholder
    },
  };
}

/**
 * Parsa file DOC/DOCX (implementazione semplificata)
 * TODO: Integrare mammoth.js in produzione
 */
async function parseDocFile(file: File): Promise<ParsedDocument> {
  // Per ora, restituiamo un placeholder
  // In produzione, useremmo una libreria come mammoth.js
  const text = `[DOC Content from ${
    file.name
  }]\n\nThis is a placeholder for DOC/DOCX parsing. In production, this would extract actual text from the document using mammoth.js or similar library.\n\nFile size: ${(
    file.size /
    1024 /
    1024
  ).toFixed(2)} MB`;

  return {
    text,
    metadata: {
      title: file.name.replace(/\.(doc|docx)$/, ""),
      wordCount: countWords(text),
      charCount: text.length,
    },
  };
}

/**
 * Conta le parole in un testo
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

/**
 * Valida se un file può essere parsato
 */
export function canParseFile(mimeType: string): mimeType is SupportedMimeType {
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
 * Stima il tempo di parsing basato sulla dimensione del file
 */
export function estimateParsingTime(fileSize: number): number {
  // Stima approssimativa: 1MB = 2 secondi
  return Math.max(1, Math.ceil((fileSize / (1024 * 1024)) * 2));
}
