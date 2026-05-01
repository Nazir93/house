import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error("[ADMIN POST GET]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, category, coverImage, published } = body;
    const hasVideoChange = body.coverVideos !== undefined || body.coverVideo !== undefined;
    const videoPatch = hasVideoChange
      ? (() => {
          const vids = normalizeVideoList(body.coverVideos, body.coverVideo);
          return { coverVideos: vids, coverVideo: vids[0] ?? null };
        })()
      : null;
    const galleryPatch = body.galleryUrls !== undefined
      ? { galleryUrls: Array.isArray(body.galleryUrls) ? body.galleryUrls.filter((u: unknown) => typeof u === "string" && (u as string).trim()) : [] }
      : null;

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(coverImage !== undefined && { coverImage }),
        ...(videoPatch && videoPatch),
        ...(galleryPatch && galleryPatch),
        ...(published !== undefined && { published }),
      } as Parameters<typeof prisma.post.update>[0]["data"],
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[ADMIN POST UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN POST DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
