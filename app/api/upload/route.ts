import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. Extract the Authorization bearer token sent from the client
    const authHeader = request.headers.get("authorization");
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authentication token." },
        { status: 401 },
      );
    }

    // 2. Initialize a user-scoped Supabase client using their auth token so RLS permits the insert
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );

    // Verify user is valid
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid session." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const composer = formData.get("composer") as string;
    const category = formData.get("category") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Sanitize file name
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalName = file.name;
    const lastDotIndex = originalName.lastIndexOf(".");
    const namePart = originalName
      .substring(0, lastDotIndex)
      .replace(/[^a-zA-Z0-9]/g, "_");
    const extPart = originalName.substring(lastDotIndex).toLowerCase();
    const fileName = `${Date.now()}-${namePart}${extPart}`;

    // 3. Upload file to Supabase storage bucket ('media') using user-scoped client
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

    // 4. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(fileName);

    // 5. Insert database row with isApproved: false (Pending admin review)
    const { data: dbData, error: dbError } = await supabase
      .from("MediaItem")
      .insert([
        {
          title: title || "Untitled",
          composer: composer || "Unknown",
          category: category || "HYMN",
          fileUrl: publicUrl,
          isApproved: false, // Hidden from public catalog until admin approves
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
