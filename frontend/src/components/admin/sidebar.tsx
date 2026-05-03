"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Inbox,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Globe,
  Home,
  MapPinned,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { LEAD_SOURCE_OPTIONS } from "@/lib/lead-sources";
import { SITE_NAME } from "@/lib/constants";
import { useAdminNewLeadsNotify } from "@/hooks/use-admin-new-leads-notify";

const LEADS_SUBLINKS: { href: string; label: string }[] = [
  { href: "/admin/leads", label: "Все формы" },
  ...LEAD_SOURCE_OPTIONS.map((o) => ({
    href: `/admin/leads?source=${encodeURIComponent(o.value)}`,
    label: o.label,
  })),
];

const NAV_ITEMS = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Заявки", icon: Inbox, leadsSubmenu: true as const },
  { href: "/admin/house-projects", label: "Проекты домов", icon: Home },
  { href: "/admin/built-objects", label: "Построенные дома", icon: MapPinned },
  { href: "/admin/client-projects", label: "Клиенты (кабинет)", icon: UserRound },
  { href: "/admin/posts", label: "Новости", icon: FileText },
  { href: "/admin/services", label: "Услуги", icon: Briefcase },
  { href: "/admin/seo", label: "SEO", icon: Globe },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { highlight: leadsHighlight, badgeCount: leadsBadge } = useAdminNewLeadsNotify();

  const leadsSourceFilter = searchParams.get("source");

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-[60] p-2 rounded-lg bg-[#111111] text-white/70 hover:text-white"
      >
        <Menu size={20} />
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[69] bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-[70] flex flex-col
          bg-[#111111] border-r border-white/[0.08]
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[68px]" : "w-[240px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.08]">
          {!collapsed && (
            <Link href="/admin" className="text-sm font-bold tracking-wide text-white">
              {SITE_NAME}
            </Link>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft size={16} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isLeads = "leadsSubmenu" in item && item.leadsSubmenu;
            const isActive = item.exact
              ? pathname === item.href
              : isLeads
                ? pathname.startsWith("/admin/leads")
                : pathname.startsWith(item.href);

            if (isLeads) {
              return (
                <div key={item.href} className="space-y-0.5">
                  <Link
                    href="/admin/leads"
                    onClick={() => setMobileOpen(false)}
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium
                      transition-all duration-150
                      ${isActive
                        ? "bg-[#0F3D2E]/15 text-emerald-300"
                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                      }
                      ${leadsHighlight ? "ring-2 ring-[#0F3D2E]/50 shadow-[0_0_18px_rgba(15,61,46,0.12)] motion-safe:animate-pulse" : ""}
                    `}
                    title={
                      collapsed
                        ? leadsBadge > 0
                          ? `${item.label}: ${leadsBadge} новых`
                          : item.label
                        : undefined
                    }
                  >
                    <span className="relative flex-shrink-0">
                      <Icon size={18} />
                      {collapsed && leadsBadge > 0 && (
                        <span
                          className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center tabular-nums"
                          aria-hidden
                        >
                          {leadsBadge > 99 ? "99+" : leadsBadge}
                        </span>
                      )}
                    </span>
                    {!collapsed && (
                      <span className="flex items-center gap-2 min-w-0">
                        <span>{item.label}</span>
                        {leadsBadge > 0 && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400 shrink-0">
                            +{leadsBadge > 99 ? "99+" : leadsBadge}
                          </span>
                        )}
                      </span>
                    )}
                  </Link>
                  {!collapsed && (
                    <div className="pl-2 ml-2 border-l border-white/[0.06] space-y-0.5 py-0.5">
                      {LEADS_SUBLINKS.map((sub) => {
                        const subUrl = new URL(sub.href, "https://x.local");
                        const want = subUrl.searchParams.get("source");
                        const subActive =
                          pathname === "/admin/leads" &&
                          (want === null
                            ? leadsSourceFilter == null
                            : leadsSourceFilter === want);
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className={`
                              block pl-2 pr-2 py-1.5 rounded-md text-[12px] leading-snug
                              transition-colors
                              ${subActive
                                ? "text-emerald-300 bg-[#0F3D2E]/10"
                                : "text-white/35 hover:text-white/65 hover:bg-white/[0.04]"
                              }
                            `}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium
                  transition-all duration-150
                  ${isActive
                    ? "bg-[#0F3D2E]/15 text-emerald-300"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-white/[0.08]">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150"
            title={collapsed ? "Выйти" : undefined}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Выйти</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
