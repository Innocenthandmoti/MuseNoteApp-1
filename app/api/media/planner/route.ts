import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Adjust path to your supabase client helper if needed

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");

  try {
    // Build query to fetch liturgical plans with nested songs and media items
    let query = supabase
      .from("LiturgicalPlan")
      .select(
        `
        *,
        songs:PlanSong (
          *,
          mediaItem:MediaItem (*)
        )
      `,
      )
      .order("date", { ascending: false });

    // Fallback storage filter if owner is specified
    if (owner) {
      query = query.ilike("notes", `%${owner}%`);
    }

    const { data: plans, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json(plans || []);
  } catch (error: any) {
    console.error("GET Plans Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch plans" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, date, notes, owner } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Embed owner inside notes if owner column isn't in schema yet, preventing DB crash
    const formattedNotes = owner
      ? `[Workspace: ${owner}] ${notes || ""}`
      : notes;

    // Insert the new plan into Supabase
    const { data: newPlan, error } = await supabase
      .from("LiturgicalPlan")
      .insert({
        title,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        notes: formattedNotes,
      })
      .select(
        `
        *,
        songs:PlanSong (
          *,
          mediaItem:MediaItem (*)
        )
      `,
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error: any) {
    console.error("POST Plan Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create plan" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    const { error } = await supabase
      .from("LiturgicalPlan")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Plan Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete" },
      { status: 500 },
    );
  }
}
