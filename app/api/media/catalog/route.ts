import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // adjust path if needed

export async function GET() {
  try {
    // Fetch directly from the "MediaItem" table using Supabase JS client
    const { data, error } = await supabase
      .from("MediaItem")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch media catalog from Supabase:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch media catalog" },
      { status: 500 },
    );
  }
}
