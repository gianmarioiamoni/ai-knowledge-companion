/**
 * Multimedia Service - Supabase operations for audio/video/images
 * Sprint 5: Audio/Video/Image support for tutors
 */

import { createClient } from "@/lib/supabase/client";
import type {
  MultimediaDocument,
  MediaType,
  ProcessingJob,
  TutorMultimediaItem,
  MultimediaStats,
  ProcessingStatus,
  TranscriptionStatus,
} from "@/types/multimedia";
import type { Database } from "@/types/database";

type MediaProcessingQueueInsert =
  Database["public"]["Tables"]["media_processing_queue"]["Insert"];
type TutorMultimediaInsert =
  Database["public"]["Tables"]["tutor_multimedia"]["Insert"];

// =====================================================
// Upload Operations
// =====================================================

/**
 * Upload a multimedia file to appropriate bucket
 */
export async function uploadMultimediaFile(
  file: File,
  userId: string,
  mediaType: MediaType,
  supabaseClient?: any
): Promise<{ path: string; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    // Determine bucket based on media type
    const bucket = getBucketForMediaType(mediaType);

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log(`📦 Uploading ${mediaType} file:`, {
      fileName: file.name,
      size: file.size,
      bucket,
      path: filePath,
    });

    // Upload file directly (works better with user-level RLS)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      return { path: "", error: uploadError.message };
    }

    console.log("✅ Upload successful:", filePath);
    return { path: filePath };
  } catch (error) {
    console.error("Upload exception:", error);
    return {
      path: "",
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Get bucket name for media type
 */
function getBucketForMediaType(mediaType: MediaType): string {
  switch (mediaType) {
    case "audio":
      return "audio";
    case "video":
      return "videos";
    case "image":
      return "images";
    default:
      return "documents";
  }
}

// =====================================================
// Document Operations
// =====================================================

/**
 * Create a multimedia document record
 */
export async function createMultimediaDocument(
  data: {
    userId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
    mediaType: MediaType;
    durationSeconds?: number;
    width?: number;
    height?: number;
  },
  supabaseClient?: any
): Promise<{ document?: MultimediaDocument; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        owner_id: data.userId,
        title: data.fileName,
        file_size: data.fileSize,
        mime_type: data.mimeType,
        storage_path: data.storagePath,
        media_type: data.mediaType,
        duration_seconds: data.durationSeconds,
        width: data.width,
        height: data.height,
        status: "processing",
        transcription_status: "pending",
        visibility: "private",
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Document creation error:", error);
      return { error: error.message };
    }

    return {
      document: {
        ...document,
        chunksCount: 0,
        createdAt: document.created_at,
        updatedAt: document.updated_at,
        userId: document.owner_id,
        fileName: document.title,
        fileSize: document.file_size || 0,
        storagePath: document.storage_path,
        mediaType: document.media_type,
        transcriptionStatus: document.transcription_status,
        mimeType: document.mime_type,
      } as MultimediaDocument,
    };
  } catch (error) {
    console.error("Document creation exception:", error);
    return {
      error: error instanceof Error ? error.message : "Document creation failed",
    };
  }
}

/**
 * Get multimedia documents for user
 */
export async function getUserMultimediaDocuments(
  userId: string,
  mediaType?: MediaType,
  supabaseClient?: any
): Promise<{ documents: MultimediaDocument[]; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    let query = supabase
      .from("documents")
      .select("*, document_chunks(count)")
      .eq("owner_id", userId)
      .in("media_type", mediaType ? [mediaType] : ["audio", "video", "image"])
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("❌ Fetch documents error:", error);
      return { documents: [], error: error.message };
    }

    const documents: MultimediaDocument[] = data.map((doc: any) => ({
      id: doc.id,
      userId: doc.owner_id,
      fileName: doc.title,
      fileSize: doc.file_size || 0,
      mimeType: doc.mime_type,
      storagePath: doc.storage_path,
      mediaType: doc.media_type,
      durationSeconds: doc.duration_seconds,
      width: doc.width,
      height: doc.height,
      thumbnailUrl: doc.thumbnail_url,
      transcriptionStatus: doc.transcription_status,
      transcriptionText: doc.transcription_text,
      transcriptionCost: doc.transcription_cost,
      chunksCount: doc.document_chunks?.[0]?.count || 0,
      status: doc.status,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      processedAt: doc.updated_at,
    }));

    return { documents };
  } catch (error) {
    console.error("Fetch documents exception:", error);
    return {
      documents: [],
      error: error instanceof Error ? error.message : "Failed to fetch documents",
    };
  }
}

