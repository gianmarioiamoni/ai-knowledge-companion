/**
 * Multimedia Types
 * Sprint 5: Audio/Video/Image support for tutors
 */

import type { Database } from "./database";

// =====================================================
// Base Types from Database
// =====================================================

export type MediaProcessingQueue =
  Database["public"]["Tables"]["media_processing_queue"]["Row"];
export type MediaProcessingQueueInsert =
  Database["public"]["Tables"]["media_processing_queue"]["Insert"];
export type MediaProcessingQueueUpdate =
  Database["public"]["Tables"]["media_processing_queue"]["Update"];

export type TutorMultimedia =
  Database["public"]["Tables"]["tutor_multimedia"]["Row"];
export type TutorMultimediaInsert =
  Database["public"]["Tables"]["tutor_multimedia"]["Insert"];
export type TutorMultimediaUpdate =
  Database["public"]["Tables"]["tutor_multimedia"]["Update"];

// =====================================================
// Media Types
// =====================================================

export type MediaType = "document" | "audio" | "video" | "image";

export type TranscriptionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "not_required";

export type ProcessingStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

// =====================================================
// Supported File Types
// =====================================================

// Audio formats
export const SUPPORTED_AUDIO_TYPES = [
  "audio/mpeg", // MP3
  "audio/wav", // WAV
  "audio/mp4", // M4A (standard)
  "audio/x-m4a", // M4A (alternative)
  "audio/m4a", // M4A (alternative 2)
  "audio/ogg", // OGG
  "audio/webm", // WebM Audio
  "audio/aac", // AAC
  "audio/x-aac", // AAC (alternative)
] as const;

export type SupportedAudioType = (typeof SUPPORTED_AUDIO_TYPES)[number];

// Video formats (for future implementation)
export const SUPPORTED_VIDEO_TYPES = [
  "video/mp4", // MP4
  "video/quicktime", // MOV
  "video/x-msvideo", // AVI
  "video/webm", // WebM
] as const;

export type SupportedVideoType = (typeof SUPPORTED_VIDEO_TYPES)[number];

// Image formats (for future implementation)
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg", // JPG/JPEG
  "image/png", // PNG
  "image/gif", // GIF
  "image/webp", // WebP
] as const;

export type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

// All multimedia types
export type SupportedMultimediaType =
  | SupportedAudioType
  | SupportedVideoType
  | SupportedImageType;

// =====================================================
// File Size Limits
// =====================================================

export const MULTIMEDIA_FILE_LIMITS = {
  audio: 100 * 1024 * 1024, // 100MB
  video: 500 * 1024 * 1024, // 500MB
  image: 20 * 1024 * 1024, // 20MB
} as const;

export const MAX_AUDIO_DURATION = 3600; // 1 hour in seconds
export const MAX_VIDEO_DURATION = 7200; // 2 hours in seconds

// =====================================================
// Upload Types
// =====================================================

export interface MultimediaUpload {
  file: File;
  mediaType: MediaType;
  tutorId?: string;
  metadata?: MultimediaMetadata;
}

export interface MultimediaMetadata {
  duration?: number; // seconds
  width?: number; // pixels
  height?: number; // pixels
  bitrate?: number; // kbps
  codec?: string;
  sampleRate?: number; // Hz for audio
  channels?: number; // audio channels
  [key: string]: unknown;
}

// =====================================================
// Processing Types
// =====================================================

export interface ProcessingJob {
  queueId: string;
  documentId: string;
  userId: string;
  mediaType: MediaType;
  status: ProcessingStatus;
  progressPercent: number;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ProcessingResult {
  success: boolean;
  queueId?: string;
  documentId?: string;
  transcription?: string;
  chunksCreated?: number;
  embeddingsGenerated?: number;
  processingCost?: number;
  error?: string;
  metadata?: {
    duration?: number;
    model?: string;
    tokensUsed?: number;
  };
}

// =====================================================
// Transcription Types (Whisper API)
// =====================================================

export interface TranscriptionOptions {
  language?: string; // ISO-639-1 language code (e.g., 'en', 'it')
  prompt?: string; // Optional context to guide transcription
  temperature?: number; // 0-1, controls randomness
  model?: "whisper-1"; // OpenAI model
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
  segments?: TranscriptionSegment[];
  cost?: number;
  error?: string;
}

export interface TranscriptionSegment {
  id: number;
  start: number; // seconds
  end: number; // seconds
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

// =====================================================
// Vision API Types (for images - future)
// =====================================================

export interface VisionAnalysisOptions {
  prompt?: string;
  maxTokens?: number;
  detail?: "low" | "high"; // Image detail level
}

export interface VisionAnalysisResult {
  description: string;
  ocrText?: string;
  objects?: string[];
  cost?: number;
  error?: string;
}

// =====================================================
// Multimedia Document (Extended Document Type)
// =====================================================

export interface MultimediaDocument {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;
  mediaType: MediaType;
  
