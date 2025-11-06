/**
 * Tutor Multimedia API
 * Get and associate multimedia with tutors
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getTutorMultimedia,
  associateMultimediaWithTutor,
} from "@/lib/supabase/multimedia";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the tutor
    const { data: tutor } = await supabase
      .from("tutors")
      .select("owner_id")
      .eq("id", params.id)
      .single();

    if (!tutor || tutor.owner_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { items, error } = await getTutorMultimedia(params.id);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Get tutor multimedia error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get tutor multimedia",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user owns the tutor
    const { data: tutor } = await supabase
      .from("tutors")
      .select("owner_id")
      .eq("id", params.id)
      .single();

    if (!tutor || tutor.owner_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { documentIds } = await request.json();

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: "documentIds array is required" },
        { status: 400 }
      );
    }

    const { success, associated, error } = await associateMultimediaWithTutor(
      params.id,
      documentIds
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success, associated });
  } catch (error) {
    console.error("Associate multimedia error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to associate multimedia",
      },
      { status: 500 }
    );
  }
}

