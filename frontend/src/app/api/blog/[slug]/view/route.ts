import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/** +1 просмотр опубликованной новости (идемпотентность — на клиенте через sessionStorage). */
export async function POST(_request: NextRequest, { params }: Params) {
  const { slug: raw } = await params;
  const slug = typeof raw === "string" ? raw.trim() : "";
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  try {
    const existing = await prisma.post.findFirst({
      where: { slug, published: true },
      select: { id: true, viewCount: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.post.update({
      where: { id: existing.id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });

    return NextResponse.json({ ok: true, viewCount: updated.viewCount });
  } catch (e) {
    console.error("[BLOG VIEW]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
