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
  console.log("🔧 REAL SOLUTION - Multi-strategy upload:", {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    userId: userId,
    userIdLength: userId?.length,
    userIdType: typeof userId,
  });

  // Check authentication
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  console.log("🔍 Authentication check:", {
    user: user?.id,
    providedUserId: userId,
    match: user?.id === userId,
    authError: authError?.message,
  });

  // Strategy 1: Presigned URL (primary)
  console.log("📋 Strategy 1: Trying Presigned URL...");
  const presignedResult = await uploadWithPresignedUrl(file, userId);
  if (!presignedResult.error) {
    console.log("✅ Strategy 1 (Presigned URL) succeeded!");
    return presignedResult;
  }

  console.log("❌ Strategy 1 failed:", presignedResult.error);

  // Strategy 2: Direct upload (fallback)
  console.log("📋 Strategy 2: Trying Direct Upload...");
  const directResult = await uploadFileDirectly(file, userId);
  if (!directResult.error) {
    console.log("✅ Strategy 2 (Direct Upload) succeeded!");
    return directResult;
  }

  console.log("❌ Strategy 2 failed:", directResult.error);

  // All strategies failed - return detailed error for diagnosis
  return {
    path: "",
    error: `Upload failed. Presigned URL: ${presignedResult.error}, Direct Upload: ${directResult.error}`,
  };
}

