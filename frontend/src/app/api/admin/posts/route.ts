import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

function normalizeVideoList(arr: unknown, single: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (u: unknown) => {
    if (typeof u !== "string") return;
    const s = u.trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };
  if (Array.isArray(arr)) arr.forEach(push);
  push(single);
  return out;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search");
  const published = searchParams.get("published");

  const where: Record<string, unknown> = {};
  if (published === "true") where.published = true;
  if (published === "false") where.published = false;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("[ADMIN POSTS]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, excerpt, content, category, coverImage, published } = body;
    const coverVideos = normalizeVideoList(body.coverVideos, body.coverVideo);
    const galleryUrls = Array.isArray(body.galleryUrls)
      ? body.galleryUrls.filter((u: unknown) => typeof u === "string" && (u as string).trim())
      : [];

    if (!title || !excerpt || !content || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let slug = body.slug || generateSlug(title);

    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const post = await prisma.post.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        category,
        coverImage: coverImage || null,
        coverVideos: coverVideos as string[],
        coverVideo: coverVideos[0] ?? null,
        galleryUrls: galleryUrls as string[],
        published: published ?? false,
      } as Parameters<typeof prisma.post.create>[0]["data"],
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[ADMIN POST CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
