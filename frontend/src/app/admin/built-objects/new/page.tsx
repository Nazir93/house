import { BuiltObjectForm } from "@/components/admin/built-object-form";
import { loadAdminHouseProjectOptions } from "@/lib/load-admin-house-project-options";

export default async function NewBuiltObjectPage() {
  const houseProjects = await loadAdminHouseProjectOptions();
  return <BuiltObjectForm houseProjects={houseProjects} />;
}
