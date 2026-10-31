import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Extract the Authorization header sent from the frontend
    const authHeader = req.headers.get("Authorization");

    // Initialize Supabase client with the user's auth token so RLS knows who is making the request
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader || "",
        },
      },
    });

    const body = await req.json();
    const {
      existingPlanId,
      selectedDate,
      feastName,
      season,
      selections,
      userId,
    } = body;

    if (existingPlanId) {
      // Update existing plan
      const { error: updateError } = await supabase
        .from("LiturgicalPlan")
        .update({
          feast_name: feastName,
          season,
          selections,
        })
        .eq("id", existingPlanId);

      if (updateError) {
        console.error("Supabase Update Error:", updateError);
        throw updateError;
      }
      return NextResponse.json({ success: true });
    } else {
      // Create new plan with user_id
      const { data, error: insertError } = await supabase
        .from("LiturgicalPlan")
        .insert({
          date: selectedDate,
          feast_name: feastName,
          season,
          selections,
          user_id: userId || null,
        })
        .select("share_token, id")
        .single();

      if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        throw insertError;
      }
      return NextResponse.json({ success: true, ...data });
    }
  } catch (err: any) {
    console.error("API Save Plan Exception:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save plan." },
      { status: 500 },
    );
  }
}
