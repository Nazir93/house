import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("[ADMIN REVIEWS]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const review = await prisma.review.create({
      data: {
        authorName: body.authorName,
        authorPhoto: body.authorPhoto || null,
        objectName: body.objectName || null,
        service: body.service || null,
        rating: body.rating ?? 5,
        text: body.text,
        videoUrl: body.videoUrl || null,
        visible: body.visible ?? true,
        order: body.order ?? 0,
      },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("[ADMIN REVIEW CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
