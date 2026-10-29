import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Initialize admin-level Supabase client for backend operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const composer = formData.get("composer") as string;
    const category = formData.get("category") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const originalName = file.name;
    const lastDotIndex = originalName.lastIndexOf(".");
    const namePart = originalName
      .substring(0, lastDotIndex)
      .replace(/[^a-zA-Z0-9]/g, "_");
    const extPart = originalName.substring(lastDotIndex).toLowerCase();
    const fileName = `${Date.now()}-${namePart}${extPart}`;

    // 1. Upload file to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("media")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 2. Get Public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("media").getPublicUrl(fileName);

    // 3. Insert record using service role client
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("MediaItem")
      .insert([
        {
          title: title || "Untitled",
          composer: composer || "Unknown",
          category: category || "HYMN",
          fileUrl: publicUrl,
          isApproved: false, // Default to false pending admin approval
        },
      ])
      .select();

    if (dbError) {
      console.error("Database Insert Error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Score submitted successfully and is pending admin approval.",
        item: dbData[0],
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload" },
      { status: 500 },
    );
  }
}
