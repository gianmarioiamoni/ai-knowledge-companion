/**
 * Multimedia API - Get/Delete specific multimedia file
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteMultimediaDocument } from "@/lib/supabase/multimedia";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ Unauthorized delete attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log(`📥 DELETE request for multimedia: ${id} by user: ${user.id}`);

    const { success, error } = await deleteMultimediaDocument(
      id,
      user.id,
      supabase
    );

    if (error) {
      console.error("❌ Delete failed:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("✅ Delete successful");
    return NextResponse.json({ success });
  } catch (error) {
    console.error("❌ Delete multimedia exception:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete file",
      },
      { status: 500 }
    );
  }
}

