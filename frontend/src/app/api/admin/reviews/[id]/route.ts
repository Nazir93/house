import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicReviews } from "@/lib/revalidate-public-content";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { sanitizeReviewAdminFields } from "@/lib/review-content";

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const safe = sanitizeReviewAdminFields(body);
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        ...(safe.authorName !== undefined && { authorName: safe.authorName as string }),
        ...(safe.authorPhoto !== undefined && { authorPhoto: (safe.authorPhoto as string) || null }),
        ...(safe.objectName !== undefined && { objectName: (safe.objectName as string) || null }),
        ...(safe.service !== undefined && { service: (safe.service as string) || null }),
        ...(safe.rating !== undefined && { rating: safe.rating as number }),
        ...(safe.text !== undefined && { text: safe.text as string }),
        ...(safe.videoUrl !== undefined && { videoUrl: (safe.videoUrl as string) || null }),
        ...(body.visible !== undefined && { visible: Boolean(body.visible) }),
        ...(safe.order !== undefined && { order: safe.order as number }),
      },
    });
    revalidatePublicReviews();
    return NextResponse.json(review);
  } catch (error) {
    console.error("[ADMIN REVIEW UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    await prisma.review.delete({ where: { id: params.id } });
    revalidatePublicReviews();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN REVIEW DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
