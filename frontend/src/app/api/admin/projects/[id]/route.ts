import { NextRequest, NextResponse } from "next/server";
import { normalizedProjectVideos } from "@/lib/admin-project-videos";
import { readProjectVideoUrlsArray } from "@/lib/portfolio-data";
import { prisma } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

async function tryDeleteFile(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  try {
    const filePath = path.join(process.cwd(), "public", url);
    await unlink(filePath);
  } catch { /* file may not exist */ }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { order: "asc" } },
        hotspots: true,
      },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (error) {
    console.error("[ADMIN PROJECT GET]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const videoPatch =
      body.videoUrls !== undefined || body.videoUrl !== undefined
        ? normalizedProjectVideos(body)
        : null;

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.service !== undefined && { service: body.service }),
        ...(body.area !== undefined && { area: body.area ? parseInt(body.area) : null }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.seoDescription !== undefined && { seoDescription: body.seoDescription || null }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
        ...(videoPatch && { videoUrls: videoPatch.videoUrls, videoUrl: videoPatch.videoUrl }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(body.year !== undefined && { year: body.year || null }),
        ...(body.industry !== undefined && { industry: body.industry || null }),
        ...(body.projectType !== undefined && { projectType: body.projectType || null }),
        ...(body.features !== undefined && { features: body.features || null }),
        ...(body.goals !== undefined && { goals: body.goals || null }),
        ...(body.leftText1 !== undefined && { leftText1: body.leftText1 || null }),
        ...(body.rightText1 !== undefined && { rightText1: body.rightText1 || null }),
        ...(body.leftText2 !== undefined && { leftText2: body.leftText2 || null }),
        ...(body.rightText2 !== undefined && { rightText2: body.rightText2 || null }),
        ...(body.showcaseLabel1 !== undefined && { showcaseLabel1: body.showcaseLabel1 || null }),
        ...(body.showcaseLabel2 !== undefined && { showcaseLabel2: body.showcaseLabel2 || null }),
        ...(body.showcaseImage1 !== undefined && { showcaseImage1: body.showcaseImage1 || null }),
        ...(body.showcaseImage2 !== undefined && { showcaseImage2: body.showcaseImage2 || null }),
        ...(body.published !== undefined && { published: body.published }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.featuredOnHome !== undefined && { featuredOnHome: Boolean(body.featuredOnHome) }),
        ...(body.homeOrder !== undefined && { homeOrder: parseInt(String(body.homeOrder), 10) || 0 }),
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error("[ADMIN PROJECT UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { images: { select: { url: true } } },
    });
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.project.delete({ where: { id: params.id } });

    const urls = [
      project.coverImage,
      project.showcaseImage1,
      project.showcaseImage2,
      project.videoUrl,
      ...readProjectVideoUrlsArray(project),
      ...project.images.map((i) => i.url),
    ];
    await Promise.allSettled(urls.map(tryDeleteFile));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN PROJECT DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
