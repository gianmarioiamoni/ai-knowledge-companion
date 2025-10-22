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
    console.log("📦 Large file detected, using chunked upload strategy");
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

    const { data, error } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

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
    console.log(
      `🔢 File will be split into ${totalChunks} chunks of ${
        CHUNK_SIZE / 1024
      }KB each`
    );

    // Upload chunks sequentially
    const uploadedChunks: string[] = [];

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const chunkPath = `${filePath}.chunk.${chunkIndex
        .toString()
        .padStart(4, "0")}`;

      console.log(
        `📤 Uploading chunk ${chunkIndex + 1}/${totalChunks} (${
          chunk.size
        } bytes)`
      );

      try {
        const { data, error } = await supabase.storage
          .from("documents")
          .upload(chunkPath, chunk, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error(`❌ Chunk ${chunkIndex + 1} failed:`, error);

          // Cleanup uploaded chunks
          console.log("🧹 Cleaning up uploaded chunks...");
          for (const uploadedChunk of uploadedChunks) {
            await supabase.storage.from("documents").remove([uploadedChunk]);
          }

          return { path: "", error: `Chunk upload failed: ${error.message}` };
        }

        uploadedChunks.push(data.path);
        console.log(
          `✅ Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`
        );

        // Small delay between chunks to avoid overwhelming
        if (chunkIndex < totalChunks - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (err) {
        console.error(`❌ Chunk ${chunkIndex + 1} exception:`, err);

        // Cleanup uploaded chunks
        console.log("🧹 Cleaning up uploaded chunks...");
        for (const uploadedChunk of uploadedChunks) {
          await supabase.storage.from("documents").remove([uploadedChunk]);
        }

        return { path: "", error: "Chunk upload failed" };
      }
    }

    console.log("✅ All chunks uploaded successfully!");

    // Now we need to reconstruct the file
    // For now, we'll create a metadata file that references all chunks
    const metadata = {
      originalFileName: file.name,
      originalSize: file.size,
      chunks: uploadedChunks,
      totalChunks: totalChunks,
      chunkSize: CHUNK_SIZE,
      uploadedAt: new Date().toISOString(),
    };

    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: "application/json",
    });

    const metadataPath = `${filePath}.metadata`;
    const { data: metadataData, error: metadataError } = await supabase.storage
      .from("documents")
      .upload(metadataPath, metadataBlob, {
        cacheControl: "3600",
        upsert: false,
      });

    if (metadataError) {
      console.error("❌ Metadata upload failed:", metadataError);

      // Cleanup chunks
      console.log("🧹 Cleaning up chunks due to metadata failure...");
      for (const uploadedChunk of uploadedChunks) {
        await supabase.storage.from("documents").remove([uploadedChunk]);
      }

      return { path: "", error: "Metadata upload failed" };
    }

    console.log("✅ Chunked upload completed successfully!");

    // Return the metadata path as the "file" path
    // The download process will need to reconstruct from chunks
    return { path: metadataData.path };
  } catch (error) {
    console.error("Chunked upload exception:", error);
    return { path: "", error: "Chunked upload failed" };
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

    // Check if it's a chunked file (has .metadata extension)
    if (document.storage_path.endsWith(".metadata")) {
      // Get metadata to find all chunks
      const { data: metadataFile, error: metadataError } =
        await supabase.storage
          .from("documents")
          .download(document.storage_path);

      if (!metadataError && metadataFile) {
        const metadataText = await metadataFile.text();
        const metadata = JSON.parse(metadataText);

        // Delete all chunks
        console.log("🧹 Deleting chunked file parts...");
        const chunksToDelete = [...metadata.chunks, document.storage_path];
        const { error: chunksError } = await supabase.storage
          .from("documents")
          .remove(chunksToDelete);

        if (chunksError) {
          console.error("Storage delete chunks error:", chunksError);
        }
      }
    } else {
      // Regular file deletion
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([document.storage_path]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }
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

// Get signed URL for file download - UPDATED for chunked files
export async function getFileUrl(
  path: string
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = createClient();

    // Check if it's a chunked file
    if (path.endsWith(".metadata")) {
      // For chunked files, we need to reconstruct the file
      return reconstructChunkedFile(path);
    }

    // Regular file download
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

// Reconstruct chunked file for download
async function reconstructChunkedFile(
  metadataPath: string
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = createClient();

    // Download metadata
    const { data: metadataFile, error: metadataError } = await supabase.storage
      .from("documents")
      .download(metadataPath);

    if (metadataError || !metadataFile) {
      return { error: "Failed to download metadata" };
    }

    const metadataText = await metadataFile.text();
    const metadata = JSON.parse(metadataText);

    console.log("🔄 Reconstructing chunked file:", metadata.originalFileName);

    // Download all chunks
    const chunkBlobs: Blob[] = [];
    for (let i = 0; i < metadata.totalChunks; i++) {
      const chunkPath = metadata.chunks[i];
      const { data: chunkFile, error: chunkError } = await supabase.storage
        .from("documents")
        .download(chunkPath);

      if (chunkError || !chunkFile) {
        return { error: `Failed to download chunk ${i + 1}` };
      }

      chunkBlobs.push(chunkFile);
    }

    // Reconstruct the original file
    const reconstructedFile = new Blob(chunkBlobs);
    const fileUrl = URL.createObjectURL(reconstructedFile);

    console.log("✅ File reconstructed successfully");
    return { url: fileUrl };
  } catch (error) {
    console.error("Reconstruct chunked file exception:", error);
    return { error: "Failed to reconstruct file" };
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
