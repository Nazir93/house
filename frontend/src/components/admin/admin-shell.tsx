"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="admin-app min-h-screen text-white/90 [color-scheme:dark]">
      <Suspense
        fallback={
          <aside className="fixed top-0 left-0 h-full z-[70] w-[240px] flex-shrink-0 border-r admin-sidebar-fallback" />
        }
      >
        <AdminSidebar />
      </Suspense>
      <div className="lg:pl-[240px] transition-all duration-300">
        <main className="admin-main-surface min-h-screen p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
