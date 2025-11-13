/**
 * Whisper Transcription Service - OpenAI Whisper API
 * Sprint 5: Audio transcription for multimedia support
 */

import OpenAI from "openai";
import { extractAudioFromVideo } from "@/lib/utils/video-audio-extractor";
import type {
  TranscriptionOptions,
  TranscriptionResult,
} from "@/types/multimedia";
import type { SupabaseClient } from "@supabase/supabase-js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Whisper API pricing: $0.006 per minute
const WHISPER_COST_PER_MINUTE = 0.006;

/**
 * Transcribe audio file using Whisper API
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  fileName: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    console.log("🎤 Starting Whisper transcription:", {
      fileName,
      size: audioBuffer.length,
      language: options.language || "auto-detect",
    });

    // Create a File-like object from buffer
    const audioFile = new File([audioBuffer], fileName, {
      type: getMimeTypeFromFileName(fileName),
    });

    // Call Whisper API
    const startTime = Date.now();
    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: options.model || "whisper-1",
      language: options.language, // Optional: ISO-639-1 code (e.g., 'en', 'it')
      prompt: options.prompt, // Optional: context to guide transcription
      temperature: options.temperature || 0, // 0 = more focused, 1 = more creative
      response_format: "verbose_json", // Get detailed response with timestamps
    });

    const duration = (Date.now() - startTime) / 1000;

    console.log("✅ Transcription completed:", {
      duration: `${duration}s`,
      textLength: response.text?.length || 0,
      detectedLanguage: response.language,
    });

    // Calculate cost based on audio duration
    const audioDuration = response.duration || 0; // Duration in seconds
    const cost = (audioDuration / 60) * WHISPER_COST_PER_MINUTE;

    // Extract segments if available
    type WhisperSegment = {
      id: number;
      start: number;
      end: number;
      text: string;
      tokens?: number[];
      temperature?: number;
      avg_logprob?: number;
      compression_ratio?: number;
      no_speech_prob?: number;
    };
    const segments =
      "segments" in response
        ? response.segments?.map((seg: WhisperSegment) => ({
            id: seg.id,
            start: seg.start,
            end: seg.end,
            text: seg.text,
            tokens: seg.tokens || [],
            temperature: seg.temperature || 0,
            avg_logprob: seg.avg_logprob || 0,
            compression_ratio: seg.compression_ratio || 0,
            no_speech_prob: seg.no_speech_prob || 0,
          }))
        : undefined;

    return {
      text: response.text,
      language: response.language,
      duration: response.duration,
      segments,
      cost,
    };
  } catch (error) {
    console.error("❌ Whisper transcription error:", error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      return {
        text: "",
        error: `OpenAI API error: ${error.message} (${error.status})`,
      };
    }

    return {
      text: "",
      error: error instanceof Error ? error.message : "Transcription failed",
    };
  }
}

/**
 * Transcribe audio from URL (downloads first)
 */
export async function transcribeAudioFromUrl(
  audioUrl: string,
  fileName: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    console.log("📥 Downloading audio from URL:", audioUrl);

    // Download audio file
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribe
    return await transcribeAudio(buffer, fileName, options);
  } catch (error) {
    console.error("❌ Download and transcribe error:", error);
    return {
      text: "",
      error:
        error instanceof Error
          ? error.message
          : "Failed to download and transcribe audio",
    };
  }
}

/**
 * Transcribe audio file from Supabase storage
 */
export async function transcribeAudioFromStorage(
  supabaseClient: SupabaseClient,
  bucket: string,
  storagePath: string,
  fileName: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    console.log("📦 Downloading audio from storage:", { bucket, storagePath });

    // Download file from Supabase storage
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .download(storagePath);

    if (error) {
      throw new Error(`Failed to download from storage: ${error.message}`);
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribe
    return await transcribeAudio(buffer, fileName, options);
  } catch (error) {
    console.error("❌ Storage download and transcribe error:", error);
    return {
      text: "",
      error:
        error instanceof Error
          ? error.message
          : "Failed to download and transcribe from storage",
    };
  }
}

/**
 * Transcribe video file from Supabase storage (extracts audio first)
 */