// Upload con Presigned URL - SOLUZIONE REALE per bypassare Storage API
async function uploadWithPresignedUrl(
  file: File,
  userId: string,
  attempt: number = 1
): Promise<{ path: string; error?: string }> {
  try {
    console.log(`🔗 Starting presigned URL upload (attempt ${attempt}/3):`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
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
    console.log("🔗 Creating presigned URL...");

    // Step 1: Create presigned URL for upload
    const { data: presignedData, error: presignedError } =
      await supabase.storage.from("documents").createSignedUploadUrl(filePath);

    if (presignedError) {
      console.error("❌ Presigned URL creation failed:", presignedError);
      return { path: "", error: presignedError.message };
    }

    console.log("✅ Presigned URL created:", presignedData.signedUrl);
    console.log("⏳ Starting direct upload to presigned URL...");

    // Calculate adaptive timeout based on file size and attempt
    // Base: 60s for small files, +30s per MB, +15s per retry attempt
    const baseMB = file.size / (1024 * 1024);
    const baseTimeout = 60000; // 60 seconds base
    const sizeTimeout = baseMB * 30000; // +30s per MB
    const retryBonus = (attempt - 1) * 15000; // +15s per retry
    const timeoutMs = Math.min(baseTimeout + sizeTimeout + retryBonus, 180000); // Max 3 minutes

    console.log(
      `⏰ Adaptive timeout: ${Math.round(
        timeoutMs
      )}ms (base: ${baseTimeout}ms, size: +${Math.round(
        sizeTimeout
      )}ms, retry: +${retryBonus}ms)`
    );

    // Step 2: Upload directly to presigned URL using fetch with timeout
    const uploadPromise = fetch(presignedData.signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
        "Content-Length": file.size.toString(),
      },
    });

    const timeoutPromise = new Promise<Response>((_, reject) =>
      setTimeout(
        () =>
          reject(new Error(`Upload timeout after ${Math.round(timeoutMs)}ms`)),
        timeoutMs
      )
    );

    console.log("🚀 Starting fetch race (upload vs timeout)...");
    const uploadResponse = await Promise.race([uploadPromise, timeoutPromise]);
    console.log("✅ Fetch completed, checking response...");

    if (!uploadResponse.ok) {
      console.error(
        "❌ Presigned URL upload failed:",
        uploadResponse.status,
        uploadResponse.statusText
      );

      // Retry on certain status codes or if it's the first attempt
      if (
        attempt < 3 &&
        (uploadResponse.status >= 500 ||
          uploadResponse.status === 408 ||
          uploadResponse.status === 0)
      ) {
        console.log(
          `🔄 Retrying upload (attempt ${attempt + 1}/3) due to status ${
            uploadResponse.status
          }...`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000 * attempt)); // Progressive delay: 3s, 6s
        return uploadWithPresignedUrl(file, userId, attempt + 1);
      }

      return {
        path: "",
        error: `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
      };
    }

    console.log("✅ Presigned URL upload successful!");
    return { path: filePath };
  } catch (error) {
    console.error("Presigned URL upload exception:", error);

    // Retry on timeout or network errors
    if (
      attempt < 3 &&
      error instanceof Error &&
      (error.message.includes("timeout") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Load failed"))
    ) {
      console.log(
        `🔄 Retrying upload (attempt ${attempt + 1}/3) due to error: ${
          error.message
        }`
      );
      await new Promise((resolve) => setTimeout(resolve, 3000 * attempt)); // Progressive delay: 3s, 6s
      return uploadWithPresignedUrl(file, userId, attempt + 1);
    }

    return {
      path: "",
      error: `Presigned URL upload failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Upload diretto senza FileReader - SOLUZIONE DEFINITIVA
async function uploadFileDirectly(
  file: File,
  userId: string,
  attempt: number = 1
): Promise<{ path: string; error?: string }> {
  try {
    console.log(`📦 Starting direct upload (attempt ${attempt}/3):`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
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
    console.log("⏳ Starting direct Supabase upload...");

    // Calculate adaptive timeout for Supabase client (it has internal timeout handling)
    const baseMB = file.size / (1024 * 1024);
    const expectedTimeMs = Math.max(30000, baseMB * 20000); // 30s base, +20s per MB
    console.log(
      `⏰ Expected upload time: ~${Math.round(
        expectedTimeMs / 1000
      )}s for ${baseMB.toFixed(2)}MB`
    );

    // Upload diretto del File object - NO FileReader!
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Direct upload error:", error);

      // Retry on certain errors
      if (
        attempt < 3 &&
        (error.message.includes("timeout") ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError") ||
          error.message.includes("Load failed") ||
          error.message.includes("Connection") ||
          (error as any).statusCode === 408 ||
          (error as any).statusCode === 500 ||
          (error as any).statusCode === 502 ||
          (error as any).statusCode === 503 ||
          (error as any).statusCode === 504)
      ) {
        console.log(
          `🔄 Retrying direct upload (attempt ${attempt + 1}/3) due to error: ${
            error.message
          }`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000 * attempt)); // Progressive delay: 3s, 6s
        return uploadFileDirectly(file, userId, attempt + 1);
      }

      return { path: "", error: error.message };
    }

    console.log("✅ Direct upload successful:", data);
    return { path: data.path };
  } catch (error) {
    console.error("Direct upload exception:", error);

    // Retry on network exceptions
    if (
      attempt < 3 &&
      error instanceof Error &&
      (error.message.includes("timeout") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Load failed") ||
        error.message.includes("Connection"))
    ) {
      console.log(
        `🔄 Retrying direct upload (attempt ${
          attempt + 1
        }/3) due to exception: ${error.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, 3000 * attempt)); // Progressive delay: 3s, 6s
      return uploadFileDirectly(file, userId, attempt + 1);
    }

    return {
      path: "",
      error: `Direct upload failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Test ultra-semplice: crea un file di testo senza leggere l'originale
async function uploadSimpleTextFile(
  originalFile: File,
  userId: string
): Promise<{ path: string; error?: string }> {
  try {
    console.log("🧪 Creating simple text file instead of reading original");

    const supabase = createClient();

    // Crea un file di testo semplice con info del file originale
    const textContent = `File Upload Test
Original File: ${originalFile.name}
Size: ${originalFile.size} bytes
Type: ${originalFile.type}
Uploaded: ${new Date().toISOString()}

This is a test file created to bypass file reading issues.
The original file could not be processed due to system restrictions.`;

    const textBlob = new Blob([textContent], { type: "text/plain" });

    // Generate unique filename
    const fileName = `test-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.txt`;
    const filePath = `${userId}/${fileName}`;

    console.log("📁 Upload path:", filePath);
    console.log("⏳ Starting simple text upload...");

    const { data, error } = await supabase.storage
      .from("documents")
      .upload(filePath, textBlob, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Simple text upload error:", error);
      return { path: "", error: error.message };
    }

    console.log("✅ Simple text upload successful:", data);
    return { path: data.path };
  } catch (error) {
    console.error("Simple text upload exception:", error);
    return { path: "", error: "Simple text upload failed" };
  }
}

// Base64 upload - aggira problemi con dati binari
async function uploadFileAsBase64(
  file: File,
  userId: string
): Promise<{ path: string; error?: string }> {
  try {
    console.log("📦 Starting Base64 upload:", {
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

    // Convert file to base64
    console.log("🔄 Converting file to Base64...");
    const base64Data = await fileToBase64(file);

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log("📁 Upload path:", filePath);
    console.log("⏳ Starting Base64 upload to Supabase...");

    // Create a JSON payload with base64 data
    const payload = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      base64Data: base64Data,
      uploadedAt: new Date().toISOString(),
    };

    const jsonBlob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });

    // Upload as JSON file
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(`${filePath}.json`, jsonBlob, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Base64 upload error:", error);
      return { path: "", error: error.message };
    }

    console.log("✅ Base64 upload successful:", data);
    return { path: data.path };
  } catch (error) {
    console.error("Base64 upload exception:", error);
    return { path: "", error: "Base64 upload failed" };
  }
}

// Helper function to convert File to Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:mime/type;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
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

    // Chunk configuration - ULTRA PICCOLI per test
    const CHUNK_SIZE = 8 * 1024; // 8KB per chunk (test estremo)
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

// Create document record in database via API route
export async function createDocument(
  document: DocumentInsert
): Promise<{ data?: Document; error?: string }> {
  try {
    const response = await fetch('/api/documents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: document.title,
        description: document.description,
        mimeType: document.mime_type,
        fileSize: document.file_size,
        storagePath: document.storage_path
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Create document error:", result.error);
      return { error: result.error };
    }

    return { data: result.document };
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
  chunks: DocumentChunkInsert[],
  supabaseClient?: any
): Promise<{ error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

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

// Get signed URL for file download - UPDATED for chunked and Base64 files
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

    // Check if it's a Base64 file
    if (path.endsWith(".json")) {
      // For Base64 files, we need to reconstruct the original file
      return reconstructBase64File(path);
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

// Reconstruct Base64 file for download
async function reconstructBase64File(
  jsonPath: string
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = createClient();

    // Download JSON file with Base64 data
    const { data: jsonFile, error: jsonError } = await supabase.storage
      .from("documents")
      .download(jsonPath);

    if (jsonError || !jsonFile) {
      return { error: "Failed to download Base64 JSON file" };
    }

    const jsonText = await jsonFile.text();
    const payload = JSON.parse(jsonText);

    console.log("🔄 Reconstructing Base64 file:", payload.fileName);

    // Convert Base64 back to binary
    const binaryString = atob(payload.base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob with original file type
    const reconstructedFile = new Blob([bytes], { type: payload.fileType });
    const fileUrl = URL.createObjectURL(reconstructedFile);

    console.log("✅ Base64 file reconstructed successfully");
    return { url: fileUrl };
  } catch (error) {
    console.error("Reconstruct Base64 file exception:", error);
    return { error: "Failed to reconstruct Base64 file" };
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
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
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
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return "📊"; // PowerPoint icon
    default:
      return "📄";
  }
}
