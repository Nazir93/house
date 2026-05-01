import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        ...(body.authorName !== undefined && { authorName: body.authorName }),
        ...(body.authorPhoto !== undefined && { authorPhoto: body.authorPhoto || null }),
        ...(body.objectName !== undefined && { objectName: body.objectName || null }),
        ...(body.service !== undefined && { service: body.service || null }),
        ...(body.rating !== undefined && { rating: body.rating }),
        ...(body.text !== undefined && { text: body.text }),
        ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl || null }),
        ...(body.visible !== undefined && { visible: body.visible }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });
    return NextResponse.json(review);
  } catch (error) {
    console.error("[ADMIN REVIEW UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.review.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN REVIEW DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
