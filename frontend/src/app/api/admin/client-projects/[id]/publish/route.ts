import { NextRequest, NextResponse } from "next/server";
import { publishClientProjectToCabinet } from "@/lib/client-project-publish";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { revalidatePublicConstructionCatalog } from "@/lib/revalidate-public-content";

export const dynamic = "force-dynamic";

/** Публикация в ЛК: данные для клиента + уведомления по платежам/этапам. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  const { id } = await params;
  try {
    await publishClientProjectToCabinet(id);
    const project = await prisma.clientConstructionProject.findUnique({
      where: { id },
      select: {
        showOnPublicSite: true,
        builtObjectId: true,
        builtObject: { select: { slug: true, siteStatus: true } },
      },
    });
    if (project?.builtObjectId) {
      revalidatePublicConstructionCatalog();
    }
    return NextResponse.json({
      ok: true,
      publishedAt: new Date().toISOString(),
      publicSite:
        project?.showOnPublicSite && project.builtObject
          ? {
              slug: project.builtObject.slug,
              siteStatus: project.builtObject.siteStatus,
            }
          : null,
    });
  } catch (e) {
    const msg = (e as Error)?.message;
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (msg === "CONTRACT_EXISTS") {
      return NextResponse.json({ error: "Такой номер договора уже есть" }, { status: 409 });
    }
    console.error("[ADMIN CLIENT PROJECT PUBLISH]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
