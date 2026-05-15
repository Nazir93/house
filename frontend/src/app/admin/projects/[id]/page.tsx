import { redirect } from "next/navigation";

/** Редактирование кейсов Project отключено — публичное портфолио = построенные дома. */
export default function AdminProjectByIdRedirect() {
  redirect("/admin/built-objects");
}
