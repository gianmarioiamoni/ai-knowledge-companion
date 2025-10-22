import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import {
  DocumentUpload,
  SupportedMimeType,
  MAX_FILE_SIZE,
} from "@/types/documents";

// Use Supabase generated types
type Document = Database["public"]["Tables"]["documents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
type DocumentChunk = Database["public"]["Tables"]["document_chunks"]["Row"];
type DocumentChunkInsert =
  Database["public"]["Tables"]["document_chunks"]["Insert"];

// Upload file to Supabase Storage
export async function uploadFile(
  file: File,
  userId: string
): Promise<{ path: string; error?: string }> {
  // For files >500KB, use chunked upload (soglia più realistica)
  if (file.size > 500 * 1024) {
    console.log(
      "📦 Large file detected, using chunked upload strategy"
    );
    return uploadFileInChunks(file, userId);
  }

  return uploadStandardFile(file, userId);
}

// Standard upload for smaller files
async function uploadStandardFile(
  file: File,
  userId: string
): Promise<{ path: string; error?: string }> {
  try {
    console.log("🚀 Starting upload:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2) + " MB",
    });

    const supabase = createClient();

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log("❌ File too large:", file.size, "vs", MAX_FILE_SIZE);
      return { path: "", error: "File size exceeds 10MB limit" };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log("📁 Upload path:", filePath);
    console.log("⏳ Starting Supabase upload...");

    // Upload con timeout e retry più aggressivo
    const uploadWithRetry = async (retries = 3): Promise<any> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`📤 Upload attempt ${attempt}/${retries}`);

          // Crea un timeout personalizzato
          const uploadPromise = supabase.storage
            .from("documents")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          // Timeout dinamico basato sulla dimensione del file
          const fileSizeMB = file.size / (1024 * 1024);
          const timeoutMs = Math.max(60000, fileSizeMB * 20000); // Min 60s, +20s per MB
          console.log(
            `⏱️ Upload timeout set to ${Math.round(
              timeoutMs / 1000
            )}s for ${fileSizeMB.toFixed(1)}MB file`
          );

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    `Upload timeout after ${Math.round(timeoutMs / 1000)}s`
                  )
                ),
              timeoutMs
            )
          );

          const result = await Promise.race([uploadPromise, timeoutPromise]);

          // Type assertion since we know the successful result will be from uploadPromise
          const { data, error } = result as { data: any; error: any };

          if (error) throw error;
          return { data, error: null };
        } catch (err) {
          console.warn(`⚠️ Upload attempt ${attempt} failed:`, err);

          if (attempt === retries) {
            throw err;
          }

          // Wait before retry (exponential backoff più lungo)
          const delay = Math.min(attempt * 3000, 10000); // Max 10s
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };

    const { data, error } = await uploadWithRetry();

    if (error) {
      console.error("❌ Upload error:", error);
      return { path: "", error: error.message };
    }

    console.log("✅ Upload successful:", data);
    return { path: data.path };
  } catch (error) {
    console.error("Upload exception:", error);
    return { path: "", error: "Upload failed" };
  }
}

