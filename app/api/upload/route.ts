import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

    // Convert file to buffer for Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    // 1. Upload file to Supabase Storage bucket named 'media'
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 2. Get public URL of the file
    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(fileName);

    // 3. Save metadata into your database table with isApproved set to false
    const { data: dbData, error: dbError } = await supabase
      .from("MediaItem")
      .insert([
        {
          title: title || "Untitled",
          composer: composer || "Unknown",
          category: category || "HYMN",
          fileUrl: publicUrl,
          isApproved: false, // Requires admin approval before appearing publicly
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
