import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BuiltObjectForm } from "@/components/admin/built-object-form";

export const dynamic = "force-dynamic";

export default async function EditBuiltObjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  let object: any = null;
  try {
    object = await (prisma as any).builtObject.findUnique({
      where: { id: params.id },
      include: { media: { orderBy: [{ type: "asc" }, { order: "asc" }] } },
    });
  } catch {
    object = null;
  }
  if (!object) notFound();
  return <BuiltObjectForm initial={object} />;
}
