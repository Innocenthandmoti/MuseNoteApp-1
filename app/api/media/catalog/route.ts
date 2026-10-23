import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.mediaItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Database connection error during build/runtime:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      composer,
      category,
      role,
      season,
      fileUrl,
      audioUrl,
      videoUrl,
    } = body;

    const newItem = await prisma.mediaItem.create({
      data: {
        title,
        composer: composer || "Traditional",
        category: category || "HYMN",
        fileUrl:
          fileUrl ||
          "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      },
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Failed to create catalog item:", error);
    return NextResponse.json(
      { error: "Failed to create catalog item" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  try {
    await prisma.mediaItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete catalog item:", error);
    return NextResponse.json(
      { error: "Failed to delete catalog item" },
      { status: 500 },
    );
  }
}
