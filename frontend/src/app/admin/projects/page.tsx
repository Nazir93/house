import { redirect } from "next/navigation";

/** Старый URL: портфолио на сайте ведётся в «Построенных домах». */
export default function AdminProjectsListRedirect() {
  redirect("/admin/built-objects");
}
