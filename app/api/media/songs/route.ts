import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Adjust path to your supabase client helper if needed

export async function POST(request: Request) {
  try {
    const { planId, mediaItemId, massPart } = await request.json();

    const { data: planSong, error } = await supabase
      .from("PlanSong")
      .insert({
        planId,
        mediaItemId,
        massPart,
      })
      .select(
        `
        *,
        mediaItem:MediaItem (*)
      `,
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(planSong, { status: 201 });
  } catch (error: any) {
    console.error("Assign Song Error:", error);
    return NextResponse.json(
      { error: "Failed to assign song" },
      { status: 500 },
    );
  }
}
