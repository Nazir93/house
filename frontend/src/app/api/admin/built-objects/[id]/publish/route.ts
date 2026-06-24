import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { revalidatePublicConstructionCatalog } from "@/lib/revalidate-public-content";
import { hasUnpublishedBuiltObjectSiteDraft } from "@/lib/built-object-admin-sections";

export const dynamic = "force-dynamic";

/** Публикация объекта в публичное портфолио на сайте. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    const exists = await (prisma as any).builtObject.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const object = await (prisma as any).builtObject.update({
      where: { id },
      data: {
        published: true,
        sitePublishedAt: new Date(),
      },
      select: {
        id: true,
        published: true,
        updatedAt: true,
        sitePublishedAt: true,
      },
    });

    revalidatePublicConstructionCatalog();

    return NextResponse.json({
      ok: true,
      publishedAt: object.sitePublishedAt?.toISOString(),
      hasUnpublishedDraft: hasUnpublishedBuiltObjectSiteDraft(object),
    });
  } catch (error) {
    console.error("[ADMIN BUILT OBJECT PUBLISH]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