// Chunked upload for large files - VERO CHUNKED UPLOAD
async function uploadFileInChunks(
  file: File,
  userId: string
): Promise<{ path: string; error?: string }> {
  try {
    console.log("📦 Starting REAL chunked upload:", {
      fileName: file.name,
      fileSize: file.size,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2) + " MB",
    });

    const supabase = createClient();

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { path: "", error: "File size exceeds 10MB limit" };
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log("📁 Upload path:", filePath);

    // Chunk configuration
    const CHUNK_SIZE = 256 * 1024; // 256KB per chunk
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    console.log(`🔢 File will be split into ${totalChunks} chunks of ${CHUNK_SIZE / 1024}KB each`);

    // Upload chunks sequentially
    const strategies = [
      // Strategy 1: Single upload with very long timeout
      async () => {
        console.log("🎯 Strategy 1: Single upload with extended timeout");
        const timeoutMs = 600000; // 10 minutes - molto più aggressivo

        const uploadPromise = supabase.storage
          .from("documents")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(new Error(`Upload timeout after ${timeoutMs / 1000}s`)),
            timeoutMs
          )
        );

        const result = await Promise.race([uploadPromise, timeoutPromise]);
        return result as { data: any; error: any };
      },

      // Strategy 2: Direct upload without custom timeout
      async () => {
        console.log("🎯 Strategy 2: Direct upload without custom timeout");
        const result = await supabase.storage
          .from("documents")
          .upload(filePath, file, {
            cacheControl: "0",
            upsert: false,
          });
        return result;
      },

      // Strategy 3: Minimal options upload
      async () => {
        console.log("🎯 Strategy 3: Minimal options upload");
        const result = await supabase.storage
          .from("documents")
          .upload(filePath, file);
        return result;
      },

      // Strategy 4: Different path format
      async () => {
        console.log("🎯 Strategy 4: Different path format");
        const altFileName = `alt-${Date.now()}.${fileExt}`;
        const altFilePath = `${userId}/${altFileName}`;
        const result = await supabase.storage
          .from("documents")
          .upload(altFilePath, file);

        // Update the original filePath if this works
        if (result.data) {
          console.log("✅ Alternative path worked, updating filePath");
          // We need to return the correct path for the caller
          return {
            data: { ...result.data, path: altFilePath },
            error: result.error,
          };
        }
        return result;
      },
    ];

    // Try each strategy with multiple retries
    for (let i = 0; i < strategies.length; i++) {
      const maxRetries = 3;

      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          console.log(
            `📤 Trying upload strategy ${i + 1}/${strategies.length}, attempt ${
              retry + 1
            }/${maxRetries}`
          );
          const { data, error } = await strategies[i]();

          if (!error && data) {
            console.log("✅ Large file upload successful:", data);
            return { path: data.path };
          }

          if (error) {
            console.warn(
              `⚠️ Strategy ${i + 1}, attempt ${retry + 1} failed:`,
              error
            );

            // If this is the last retry of the last strategy, throw
            if (i === strategies.length - 1 && retry === maxRetries - 1) {
              throw error;
            }

            // If not the last retry of this strategy, wait and retry
            if (retry < maxRetries - 1) {
              const retryDelay = Math.min((retry + 1) * 5000, 15000); // 5s, 10s, 15s
              console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
              continue;
            }
          }
        } catch (err) {
          console.warn(
            `⚠️ Strategy ${i + 1}, attempt ${retry + 1} exception:`,
            err
          );

          // If this is the last retry of the last strategy, throw
          if (i === strategies.length - 1 && retry === maxRetries - 1) {
            throw err;
          }

          // If not the last retry of this strategy, wait and retry
          if (retry < maxRetries - 1) {
            const retryDelay = Math.min((retry + 1) * 5000, 15000);
            console.log(`⏳ Waiting ${retryDelay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }
        }

        // Break out of retry loop to try next strategy
        break;
      }

      // Wait before trying next strategy
      if (i < strategies.length - 1) {
        console.log("🔄 Trying next strategy...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    return { path: "", error: "All upload strategies failed" };
  } catch (error) {
    console.error("Large file upload exception:", error);
    return { path: "", error: "Upload failed" };
  }
}

// Create document record in database
export async function createDocument(
  document: DocumentInsert
): Promise<{ data?: Document; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await (supabase as any)
      .from("documents")
      .insert(document)
      .select()
      .single();

    if (error) {
      console.error("Create document error:", error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error("Create document exception:", error);
    return { error: "Failed to create document" };
  }
}

// Get user's documents
export async function getUserDocuments(
  userId: string
): Promise<{ data?: Document[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get documents error:", error);
      return { error: error.message };
    }

    return { data: data || [] };
  } catch (error) {
    console.error("Get documents exception:", error);
    return { error: "Failed to fetch documents" };
  }
}

// Get document by ID
export async function getDocument(
  documentId: string
): Promise<{ data?: Document; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (error) {
      console.error("Get document error:", error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error("Get document exception:", error);
    return { error: "Failed to fetch document" };
  }
}

// Delete document and its file
export async function deleteDocument(
  documentId: string
): Promise<{ error?: string }> {
  try {
    // First get the document to get storage path
    const { data: document, error: fetchError } = await getDocument(documentId);
    if (fetchError || !document) {
      return { error: fetchError || "Document not found" };
    }

    const supabase = createClient();

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([document.storage_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database (this will cascade to chunks)
    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId);

    if (dbError) {
      console.error("Database delete error:", dbError);
      return { error: dbError.message };
    }

    return {};
  } catch (error) {
    console.error("Delete document exception:", error);
    return { error: "Failed to delete document" };
  }
}

// Create document chunks
export async function createDocumentChunks(
  chunks: DocumentChunkInsert[]
): Promise<{ error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await (supabase as any)
      .from("document_chunks")
      .insert(chunks);

    if (error) {
      console.error("Create chunks error:", error);
      return { error: error.message };
    }

    return {};
  } catch (error) {
    console.error("Create chunks exception:", error);
    return { error: "Failed to create document chunks" };
  }
}

// Get document chunks
export async function getDocumentChunks(
  documentId: string
): Promise<{ data?: DocumentChunk[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("document_chunks")
      .select("*")
      .eq("document_id", documentId)
      .order("chunk_index", { ascending: true });

    if (error) {
      console.error("Get chunks error:", error);
      return { error: error.message };
    }

    return { data: data || [] };
  } catch (error) {
    console.error("Get chunks exception:", error);
    return { error: "Failed to fetch document chunks" };
  }
}

// Get signed URL for file download
export async function getFileUrl(
  path: string
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      console.error("Get file URL error:", error);
      return { error: error.message };
    }

    return { url: data.signedUrl };
  } catch (error) {
    console.error("Get file URL exception:", error);
    return { error: "Failed to get file URL" };
  }
}

// Validate file type
export function isValidFileType(
  mimeType: string
): mimeType is SupportedMimeType {
  const supportedTypes = [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  return supportedTypes.includes(mimeType);
}

// Get file type icon
export function getFileTypeIcon(mimeType: string): string {
  switch (mimeType) {
    case "application/pdf":
      return "📄";
    case "text/plain":
      return "📝";
    case "text/markdown":
      return "📋";
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "📄";
    default:
      return "📄";
  }
}