/**
 * Update document transcription status
 */
export async function updateDocumentTranscription(
  documentId: string,
  data: {
    transcriptionStatus: TranscriptionStatus;
    transcriptionText?: string;
    transcriptionCost?: number;
  },
  supabaseClient?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    const { error } = await supabase
      .from("documents")
      .update({
        transcription_status: data.transcriptionStatus,
        transcription_text: data.transcriptionText,
        transcription_cost: data.transcriptionCost,
        status:
          data.transcriptionStatus === "completed"
            ? "ready"
            : data.transcriptionStatus === "failed"
              ? "error"
              : "processing",
      })
      .eq("id", documentId);

    if (error) {
      console.error("❌ Update transcription error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Update transcription exception:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update transcription",
    };
  }
}

/**
 * Delete multimedia document
 */
export async function deleteMultimediaDocument(
  documentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // First get document to know storage path and media type
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("storage_path, media_type")
      .eq("id", documentId)
      .eq("owner_id", userId)
      .single();

    if (fetchError || !document) {
      return { success: false, error: "Document not found" };
    }

    // Delete from storage
    const bucket = getBucketForMediaType(document.media_type as MediaType);
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([document.storage_path]);

    if (storageError) {
      console.warn("⚠️  Storage delete warning:", storageError);
      // Continue anyway - document may have already been deleted
    }

    // Delete from database (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("owner_id", userId);

    if (deleteError) {
      console.error("❌ Delete document error:", deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Delete document exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}

// =====================================================
// Processing Queue Operations
// =====================================================

/**
 * Queue multimedia file for processing
 */
export async function queueMultimediaProcessing(
  documentId: string,
  userId: string,
  mediaType: MediaType,
  supabaseClient?: any
): Promise<{ queueId?: string; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    const queueData: MediaProcessingQueueInsert = {
      document_id: documentId,
      user_id: userId,
      media_type: mediaType,
      status: "queued",
      progress_percent: 0,
      retry_count: 0,
      max_retries: 3,
    };

    const { data, error } = await supabase
      .from("media_processing_queue")
      .insert(queueData)
      .select()
      .single();

    if (error) {
      console.error("❌ Queue creation error:", error);
      return { error: error.message };
    }

    console.log("✅ Processing queued:", data.id);
    return { queueId: data.id };
  } catch (error) {
    console.error("Queue creation exception:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to queue processing",
    };
  }
}

/**
 * Get processing job status
 */
export async function getProcessingStatus(
  queueId?: string,
  documentId?: string
): Promise<{ job?: ProcessingJob; error?: string }> {
  try {
    const supabase = createClient();

    let query = supabase.from("media_processing_queue").select("*");

    if (queueId) {
      query = query.eq("id", queueId);
    } else if (documentId) {
      query = query.eq("document_id", documentId);
    } else {
      return { error: "Either queueId or documentId is required" };
    }

    const { data, error } = await query.single();

    if (error) {
      console.error("❌ Fetch queue status error:", error);
      return { error: error.message };
    }

    const job: ProcessingJob = {
      queueId: data.id,
      documentId: data.document_id,
      userId: data.user_id,
      mediaType: data.media_type as MediaType,
      status: data.status as ProcessingStatus,
      progressPercent: data.progress_percent,
      errorMessage: data.error_message || undefined,
      retryCount: data.retry_count,
      createdAt: data.created_at,
      startedAt: data.processing_started_at || undefined,
      completedAt: data.processing_completed_at || undefined,
    };

    return { job };
  } catch (error) {
    console.error("Fetch queue status exception:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch status",
    };
  }
}

/**
 * Update processing job status (used by background workers)
 */
export async function updateProcessingJobStatus(
  queueId: string,
  status: ProcessingStatus,
  progressPercent?: number,
  errorMessage?: string,
  supabaseClient?: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (progressPercent !== undefined) {
      updateData.progress_percent = progressPercent;
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    if (status === "processing" && !updateData.processing_started_at) {
      updateData.processing_started_at = new Date().toISOString();
    }

    if (["completed", "failed", "cancelled"].includes(status)) {
      updateData.processing_completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("media_processing_queue")
      .update(updateData)
      .eq("id", queueId);

    if (error) {
      console.error("❌ Update queue status error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Update queue status exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

// =====================================================
// Tutor Association Operations
// =====================================================

/**
 * Associate multimedia with tutor
 */
export async function associateMultimediaWithTutor(
  tutorId: string,
  documentIds: string[]
): Promise<{ success: boolean; associated: number; error?: string }> {
  try {
    const supabase = createClient();

    // Get current max display order
    const { data: existing } = await supabase
      .from("tutor_multimedia")
      .select("display_order")
      .eq("tutor_id", tutorId)
      .order("display_order", { ascending: false })
      .limit(1);

    let startOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0;

    // Insert associations
    const associations: TutorMultimediaInsert[] = documentIds.map(
      (documentId, index) => ({
        tutor_id: tutorId,
        document_id: documentId,
        display_order: startOrder + index,
      })
    );

    const { data, error } = await supabase
      .from("tutor_multimedia")
      .insert(associations)
      .select();

    if (error) {
      console.error("❌ Associate multimedia error:", error);
      return { success: false, associated: 0, error: error.message };
    }

    return { success: true, associated: data.length };
  } catch (error) {
    console.error("Associate multimedia exception:", error);
    return {
      success: false,
      associated: 0,
      error:
        error instanceof Error
          ? error.message
          : "Failed to associate multimedia",
    };
  }
}

/**
 * Get multimedia for tutor
 */
export async function getTutorMultimedia(
  tutorId: string
): Promise<{ items: TutorMultimediaItem[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("tutor_multimedia")
      .select(
        `
        *,
        documents:document_id (*)
      `
      )
      .eq("tutor_id", tutorId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("❌ Fetch tutor multimedia error:", error);
      return { items: [], error: error.message };
    }

    const items: TutorMultimediaItem[] = data.map((item: any) => ({
      id: item.id,
      tutorId: item.tutor_id,
      documentId: item.document_id,
      displayOrder: item.display_order,
      createdAt: item.created_at,
      document: {
        id: item.documents.id,
        userId: item.documents.owner_id,
        fileName: item.documents.title,
        fileSize: item.documents.file_size || 0,
        mimeType: item.documents.mime_type,
        storagePath: item.documents.storage_path,
        mediaType: item.documents.media_type,
        durationSeconds: item.documents.duration_seconds,
        width: item.documents.width,
        height: item.documents.height,
        thumbnailUrl: item.documents.thumbnail_url,
        transcriptionStatus: item.documents.transcription_status,
        transcriptionText: item.documents.transcription_text,
        transcriptionCost: item.documents.transcription_cost,
        chunksCount: 0,
        status: item.documents.status,
        createdAt: item.documents.created_at,
        updatedAt: item.documents.updated_at,
      } as MultimediaDocument,
    }));

    return { items };
  } catch (error) {
    console.error("Fetch tutor multimedia exception:", error);
    return {
      items: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch tutor multimedia",
    };
  }
}

/**
 * Remove multimedia from tutor
 */
export async function removeMultimediaFromTutor(
  tutorId: string,
  documentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from("tutor_multimedia")
      .delete()
      .eq("tutor_id", tutorId)
      .eq("document_id", documentId);

    if (error) {
      console.error("❌ Remove multimedia error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Remove multimedia exception:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to remove multimedia",
    };
  }
}

// =====================================================
// Statistics Operations
// =====================================================

/**
 * Get multimedia statistics for user
 */
export async function getUserMultimediaStats(
  userId: string
): Promise<{ stats?: MultimediaStats; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("documents")
      .select("media_type, file_size, duration_seconds, transcription_cost")
      .eq("owner_id", userId)
      .in("media_type", ["audio", "video", "image"]);

    if (error) {
      console.error("❌ Fetch stats error:", error);
      return { error: error.message };
    }

    const stats: MultimediaStats = {
      totalFiles: data.length,
      byType: {
        audio: data.filter((d) => d.media_type === "audio").length,
        video: data.filter((d) => d.media_type === "video").length,
        image: data.filter((d) => d.media_type === "image").length,
      },
      totalSize: data.reduce((sum, d) => sum + (d.file_size || 0), 0),
      totalDuration: data.reduce((sum, d) => sum + (d.duration_seconds || 0), 0),
      processingCost: data.reduce(
        (sum, d) => sum + (d.transcription_cost || 0),
        0
      ),
      storageUsed: data.reduce((sum, d) => sum + (d.file_size || 0), 0),
    };

    return { stats };
  } catch (error) {
    console.error("Fetch stats exception:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch stats",
    };
  }
}

