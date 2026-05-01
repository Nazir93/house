import { AdminShell } from "@/components/admin/admin-shell";
import { SessionProvider } from "@/components/admin/session-provider";
import { SITE_NAME } from "@/lib/constants";

export const metadata = {
  title: `Админ-панель | ${SITE_NAME}`,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
