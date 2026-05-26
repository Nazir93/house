import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicReviews } from "@/lib/revalidate-public-content";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { sanitizeReviewAdminFields } from "@/lib/review-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const reviews = await prisma.review.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("[ADMIN REVIEWS]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const safe = sanitizeReviewAdminFields(body);
    const review = await prisma.review.create({
      data: {
        authorName: safe.authorName as string,
        authorPhoto: (safe.authorPhoto as string) || null,
        objectName: (safe.objectName as string) || null,
        service: (safe.service as string) || null,
        rating: (safe.rating as number) ?? 5,
        text: safe.text as string,
        videoUrl: (safe.videoUrl as string) || null,
        visible: body.visible !== false,
        order: (safe.order as number) ?? 0,
      },
    });
    revalidatePublicReviews();
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("[ADMIN REVIEW CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
