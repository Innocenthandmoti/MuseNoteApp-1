import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function POST(request: Request) {
  try {
    const { planId, mediaItemId, massPart } = await request.json();

    const planSong = await prisma.planSong.create({
      data: {
        planId,
        mediaItemId,
        massPart,
      },
      include: { mediaItem: true },
    });

    return NextResponse.json(planSong, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to assign song" },
      { status: 500 },
    );
  }
}
