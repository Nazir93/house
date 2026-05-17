import { notFound } from "next/navigation";
import { ClientProjectAdminForm } from "@/components/admin/client-project-admin-form";
import { loadAdminClientProjectInitial } from "@/lib/load-admin-client-project";

export const dynamic = "force-dynamic";

export default async function EditClientProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const initial = await loadAdminClientProjectInitial(params.id);
  if (!initial) notFound();

  return <ClientProjectAdminForm projectId={params.id} initial={initial} />;
}
