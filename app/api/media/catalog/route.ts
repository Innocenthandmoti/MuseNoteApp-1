import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Force dynamic rendering so Next.js doesn't try to pre-render this during build time
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await prisma.mediaItem.findMany();
    return NextResponse.json(catalog);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch catalog items" },
      { status: 500 },
    );
  }
}
