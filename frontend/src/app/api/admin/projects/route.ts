import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizedProjectVideos } from "@/lib/admin-project-videos";
import { generateSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";

  try {
    const projects = await prisma.project.findMany({
      where: search
        ? { title: { contains: search, mode: "insensitive" } }
        : undefined,
      orderBy: { order: "asc" },
      include: { images: { orderBy: { order: "asc" } }, _count: { select: { hotspots: true } } },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[ADMIN PROJECTS]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = body.slug || generateSlug(body.title);
    const { videoUrls, videoUrl } = normalizedProjectVideos(body);

    const galleryUrls: string[] = Array.isArray(body.galleryUrls)
      ? body.galleryUrls.filter((u: unknown) => typeof u === "string" && (u as string).trim())
      : [];
    const coverImage = body.coverImage || galleryUrls[0] || "";

    const project = await prisma.project.create({
      data: {
        slug,
        title: body.title,
        category: body.category || "OTHER",
        service: body.service || "ELECTRICAL",
        area: body.area ? parseInt(body.area) : null,
        description: body.description || "",
        seoDescription: body.seoDescription?.trim() || null,
        coverImage,
        videoUrls,
        videoUrl,
        location: body.location || null,
        year: body.year || null,
        industry: body.industry || null,
        projectType: body.projectType || null,
        published: body.published ?? false,
        order: body.order ?? 0,
        featuredOnHome: body.featuredOnHome ?? false,
        homeOrder: body.homeOrder != null ? parseInt(String(body.homeOrder), 10) || 0 : 0,
      },
    });

    if (galleryUrls.length > 0) {
      await prisma.projectImage.createMany({
        data: galleryUrls.map((url: string, i: number) => ({
          projectId: project.id,
          url,
          alt: "",
          order: i,
        })),
      });
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("[ADMIN PROJECT CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
