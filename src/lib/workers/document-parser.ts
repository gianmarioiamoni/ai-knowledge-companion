/**
 * Document Parser - Estrae testo da diversi formati di file
 * Sprint 1: Implementazione locale senza embeddings
 */

import { SupportedMimeType } from "@/types/documents";
// Node.js Buffer type for server-side parsing
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type NodeBuffer = Buffer;

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
    // Parsing document

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
        // Parser PDF reale con pdfjs-dist (server-side)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const pdfResult = await parseDocumentFromBuffer(buffer, file.name, mimeType);
        if (pdfResult.error) {
          return { error: pdfResult.error };
        }
        text = pdfResult.data!.text;
        metadata = pdfResult.data!.metadata;
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

    // Document parsed successfully

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
 * Parsa un documento partendo da un Buffer (server-side)
 */
export async function parseDocumentFromBuffer(
  buffer: NodeBuffer,
  filename: string,
  mimeType: SupportedMimeType
): Promise<{ data?: ParsedDocument; error?: string }> {
  try {
    let text: string;
    let metadata: ParsedDocument["metadata"];

    switch (mimeType) {
      case "text/plain":
      case "text/markdown": {
        const content = buffer.toString("utf8");
        text = content;
        metadata = {
          wordCount: countWords(content),
          charCount: content.length,
        };
        break;
      }
      case "application/pdf": {
        try {
          // Usa LangChain WebPDFLoader per estrarre testo robustamente
          const { WebPDFLoader } = await import("@langchain/community/document_loaders/web/pdf");
          
          const blob = new Blob([buffer], { type: "application/pdf" });
          const loader = new WebPDFLoader(blob, { parsedItemSeparator: "\n\n" });
          const docs = await loader.load();
          const combined = docs
            .map((d: { pageContent?: string }) => (d.pageContent || "").trim())
            .filter(Boolean)
            .join("\n\n");

          text = combined;
          metadata = {
            title: filename.replace(/\.pdf$/i, ""),
            wordCount: countWords(text),
            charCount: text.length,
            pages: (docs as unknown[]).length || undefined,
          };
        } catch (error) {
          console.warn('PDF parsing failed (LangChain):', error);
          return { error: `Failed to parse PDF via LangChain: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
        break;
      }
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        // TODO: integrare mammoth.js per estrarre testo reale dai DOC/DOCX
        const content = buffer.toString("utf8");
        text = content;
        metadata = {
          title: filename.replace(/\.(doc|docx)$/i, ""),
          wordCount: countWords(content),
          charCount: content.length,
        };
        break;
      }
      default:
        return { error: `Unsupported file type: ${mimeType}` };
    }

    if (!text || text.trim().length === 0) {
      return { error: "No text content found in document" };
    }

    return {
      data: {
        text: text.trim(),
        metadata,
      },
    };
  } catch (error) {
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
