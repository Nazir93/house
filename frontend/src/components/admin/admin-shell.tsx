"use client";

import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="admin-app min-h-screen">
      <div
        className="admin-theme-toggle-wrap fixed right-3 top-3 z-[68] rounded-2xl p-1 backdrop-blur-md sm:right-4 sm:top-4 lg:right-6 lg:top-5"
      >
        <ThemeToggle variant="outline" className="h-10 w-10 rounded-xl border-0 bg-transparent shadow-none" />
      </div>
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
        <main className="admin-main-surface min-h-screen p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8 pr-14 sm:pr-16 lg:pr-10">
          {children}
        </main>
      </div>
    </div>
  );
}
