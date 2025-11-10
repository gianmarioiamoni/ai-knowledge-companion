/**
 * Multimedia API - Get user's multimedia files
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserMultimediaDocuments } from "@/lib/supabase/multimedia";
import type { MediaType } from "@/types/multimedia";

export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams;
    const mediaType = searchParams.get("mediaType") as MediaType | null;

    const { documents, error } = await getUserMultimediaDocuments(
      user.id,
      mediaType || undefined,
      supabase
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ files: documents });
  } catch (error) {
    console.error("Get multimedia error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get multimedia",
      },
      { status: 500 }
    );
  }
}

