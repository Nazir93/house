import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { CACHE_TAG_PUBLIC_HOUSE_PROJECTS } from "@/lib/cache-tags-public";
import {
  clampLikeCount,
  engagementCookieKey,
  ENGAGEMENT_LIKE_COOKIE_MAX_AGE,
  ENGAGEMENT_VIEW_COOKIE_MAX_AGE,
  resolveHouseProjectEngagement,
} from "@/lib/house-project-engagement";
import { checkPublicApiRateLimitAsync, rateLimitKeyFromHeaders } from "@/lib/public-api-rate-limit";
import { revalidateTagWithProfile } from "@/lib/revalidate-tag";

export const dynamic = "force-dynamic";

type EngagementAction = "view" | "like";

async function loadEngagement(slug: string) {
  const row = await prisma.houseProject.findFirst({
    where: { slug, published: true },
    select: { slug: true, area: true, order: true, isNew: true, viewCount: true, likeCount: true },
  });
  if (!row) return null;
  return {
    slug: row.slug,
    ...resolveHouseProjectEngagement(row),
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const data = await loadEngagement(slug);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cookieStore = await cookies();
  const liked = cookieStore.get(engagementCookieKey("like", slug))?.value === "1";

  return NextResponse.json({
    viewCount: data.viewCount,
    likeCount: data.likeCount,
    liked,
  });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  if (
    !(await checkPublicApiRateLimitAsync(rateLimitKeyFromHeaders(request.headers), {
      namespace: "project-engagement",
      max: 120,
      windowMs: 10 * 60 * 1000,
    }))
  ) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug } = await context.params;
  const row = await prisma.houseProject.findFirst({
    where: { slug, published: true },
    select: { id: true, slug: true, area: true, order: true, isNew: true, viewCount: true, likeCount: true },
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let action: EngagementAction = "view";
  let likedPayload: boolean | undefined;
  try {
    const body = await request.json();
    if (body?.action === "like") action = "like";
    if (typeof body?.liked === "boolean") likedPayload = body.liked;
  } catch {
    /* default view */
  }

  const cookieStore = await cookies();
  const viewKey = engagementCookieKey("view", slug);
  const likeKey = engagementCookieKey("like", slug);
  const wasLiked = cookieStore.get(likeKey)?.value === "1";

  let viewCount = row.viewCount;
  let likeCount = row.likeCount;
  let liked = wasLiked;

  if (action === "view") {
    if (!cookieStore.get(viewKey)) {
      const updated = await prisma.houseProject.update({
        where: { id: row.id },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true, likeCount: true },
      });
      viewCount = updated.viewCount;
      likeCount = updated.likeCount;
      cookieStore.set(viewKey, "1", {
        maxAge: ENGAGEMENT_VIEW_COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
  } else {
    const wantLiked = likedPayload ?? !wasLiked;
    if (wantLiked && !wasLiked) {
      const updated = await prisma.houseProject.update({
        where: { id: row.id },
        data: { likeCount: { increment: 1 } },
        select: { viewCount: true, likeCount: true },
      });
      viewCount = updated.viewCount;
      likeCount = updated.likeCount;
      liked = true;
      cookieStore.set(likeKey, "1", {
        maxAge: ENGAGEMENT_LIKE_COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      revalidateTagWithProfile(CACHE_TAG_PUBLIC_HOUSE_PROJECTS);
    } else if (!wantLiked && wasLiked) {
      const updated = await prisma.houseProject.update({
        where: { id: row.id },
        data: { likeCount: { decrement: 1 } },
        select: { viewCount: true, likeCount: true },
      });
      viewCount = updated.viewCount;
      likeCount = clampLikeCount(updated.likeCount);
      if (likeCount !== updated.likeCount) {
        await prisma.houseProject.update({
          where: { id: row.id },
          data: { likeCount },
        });
      }
      liked = false;
      cookieStore.delete(likeKey);
      revalidateTagWithProfile(CACHE_TAG_PUBLIC_HOUSE_PROJECTS);
    }
  }

  const resolved = resolveHouseProjectEngagement({
    area: row.area,
    order: row.order,
    isNew: row.isNew,
    viewCount,
    likeCount,
  });

  return NextResponse.json({
    viewCount: resolved.viewCount,
    likeCount: resolved.likeCount,
    liked,
  });
}
