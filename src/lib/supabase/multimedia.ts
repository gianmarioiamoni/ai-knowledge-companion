/**
 * Multimedia Service - Supabase operations for audio/video/images
 * Sprint 5: Audio/Video/Image support for tutors
 */

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
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

// Type for Supabase client - using SupabaseClient without specific Database constraints
// to allow compatibility between server and browser clients
type SupabaseClientType = SupabaseClient<Database>;

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
  supabaseClient?: SupabaseClientType
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
    const { error: uploadError } = await supabase.storage
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
export function getBucketForMediaType(mediaType: MediaType): string {
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
  supabaseClient?: SupabaseClientType
): Promise<{ document?: MultimediaDocument; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    const { data: document, error } = await supabase
      .from("documents")
      // @ts-expect-error - Supabase auto-generated types have table marked as 'never'
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
      return { error: (error as { message: string }).message };
    }

    // Type assertion for document due to Supabase generated types
    const doc = document as Record<string, unknown>;
    
    return {
      document: {
        ...doc,
        chunksCount: 0,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        userId: doc.owner_id,
        fileName: doc.title,
        fileSize: (doc.file_size as number) || 0,
        storagePath: doc.storage_path,
        mediaType: doc.media_type,
        transcriptionStatus: doc.transcription_status,
        mimeType: doc.mime_type,
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
  supabaseClient?: SupabaseClientType
): Promise<{ documents: MultimediaDocument[]; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    const query = supabase
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

    type DocumentRow = Database["public"]["Tables"]["documents"]["Row"] & {
      document_chunks?: Array<{ count: number }>;
    };

    const documents: MultimediaDocument[] = data.map((doc: DocumentRow) => ({
      id: doc.id,
      userId: doc.owner_id,
      fileName: doc.title,
      fileSize: doc.file_size || 0,
      mimeType: doc.mime_type,
      storagePath: doc.storage_path,
      mediaType: doc.media_type as MediaType,
      durationSeconds: doc.duration_seconds ?? undefined,
      width: doc.width ?? undefined,
      height: doc.height ?? undefined,
      thumbnailUrl: doc.thumbnail_url ?? undefined,
      transcriptionStatus: (doc.transcription_status as TranscriptionStatus) ?? undefined,
      transcriptionText: doc.transcription_text ?? undefined,
      transcriptionCost: doc.transcription_cost ?? undefined,
      chunksCount: doc.document_chunks?.[0]?.count || 0,
      // Map database status to MultimediaDocument status
      status: (() => {
        const dbStatus = doc.status as string;
        if (dbStatus === 'completed') return 'ready';
        if (dbStatus === 'error') return 'failed';
        return dbStatus as MultimediaDocument['status'];
      })(),
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
  supabaseClient?: SupabaseClientType
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    const { error } = await supabase
      .from("documents")
      // @ts-expect-error - Supabase auto-generated types have table marked as 'never'
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
  userId: string,
  supabaseClient?: SupabaseClientType
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    console.log(`🗑️  Deleting multimedia document: ${documentId}`);

    // First get document to know storage path and media type
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("storage_path, media_type")
      .eq("id", documentId)
      .eq("owner_id", userId)
      .single();

    if (fetchError || !document) {
      console.error("❌ Document not found:", fetchError);
      return { success: false, error: "Document not found" };
    }

    // Type assertion for document properties
    const doc = document as { storage_path: string; media_type: string };

    console.log(`📁 Document found:`, {
      id: documentId,
      storage_path: doc.storage_path,
      media_type: doc.media_type,
    });

    // Delete from storage
    const bucket = getBucketForMediaType(doc.media_type as MediaType);
    console.log(`🗑️  Deleting from storage bucket: ${bucket}, path: ${doc.storage_path}`);
    
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([doc.storage_path]);

    if (storageError) {
      console.warn("⚠️  Storage delete warning:", storageError);
      // Continue anyway - document may have already been deleted
    } else {
      console.log("✅ Storage file deleted");
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

    console.log("✅ Document deleted from database");
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
  supabaseClient?: SupabaseClientType
): Promise<{ queueId?: string; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    // Validate that media type is processable (not "document")
    if (mediaType === "document") {
      return { error: "Document type cannot be queued for media processing" };
    }

    const queueData: MediaProcessingQueueInsert = {
      document_id: documentId,
      user_id: userId,
      media_type: mediaType as "audio" | "video" | "image",
      status: "queued",
      progress_percent: 0,
      retry_count: 0,
      max_retries: 3,
    };

    const { data, error } = await (
      supabase
        .from("media_processing_queue")
        // @ts-expect-error - Supabase auto-generated types have table marked as 'never'
        .insert(queueData)
        .select()
        .single()
    );

    if (error) {
      console.error("❌ Queue creation error:", error);
      return { error: error.message };
    }

    // Type assertion for queue data
    const queueRecord = data as { id: string };

    console.log("✅ Processing queued:", queueRecord.id);
    return { queueId: queueRecord.id };
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

    // Type assertion for queue data
    const queueData = data as {
      id: string;
      document_id: string;
      user_id: string;
      media_type: string;
      status: string;
      progress_percent: number;
      error_message: string | null;
      retry_count: number;
      created_at: string;
      processing_started_at: string | null;
      processing_completed_at: string | null;
    };

    const job: ProcessingJob = {
      queueId: queueData.id,
      documentId: queueData.document_id,
      userId: queueData.user_id,
      mediaType: queueData.media_type as MediaType,
      status: queueData.status as ProcessingStatus,
      progressPercent: queueData.progress_percent,
      errorMessage: queueData.error_message || undefined,
      retryCount: queueData.retry_count,
      createdAt: queueData.created_at,
      startedAt: queueData.processing_started_at || undefined,
      completedAt: queueData.processing_completed_at || undefined,
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
  supabaseClient?: SupabaseClientType
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = supabaseClient || createClient();

    type QueueUpdate = Partial<Database["public"]["Tables"]["media_processing_queue"]["Update"]>;
    const updateData: QueueUpdate = {
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

    const { error } = await (
      supabase
        .from("media_processing_queue")
        // @ts-expect-error - Supabase auto-generated types have table marked as 'never'
        .update(updateData)
        .eq("id", queueId)
    );

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

    // Type assertion for existing data
    const existingData = existing as Array<{ display_order: number }> | null;

    const startOrder = existingData && existingData.length > 0 ? existingData[0].display_order + 1 : 0;

    // Insert associations
    const associations: TutorMultimediaInsert[] = documentIds.map(
      (documentId, index) => ({
        tutor_id: tutorId,
        document_id: documentId,
        display_order: startOrder + index,
      })
    );

    const { data, error } = await (
      supabase
        .from("tutor_multimedia")
        // @ts-expect-error - Supabase auto-generated types have table marked as 'never'
        .insert(associations)
        .select()
    );

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

    type TutorMultimediaRow = Database["public"]["Tables"]["tutor_multimedia"]["Row"] & {
      documents: Database["public"]["Tables"]["documents"]["Row"];
    };

    const items: TutorMultimediaItem[] = data.map((item: TutorMultimediaRow) => ({
      id: item.id,
      tutorId: item.tutor_id,
      documentId: item.document_id,
      displayOrder: item.display_order ?? 0,
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

    // Type assertion for stats data
    const statsData = data as Array<{
      media_type: string;
      file_size: number | null;
      duration_seconds: number | null;
      transcription_cost: number | null;
    }>;

    const stats: MultimediaStats = {
      totalFiles: statsData.length,
      byType: {
        audio: statsData.filter((d) => d.media_type === "audio").length,
        video: statsData.filter((d) => d.media_type === "video").length,
        image: statsData.filter((d) => d.media_type === "image").length,
      },
      totalSize: statsData.reduce((sum, d) => sum + (d.file_size || 0), 0),
      totalDuration: statsData.reduce((sum, d) => sum + (d.duration_seconds || 0), 0),
      processingCost: statsData.reduce(
        (sum, d) => sum + (d.transcription_cost || 0),
        0
      ),
      storageUsed: statsData.reduce((sum, d) => sum + (d.file_size || 0), 0),
    };

    return { stats };
  } catch (error) {
    console.error("Fetch stats exception:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch stats",
    };
  }
}

