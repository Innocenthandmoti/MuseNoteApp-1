import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
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
