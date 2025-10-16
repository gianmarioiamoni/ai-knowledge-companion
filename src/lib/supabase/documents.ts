import { createClient } from "@/lib/supabase/client";
import {
  Document,
  DocumentChunk,
  DocumentUpload,
  SupportedMimeType,
  MAX_FILE_SIZE,
} from "@/types/documents";

// Create a single Supabase client instance
const supabase = createClient();

// Upload file to Supabase Storage
export async function uploadFile(
  file: File,
  userId: string
): Promise<{ path: string; error?: string }> {
  try {
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

    const { data, error } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { path: "", error: error.message };
    }

    return { path: data.path };
  } catch (error) {
    console.error("Upload exception:", error);
    return { path: "", error: "Upload failed" };
  }
}

// Create document record in database
export async function createDocument(
  document: Omit<Document, "id" | "created_at" | "updated_at">
): Promise<{ data?: Document; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("documents")
      .insert([document])
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
  chunks: Omit<DocumentChunk, "id" | "created_at">[]
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.from("document_chunks").insert(chunks);

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
