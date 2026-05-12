"use client";

import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="admin-app min-h-screen">
      <Suspense
        fallback={
          <aside className="fixed top-0 left-0 h-full z-[70] w-[240px] flex-shrink-0 border-r admin-sidebar-fallback" />
        }
      >
        <AdminSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      </Suspense>
      <div
        className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-[240px]"}`}
      >
        <main className="admin-main-surface min-h-screen p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
