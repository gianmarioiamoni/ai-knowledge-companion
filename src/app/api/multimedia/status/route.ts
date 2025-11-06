/**
 * Multimedia Processing Status API
 * Get status of multimedia processing job
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProcessingStatus } from "@/lib/supabase/multimedia";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const queueId = searchParams.get("queueId");
    const documentId = searchParams.get("documentId");

    if (!queueId && !documentId) {
      return NextResponse.json(
        { error: "Either queueId or documentId is required" },
        { status: 400 }
      );
    }

    // Get processing status
    const { job, error } = await getProcessingStatus(
      queueId || undefined,
      documentId || undefined
    );

    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }

    // Verify user owns this job
    if (job && job.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      status: job?.status,
      progressPercent: job?.progressPercent,
      errorMessage: job?.errorMessage,
      createdAt: job?.createdAt,
      startedAt: job?.startedAt,
      completedAt: job?.completedAt,
    });
  } catch (error) {
    console.error("❌ Status check error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get status",
      },
      { status: 500 }
    );
  }
}

