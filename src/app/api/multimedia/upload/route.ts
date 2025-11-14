/**
 * Multimedia Upload API
 * Handles upload of audio/video/image files
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceUsageLimit } from "@/lib/utils/usage-limits";
import {
  uploadMultimediaFile,
  createMultimediaDocument,
  queueMultimediaProcessing,
} from "@/lib/supabase/multimedia";
import {
  getMediaTypeFromMimeType,
  getFileSizeLimit,
} from "@/types/multimedia";
import { withRateLimit } from "@/lib/middleware/rate-limit-guard";
import { sanitize } from "@/lib/utils/log-sanitizer";

export const POST = withRateLimit('upload', async (request: NextRequest, _context) => {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Determine media type
    const mediaType = getMediaTypeFromMimeType(file.type);
    if (!mediaType) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // Check usage limits based on media type
    try {
      const resourceType = mediaType === 'document' ? 'documents' : mediaType;
      await enforceUsageLimit(user.id, resourceType);
    } catch (limitError) {
      return NextResponse.json(
        { 
          success: false, 
          error: limitError instanceof Error ? limitError.message : "Usage limit reached" 
        },
        { status: 403 }
      );
    }

    // Check file size
    const maxSize = getFileSizeLimit(mediaType);
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size for ${mediaType}: ${maxSize / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    console.log(`📤 Uploading ${mediaType} file:`, sanitize({
      fileName: file.name,
      size: file.size,
      type: file.type,
      userId: user.id,
    }));

    // Upload to storage (pass authenticated supabase client)
    const { path, error: uploadError } = await uploadMultimediaFile(
      file,
      user.id,
      mediaType,
      supabase
    );

    if (uploadError || !path) {
      return NextResponse.json(
        { success: false, error: uploadError || "Upload failed" },
        { status: 500 }
      );
    }

    // Create document record (pass authenticated supabase client)
    const { document, error: docError } = await createMultimediaDocument(
      {
        userId: user.id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath: path,
        mediaType,
      },
      supabase
    );

    if (docError || !document) {
      return NextResponse.json(
        { success: false, error: docError || "Failed to create document" },
        { status: 500 }
      );
    }

    // Queue for processing (transcription/analysis) (pass authenticated supabase client)
    const { queueId, error: queueError } = await queueMultimediaProcessing(
      document.id,
      user.id,
      mediaType,
      supabase
    );

    if (queueError) {
      console.warn("⚠️  Failed to queue processing:", sanitize(queueError));
      // Don't fail the request - processing can be retried
    }

    console.log("✅ Upload successful:", {
      documentId: document.id,
      queueId,
    });

    // Trigger processing immediately (don't wait for cron)
    // This runs in background, so we don't wait for the result
    if (queueId) {
      console.log("🚀 Triggering immediate processing...");
      
      // Call worker API in background (fire and forget)
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/multimedia/worker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((err) => {
        console.warn("⚠️  Failed to trigger immediate processing:", sanitize(err));
        // Don't fail - cron will pick it up
      });
    }

    return NextResponse.json({
      success: true,
      documentId: document.id,
      queueId,
      message: `${mediaType} file uploaded successfully. Processing started.`,
    });
  } catch (error) {
    console.error("❌ Upload error:", sanitize(error));
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
});