  // Multimedia specific
  durationSeconds?: number;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  
  // Processing
  transcriptionStatus: TranscriptionStatus;
  transcriptionText?: string;
  transcriptionCost?: number;
  
  // Metadata
  chunksCount: number;
  status: "pending" | "processing" | "ready" | "failed";
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

// =====================================================
// Tutor Multimedia Association
// =====================================================

export interface TutorMultimediaItem {
  id: string;
  tutorId: string;
  documentId: string;
  displayOrder: number;
  document: MultimediaDocument;
  createdAt: string;
}

// =====================================================
// API Request/Response Types
// =====================================================

export interface UploadMultimediaRequest {
  tutorId?: string;
  metadata?: MultimediaMetadata;
}

export interface UploadMultimediaResponse {
  success: boolean;
  documentId?: string;
  queueId?: string;
  message?: string;
  error?: string;
}

export interface GetProcessingStatusRequest {
  queueId?: string;
  documentId?: string;
}

export interface GetProcessingStatusResponse {
  status: ProcessingStatus;
  progressPercent: number;
  errorMessage?: string;
  result?: ProcessingResult;
}

export interface AssociateMultimediaRequest {
  tutorId: string;
  documentIds: string[];
}

export interface AssociateMultimediaResponse {
  success: boolean;
  associated: number;
  error?: string;
}

// =====================================================
// Form Types
// =====================================================

export interface MultimediaUploadFormData {
  files: File[];
  tutorId?: string;
  autoAssociate: boolean;
}

export interface MultimediaFiltersState {
  mediaType: MediaType | "all";
  status: TranscriptionStatus | "all";
  sortBy: "newest" | "oldest" | "name" | "size";
}

// =====================================================
// Statistics Types
// =====================================================

export interface MultimediaStats {
  totalFiles: number;
  byType: {
    audio: number;
    video: number;
    image: number;
  };
  totalSize: number; // bytes
  totalDuration: number; // seconds for audio/video
  processingCost: number; // USD
  storageUsed: number; // bytes
}

// =====================================================
// Helper Types
// =====================================================

export interface MultimediaUploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: "uploading" | "processing" | "completed" | "failed";
  error?: string;
}

// =====================================================
// Type Guards
// =====================================================

export function isAudioType(
  mimeType: string
): mimeType is SupportedAudioType {
  return SUPPORTED_AUDIO_TYPES.includes(mimeType as SupportedAudioType);
}

export function isVideoType(
  mimeType: string
): mimeType is SupportedVideoType {
  return SUPPORTED_VIDEO_TYPES.includes(mimeType as SupportedVideoType);
}

export function isImageType(
  mimeType: string
): mimeType is SupportedImageType {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType as SupportedImageType);
}

export function isMultimediaType(
  mimeType: string
): mimeType is SupportedMultimediaType {
  return (
    isAudioType(mimeType) || isVideoType(mimeType) || isImageType(mimeType)
  );
}

export function getMediaTypeFromMimeType(mimeType: string): MediaType | null {
  if (isAudioType(mimeType)) return "audio";
  if (isVideoType(mimeType)) return "video";
  if (isImageType(mimeType)) return "image";
  return null;
}

export function getFileSizeLimit(mediaType: MediaType): number {
  switch (mediaType) {
    case "audio":
      return MULTIMEDIA_FILE_LIMITS.audio;
    case "video":
      return MULTIMEDIA_FILE_LIMITS.video;
    case "image":
      return MULTIMEDIA_FILE_LIMITS.image;
    default:
      return 10 * 1024 * 1024; // 10MB for documents
  }
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function estimateTranscriptionCost(durationSeconds: number): number {
  // Whisper API: $0.006 per minute
  const minutes = durationSeconds / 60;
  return minutes * 0.006;
}

export function estimateVisionCost(imageCount: number): number {
  // GPT-4 Vision: ~$0.01 per image (estimate for 1024x1024)
  return imageCount * 0.01;
}

