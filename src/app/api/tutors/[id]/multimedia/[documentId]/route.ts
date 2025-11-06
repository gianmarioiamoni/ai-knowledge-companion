/**
 * Remove Multimedia from Tutor API
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { removeMultimediaFromTutor } from "@/lib/supabase/multimedia";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
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

    const { success, error } = await removeMultimediaFromTutor(
      params.id,
      params.documentId
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Remove multimedia error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove multimedia",
      },
      { status: 500 }
    );
  }
}

