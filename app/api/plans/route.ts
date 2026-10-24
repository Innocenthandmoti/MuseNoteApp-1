import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Force dynamic rendering so Next.js skips build-time static evaluation
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await prisma.liturgicalPlan.findMany({
      include: {
        songs: {
          include: {
            mediaItem: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch liturgical plans" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPlan = await prisma.liturgicalPlan.create({
      data: {
        title: body.title,
        date: new Date(body.date),
        notes: body.notes,
        owner: body.owner || "st-cecilia@parish.org",
      },
    });
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Failed to create liturgical plan" },
      { status: 500 },
    );
  }
}
