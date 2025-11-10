/**
 * Video Audio Extraction Utility
 * Extracts audio track from video files for transcription
 */

import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { writeFile, unlink } from 'fs/promises';

interface AudioExtractionResult {
  audioBuffer?: Buffer;
  audioPath?: string;
  error?: string;
  originalSize: number;
  extractedSize?: number;
}

/**
 * Extract audio from video buffer
 * Converts video to MP3 audio for Whisper transcription
 */
export async function extractAudioFromVideo(
  videoBuffer: Buffer,
  options: {
    format?: 'mp3' | 'wav';
    bitrate?: string;
    sampleRate?: number;
  } = {}
): Promise<AudioExtractionResult> {
  const {
    format = 'mp3',
    bitrate = '128k',
    sampleRate = 44100,
  } = options;

  const originalSize = videoBuffer.length;
  const tempVideoPath = join(tmpdir(), `video-${randomBytes(8).toString('hex')}.mp4`);
  const tempAudioPath = join(tmpdir(), `audio-${randomBytes(8).toString('hex')}.${format}`);

  try {
    // Write video buffer to temp file
    await writeFile(tempVideoPath, videoBuffer);

    // Extract audio using FFmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .noVideo() // Remove video stream
        .audioCodec(format === 'mp3' ? 'libmp3lame' : 'pcm_s16le')
        .audioBitrate(bitrate)
        .audioFrequency(sampleRate)
        .output(tempAudioPath)
        .on('end', () => {
          console.log('✅ Audio extraction completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg error:', err.message);
          reject(err);
        })
        .run();
    });

    // Read extracted audio file
    const { readFile } = await import('fs/promises');
    const audioBuffer = await readFile(tempAudioPath);

    console.log('📊 Audio extraction stats:', {
      originalSize: `${(originalSize / 1024 / 1024).toFixed(2)} MB`,
      extractedSize: `${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`,
      compression: `${((1 - audioBuffer.length / originalSize) * 100).toFixed(1)}%`,
    });

    // Cleanup temp files
    await Promise.all([
      unlink(tempVideoPath).catch(() => {}),
      unlink(tempAudioPath).catch(() => {}),
    ]);

    return {
      audioBuffer,
      audioPath: tempAudioPath,
      originalSize,
      extractedSize: audioBuffer.length,
    };
  } catch (error) {
    // Cleanup on error
    await Promise.all([
      unlink(tempVideoPath).catch(() => {}),
      unlink(tempAudioPath).catch(() => {}),
    ]);

    return {
      error: error instanceof Error ? error.message : 'Audio extraction failed',
      originalSize,
    };
  }
}

/**
 * Extract audio from video stream
 * Alternative method using streams (more memory efficient)
 */
export async function extractAudioFromVideoStream(
  videoStream: Readable,
  outputPath: string,
  options: {
    format?: 'mp3' | 'wav';
    bitrate?: string;
  } = {}
): Promise<{ success: boolean; error?: string; size?: number }> {
  const {
    format = 'mp3',
    bitrate = '128k',
  } = options;

  return new Promise((resolve) => {
    ffmpeg(videoStream)
      .noVideo()
      .audioCodec(format === 'mp3' ? 'libmp3lame' : 'pcm_s16le')
      .audioBitrate(bitrate)
      .output(outputPath)
      .on('end', async () => {
        try {
          const { stat } = await import('fs/promises');
          const stats = await stat(outputPath);
          resolve({ success: true, size: stats.size });
        } catch {
          resolve({ success: true });
        }
      })
      .on('error', (err) => {
        resolve({ success: false, error: err.message });
      })
      .run();
  });
}

/**
 * Check if FFmpeg is available
 */
export async function checkFFmpegAvailability(): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      if (err) {
        console.error('⚠️  FFmpeg not available:', err.message);
        resolve(false);
      } else {
        console.log('✅ FFmpeg is available');
        resolve(true);
      }
    });
  });
}

/**
 * Get video metadata
 */
export async function getVideoMetadata(
  videoPath: string
): Promise<{
  duration?: number;
  bitrate?: number;
  size?: number;
  format?: string;
  error?: string;
}> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        resolve({ error: err.message });
        return;
      }

      resolve({
        duration: metadata.format.duration,
        bitrate: metadata.format.bit_rate,
        size: metadata.format.size,
        format: metadata.format.format_name,
      });
    });
  });
}

