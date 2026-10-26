import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Only fetch items that have been approved by an admin
    const { data, error } = await supabase
      .from("MediaItem")
      .select("*")
      .eq("isApproved", true)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || [], { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch public catalog:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch media catalog" },
      { status: 500 },
    );
  }
}