export async function transcribeVideoFromStorage(
  supabaseClient: SupabaseClient,
  bucket: string,
  storagePath: string,
  fileName: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    console.log("📦 Downloading video from storage:", { bucket, storagePath });

    // Download video file from Supabase storage
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .download(storagePath);

    if (error) {
      throw new Error(`Failed to download from storage: ${error.message}`);
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    const videoBuffer = Buffer.from(arrayBuffer);

    console.log(`🎬 Video downloaded: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    console.log("🔊 Extracting audio from video...");

    // Extract audio from video
    const extractionResult = await extractAudioFromVideo(videoBuffer, {
      format: 'mp3',
      bitrate: '128k',
      sampleRate: 44100,
    });

    if (extractionResult.error || !extractionResult.audioBuffer) {
      throw new Error(extractionResult.error || "Failed to extract audio from video");
    }

    console.log(`✅ Audio extracted: ${(extractionResult.audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Check if extracted audio is under Whisper limit (25MB)
    const MAX_WHISPER_SIZE = 25 * 1024 * 1024; // 25MB
    if (extractionResult.audioBuffer.length > MAX_WHISPER_SIZE) {
      throw new Error(
        `Extracted audio (${(extractionResult.audioBuffer.length / 1024 / 1024).toFixed(2)} MB) ` +
        `exceeds Whisper API limit (25 MB). Try a shorter video or lower quality audio extraction.`
      );
    }

    // Transcribe extracted audio
    const audioFileName = fileName.replace(/\.[^/.]+$/, '.mp3');
    return await transcribeAudio(extractionResult.audioBuffer, audioFileName, options);
  } catch (error) {
    console.error("❌ Video transcription error:", error);
    return {
      text: "",
      error:
        error instanceof Error
          ? error.message
          : "Failed to transcribe video",
    };
  }
}

/**
 * Estimate transcription cost without actually transcribing
 */
export function estimateTranscriptionCost(durationSeconds: number): number {
  const minutes = durationSeconds / 60;
  return minutes * WHISPER_COST_PER_MINUTE;
}

/**
 * Get supported audio formats for Whisper
 */
export function getSupportedAudioFormats(): string[] {
  return [
    "mp3",
    "mp4",
    "mpeg",
    "mpga",
    "m4a",
    "wav",
    "webm",
    "ogg",
    "aac",
  ];
}

/**
 * Check if file format is supported by Whisper
 */
export function isAudioFormatSupported(fileName: string): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? getSupportedAudioFormats().includes(extension) : false;
}

/**
 * Get MIME type from file name
 */
function getMimeTypeFromFileName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    mp3: "audio/mpeg",
    mp4: "audio/mp4",
    m4a: "audio/mp4",
    wav: "audio/wav",
    webm: "audio/webm",
    ogg: "audio/ogg",
    aac: "audio/aac",
    mpeg: "audio/mpeg",
    mpga: "audio/mpeg",
  };

  return mimeTypes[extension || ""] || "audio/mpeg";
}

/**
 * Extract audio metadata (duration, etc.) from buffer
 * Note: This is a placeholder - for full implementation, use a library like 'music-metadata'
 */
export async function getAudioMetadata(buffer: Buffer): Promise<{
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
}> {
  // TODO: Implement with 'music-metadata' library
  // For now, return empty metadata
  // The Whisper API will provide duration after transcription
  return {};
}

/**
 * Validate audio file before transcription
 */
export async function validateAudioFile(
  buffer: Buffer,
  fileName: string,
  maxSizeBytes: number = 25 * 1024 * 1024 // Whisper limit: 25MB
): Promise<{ valid: boolean; error?: string }> {
  // Check file size
  if (buffer.length > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSizeBytes / 1024 / 1024}MB`,
    };
  }

  // Check format
  if (!isAudioFormatSupported(fileName)) {
    return {
      valid: false,
      error: `Unsupported format. Supported formats: ${getSupportedAudioFormats().join(", ")}`,
    };
  }

  // Check if buffer is not empty
  if (buffer.length === 0) {
    return {
      valid: false,
      error: "Audio file is empty",
    };
  }

  return { valid: true };
}

/**
 * Split long audio into chunks (for files longer than Whisper's limit)
 * Note: Whisper supports up to 25MB files, but for very long files,
 * you might want to split them into smaller chunks
 */
export async function splitAudioIntoChunks(
  buffer: Buffer,
  chunkDurationSeconds: number = 600 // 10 minutes per chunk
): Promise<Buffer[]> {
  // TODO: Implement audio splitting using ffmpeg or similar
  // For now, return single chunk (the whole file)
  return [buffer];
}

/**
 * Merge multiple transcription results
 */
export function mergeTranscriptions(
  results: TranscriptionResult[]
): TranscriptionResult {
  const text = results.map((r) => r.text).join(" ");

  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);

  // Merge segments with adjusted timestamps
  const allSegments =
    results.flatMap((result, resultIndex) => {
      if (!result.segments) return [];

      const timeOffset = results
        .slice(0, resultIndex)
        .reduce((sum, r) => sum + (r.duration || 0), 0);

      return result.segments.map((seg) => ({
        ...seg,
        start: seg.start + timeOffset,
        end: seg.end + timeOffset,
      }));
    }) || undefined;

  return {
    text,
    language: results[0]?.language,
    duration: totalDuration,
    segments: allSegments,
    cost: totalCost,
  };
}

