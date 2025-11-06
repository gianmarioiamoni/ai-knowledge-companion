/**
 * Multimedia API - Get/Delete specific multimedia file
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteMultimediaDocument } from "@/lib/supabase/multimedia";

export async function DELETE(
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

    const { success, error } = await deleteMultimediaDocument(
      params.id,
      user.id
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error("Delete multimedia error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete file",
      },
      { status: 500 }
    );
  }
}

