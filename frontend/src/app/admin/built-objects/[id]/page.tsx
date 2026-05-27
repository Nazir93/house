import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BuiltObjectForm } from "@/components/admin/built-object-form";
import { loadAdminHouseProjectOptions } from "@/lib/load-admin-house-project-options";

export const dynamic = "force-dynamic";

export default async function EditBuiltObjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [object, houseProjects] = await Promise.all([
    (prisma as any).builtObject
      .findUnique({
        where: { id: params.id },
        include: { media: { orderBy: [{ type: "asc" }, { order: "asc" }] } },
      })
      .catch(() => null),
    loadAdminHouseProjectOptions(),
  ]);
  if (!object) notFound();
  return <BuiltObjectForm initial={object} houseProjects={houseProjects} />;
}
