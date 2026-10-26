import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Media ID is required" },
        { status: 400 },
      );
    }

    // Update isApproved to true
    const { data, error } = await supabase
      .from("MediaItem")
      .update({ isApproved: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Approval error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve media" },
      { status: 500 },
    );
  }
}
