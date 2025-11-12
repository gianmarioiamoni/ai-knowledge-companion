/**
 * Document Parser - Estrae testo da diversi formati di file usando LangChain
 * 
 * Tutti i formati supportati utilizzano LangChain loaders per consistenza:
 * - TXT/MD: TextLoader
 * - PDF: WebPDFLoader
 * - DOC/DOCX: DocxLoader
 * - PPTX: PPTXLoader
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
        const docResult = await parseDocFile(file);
        text = docResult.text;
        metadata = docResult.metadata;
        break;

      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        const pptxResult = await parsePPTXFile(file);
        text = pptxResult.text;
        metadata = pptxResult.metadata;
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
        try {
          // TODO: Re-enable LangChain loaders after fixing import paths (Issue #fix-1)
          // Temporary: LangChain disabled, using fallback parser
          throw new Error('LangChain temporarily disabled - using fallback');
        } catch (error) {
          console.warn('TXT/MD parsing (using fallback):', error instanceof Error ? error.message : 'Unknown error');
          // Fallback to simple parsing (always used now)
          const content = buffer.toString("utf8");
          text = content;
          metadata = {
            title: filename.replace(/\.(txt|md)$/i, ""),
            wordCount: countWords(content),
            charCount: content.length,
          };
        }
        break;
      }
      case "application/pdf": {
        try {
          const { WebPDFLoader } = await import("@langchain/community/document_loaders/web/pdf");
          
          const blob = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
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
        try {
          const { DocxLoader } = await import("@langchain/community/document_loaders/fs/docx");
          
          const blob = new Blob([new Uint8Array(buffer)], { 
            type: mimeType 
          });
          
          const loaderOptions = mimeType === "application/msword" 
            ? { type: "doc" as const }
            : { type: "docx" as const };
          
          const loader = new DocxLoader(blob, loaderOptions);
          const docs = await loader.load();
          const combined = docs
            .map((d: { pageContent?: string }) => (d.pageContent || "").trim())
            .filter(Boolean)
            .join("\n\n");

          text = combined;
          metadata = {
            title: filename.replace(/\.(doc|docx)$/i, ""),
            wordCount: countWords(text),
            charCount: text.length,
          };
        } catch (error) {
          console.warn('DOC/DOCX parsing failed (LangChain):', error);
          return { error: `Failed to parse DOC/DOCX via LangChain: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
        break;
      }
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
        try {
          const { PPTXLoader } = await import("@langchain/community/document_loaders/fs/pptx");
          
          const blob = new Blob([new Uint8Array(buffer)], { 
            type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" 
          });
          
          const loader = new PPTXLoader(blob);
          const docs = await loader.load();
          const combined = docs
            .map((d: { pageContent?: string }) => (d.pageContent || "").trim())
            .filter(Boolean)
            .join("\n\n");

          text = combined;
          metadata = {
            title: filename.replace(/\.pptx$/i, ""),
            wordCount: countWords(text),
            charCount: text.length,
            pages: (docs as unknown[]).length || undefined, // Numero di slide
          };
        } catch (error) {
          console.warn('PPTX parsing failed (LangChain):', error);
          return { error: `Failed to parse PPTX via LangChain: ${error instanceof Error ? error.message : 'Unknown error'}` };
        }
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
 * Parsa file di testo (.txt, .md) usando LangChain TextLoader
 */
async function parseTextFile(file: File): Promise<ParsedDocument> {
  try {
    // TODO: Re-enable LangChain loaders (Issue #fix-1)
    throw new Error('File-based text parsing temporarily disabled');
    // const { TextLoader } = await import("@langchain/community/document_loaders/fs/text");
    
    const loader = new TextLoader(file);
    const docs = await loader.load();
    const text = docs
      .map((d: { pageContent?: string }) => (d.pageContent || "").trim())
      .filter(Boolean)
      .join("\n\n");

    return {
      text,
      metadata: {
        title: file.name.replace(/\.(txt|md)$/i, ""),
        wordCount: countWords(text),
        charCount: text.length,
      },
    };
  } catch (error) {
    console.warn("TXT/MD parsing failed (LangChain), using fallback:", error);
    // Fallback to simple text reading
    const text = await file.text();
    return {
      text,
      metadata: {
        title: file.name.replace(/\.(txt|md)$/i, ""),
        wordCount: countWords(text),
        charCount: text.length,
      },
    };
  }
}


/**
 * Parsa file PPTX usando LangChain PPTXLoader
 */
async function parsePPTXFile(file: File): Promise<ParsedDocument> {
  try {
    // TODO: Re-enable LangChain loaders (Issue #fix-1)
    throw new Error('File-based PPTX parsing temporarily disabled');
    // const { PPTXLoader } = await import("@langchain/community/document_loaders/fs/pptx");
    
    const loader = new PPTXLoader(file);
    const docs = await loader.load();
    const text = docs
      .map((d: { pageContent?: string }) => (d.pageContent || "").trim())
      .filter(Boolean)
      .join("\n\n");

    return {
      text,
      metadata: {
        title: file.name.replace(/\.pptx$/i, ""),
        wordCount: countWords(text),
        charCount: text.length,
        pages: (docs as unknown[]).length || undefined, // Numero di slide
      },
    };
  } catch (error) {
    console.error("Failed to parse PPTX file:", error);
    throw new Error(`Failed to parse PPTX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parsa file DOC/DOCX usando LangChain DocxLoader
 */
async function parseDocFile(file: File): Promise<ParsedDocument> {
  try {
    // TODO: Re-enable LangChain loaders (Issue #fix-1)
    throw new Error('File-based DOCX parsing temporarily disabled');
    // const { DocxLoader } = await import("@langchain/community/document_loaders/fs/docx");
    
    // Determina il tipo di file
    const isDoc = file.name.toLowerCase().endsWith('.doc');
    const loaderOptions = isDoc 
      ? { type: "doc" as const }
      : { type: "docx" as const };
    
    const loader = new DocxLoader(file, loaderOptions);
    const docs = await loader.load();
    const text = docs
      .map((d: { pageContent?: string }) => (d.pageContent || "").trim())
      .filter(Boolean)
      .join("\n\n");

    return {
      text,
      metadata: {
        title: file.name.replace(/\.(doc|docx)$/i, ""),
        wordCount: countWords(text),
        charCount: text.length,
      },
    };
  } catch (error) {
    console.error("Failed to parse DOC/DOCX file:", error);
    throw new Error(`Failed to parse DOC/DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
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
