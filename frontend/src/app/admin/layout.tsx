import { AdminShell } from "@/components/admin/admin-shell";
import { authOptions } from "@/lib/auth";
import { SITE_NAME } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: `Админ-панель | ${SITE_NAME}`,
};

/** Доступ к HTML /admin проверяется здесь (Node + getServerSession), а не в Edge middleware — там JWT часто не расшифровывается. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-url-pathname") ?? "";
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  const isLogin =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname.startsWith("/admin/login?");

  if (isLogin) {
    if (role === "admin") {
      redirect("/admin");
    }
    if (role === "client") {
      redirect("/account/dashboard");
    }
    return <AdminShell>{children}</AdminShell>;
  }

  if (role === "client") {
    redirect("/account/dashboard");
  }

  if (!session?.user || role !== "admin") {
    const dest =
      pathname && pathname.startsWith("/admin") ? pathname : "/admin";
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(dest)}`);
  }

  return <AdminShell>{children}</AdminShell>;
}
