import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { HouseProjectForm } from "@/components/admin/house-project-form";

export const dynamic = "force-dynamic";

export default async function EditPartnerHouseProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  let project: any = null;
  try {
    project = await (prisma as any).houseProject.findFirst({
      where: { id: params.id, catalogKind: "partner" },
      include: { media: { orderBy: [{ type: "asc" }, { order: "asc" }] } },
    });
  } catch {
    project = null;
  }

  if (!project) notFound();
  return <HouseProjectForm initial={project} catalogKind="partner" />;
}
