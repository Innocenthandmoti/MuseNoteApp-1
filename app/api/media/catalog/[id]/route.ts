import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/media/catalog/[id] (Update Media Item)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedMedia = await prisma.mediaItem.update({
      where: { id },
      data: { ...body },
    });

    return NextResponse.json(updatedMedia);
  } catch (error: any) {
    console.error("PATCH Media Error:", error);
    return NextResponse.json(
      { error: "Failed to update media record." },
      { status: 500 },
    );
  }
}

// DELETE /api/media/catalog/[id] (Delete Media Item)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.mediaItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Media successfully removed." });
  } catch (error: any) {
    console.error("DELETE Media Error:", error);
    return NextResponse.json(
      { error: "Failed to delete media from database." },
      { status: 500 },
    );
  }
}
