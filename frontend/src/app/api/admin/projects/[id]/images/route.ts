import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

async function tryDeleteFile(url: string) {
  if (!url || !url.startsWith("/uploads/")) return;
  try {
    const filePath = path.join(process.cwd(), "public", url);
    await unlink(filePath);
  } catch { /* file may not exist */ }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const image = await prisma.projectImage.create({
      data: {
        projectId: params.id,
        url: body.url,
        alt: body.alt || "",
        order: body.order ?? 0,
      },
    });
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("[PROJECT IMAGE CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const imageId = request.nextUrl.searchParams.get("imageId");
  if (!imageId) return NextResponse.json({ error: "imageId required" }, { status: 400 });

  try {
    const image = await prisma.projectImage.findUnique({ where: { id: imageId } });
    if (!image || image.projectId !== params.id) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    await prisma.projectImage.delete({ where: { id: imageId } });
    await tryDeleteFile(image.url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PROJECT IMAGE DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
