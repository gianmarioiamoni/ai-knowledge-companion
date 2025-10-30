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
          // Approccio semplificato: estrai testo grezzo dal PDF
          // Usa 'latin1' encoding per evitare errori Unicode
          const pdfText = buffer.toString('latin1');
          
          // Cerca pattern di testo comuni nei PDF
          const textMatches = pdfText.match(/\([^)]+\)/g);
          if (textMatches && textMatches.length > 0) {
            text = textMatches
              .map(match => {
                try {
                  // Prova a decodificare il testo
                  const content = match.slice(1, -1); // Rimuovi parentesi
                  // Gestisci escape sequences comuni
                  return content
                    .replace(/\\n/g, ' ')
                    .replace(/\\r/g, ' ')
                    .replace(/\\t/g, ' ')
                    .replace(/\\\\/g, '\\')
                    .replace(/\\\(/g, '(')
                    .replace(/\\\)/g, ')')
                    .replace(/\\\//g, '/')
                    .replace(/\\\s/g, ' ')
                    .replace(/\\([0-9]{3})/g, (match, code) => {
                      // Decodifica codici ottali
                      try {
                        return String.fromCharCode(parseInt(code, 8));
                      } catch {
                        return match;
                      }
                    });
                } catch (decodeError) {
                  console.warn('Error decoding PDF text:', decodeError);
                  return match.slice(1, -1); // Fallback: rimuovi solo parentesi
                }
              })
              .filter(t => t.length > 2) // Filtra stringhe troppo corte
              .join(' ');
          } else {
            // Fallback: cerca pattern di testo più generici
            const fallbackMatches = pdfText.match(/[A-Za-z][A-Za-z0-9\s,.-]{5,}/g);
            text = fallbackMatches ? fallbackMatches.join(' ') : '';
          }
          
          // Pulisci il testo finale
          text = text
            .replace(/\s+/g, ' ') // Normalizza spazi
            .replace(/[^\x20-\x7E]/g, ' ') // Rimuovi caratteri non stampabili
            .trim();
          
          metadata = {
            title: filename.replace(/\.pdf$/i, ""),
            wordCount: countWords(text),
            charCount: text.length,
            pages: undefined, // Non disponibile con questo metodo
          };
        } catch (error) {
          console.warn('PDF parsing failed:', error);
          // Fallback: prova con encoding diverso
          try {
            const pdfText = buffer.toString('ascii');
            const fallbackMatches = pdfText.match(/[A-Za-z][A-Za-z0-9\s,.-]{5,}/g);
            text = fallbackMatches ? fallbackMatches.join(' ') : '';
            metadata = {
              title: filename.replace(/\.pdf$/i, ""),
              wordCount: countWords(text),
              charCount: text.length,
              pages: undefined,
            };
          } catch (fallbackError) {
            console.warn('PDF fallback parsing also failed:', fallbackError);
            text = '';
            metadata = {
              title: filename.replace(/\.pdf$/i, ""),
              wordCount: 0,
              charCount: 0,
              pages: undefined,
            };
          }
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
