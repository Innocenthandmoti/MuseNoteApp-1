// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// // Force dynamic rendering so Next.js doesn't try to pre-render this during build time
// export const dynamic = "force-dynamic";

// export async function GET() {
//   try {
//     const catalog = await prisma.mediaItem.findMany();
//     return NextResponse.json(catalog);
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch catalog items" },
//       { status: 500 },
//     );
//   }
// }

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Force dynamic rendering so Next.js skips build-time static evaluation
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await prisma.mediaItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(catalog);
  } catch (error) {
    console.error("Error fetching media catalog:", error);
    return NextResponse.json(
      { error: "Failed to fetch media catalog" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = await prisma.mediaItem.create({
      data: {
        title: body.title,
        composer: body.composer,
        category: body.category,
        fileUrl: body.fileUrl,
      },
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating media item:", error);
    return NextResponse.json(
      { error: "Failed to create media item" },
      { status: 500 },
    );
  }
}
