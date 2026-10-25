import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");

  try {
    const plans = await prisma.liturgicalPlan.findMany({
      where: owner ? { notes: { contains: owner } } : undefined, // fallback storage filter if owner column isn't migrated
      include: {
        songs: {
          include: { mediaItem: true },
        },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(plans);
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

    const newPlan = await prisma.liturgicalPlan.create({
      data: {
        title,
        date: date ? new Date(date) : new Date(),
        notes: formattedNotes,
      },
      include: {
        songs: {
          include: { mediaItem: true },
        },
      },
    });

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
    await prisma.liturgicalPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Plan Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete" },
      { status: 500 },
    );
  }
}
