import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");

  try {
    if (path) {
      const meta = await prisma.pageMeta.findUnique({ where: { path } });
      return NextResponse.json(meta || {});
    }

    const all = await prisma.pageMeta.findMany({ orderBy: { path: "asc" } });
    return NextResponse.json(all);
  } catch (error) {
    console.error("[ADMIN META]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, title, description, keywords, ogTitle, ogDescription, ogImage, h1, bodyHtml, noindex } = body;

    if (!path) {
      return NextResponse.json({ error: "path is required" }, { status: 400 });
    }

    const updatePayload = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(keywords !== undefined && { keywords }),
      ...(ogTitle !== undefined && { ogTitle }),
      ...(ogDescription !== undefined && { ogDescription }),
      ...(ogImage !== undefined && { ogImage }),
      ...(h1 !== undefined && { h1 }),
      ...(bodyHtml !== undefined && { bodyHtml }),
      ...(noindex !== undefined && { noindex }),
    };

    const createPayload = {
      path,
      title: title || null,
      description: description || null,
      keywords: keywords || null,
      ogTitle: ogTitle || null,
      ogDescription: ogDescription || null,
      ogImage: ogImage || null,
      h1: h1 || null,
      bodyHtml: bodyHtml ?? null,
      noindex: noindex || false,
    };

    const meta = await prisma.pageMeta.upsert({
      where: { path },
      update: updatePayload as Prisma.PageMetaUpdateInput,
      create: createPayload as unknown as Prisma.PageMetaCreateInput,
    });

    return NextResponse.json(meta);
  } catch (error) {
    console.error("[ADMIN META UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
