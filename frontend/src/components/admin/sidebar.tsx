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
  UserRound,
  Users,
  Landmark,
  Images,
  HelpCircle,
  Star,
  ContactRound,
  PanelTop,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
import { useAdminNewLeadsNotify } from "@/hooks/use-admin-new-leads-notify";

const NAV_ITEMS = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Заявки", icon: Inbox },
  { href: "/admin/house-projects", label: "Проекты домов", icon: Home },
  { href: "/admin/home-banner", label: "Главный баннер", icon: PanelTop },
  { href: "/admin/built-objects", label: "Портфолио", icon: Images },
  { href: "/admin/client-projects", label: "Клиенты (кабинет)", icon: UserRound },
  { href: "/admin/posts", label: "Новости", icon: FileText },
  { href: "/admin/services", label: "Услуги", icon: Briefcase },
  { href: "/admin/partners", label: "Партнёры", icon: Users },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/reviews", label: "Отзывы", icon: Star },
  { href: "/admin/team", label: "Команда", icon: ContactRound },
  { href: "/admin/mortgage", label: "Ипотека", icon: Landmark },
  { href: "/admin/seo", label: "SEO", icon: Globe },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

type AdminSidebarProps = {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
};

export function AdminSidebar({ collapsed: collapsedProp, onCollapsedChange }: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const [collapsedLocal, setCollapsedLocal] = useState(false);
  const isControlled = collapsedProp !== undefined && onCollapsedChange !== undefined;
  const collapsed = isControlled ? collapsedProp! : collapsedLocal;
  const setCollapsed = (next: boolean) => {
    if (isControlled) onCollapsedChange!(next);
    else setCollapsedLocal(next);
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const { highlight: leadsHighlight, badgeCount: leadsBadge } = useAdminNewLeadsNotify();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-[60] p-2 rounded-xl shadow-lg transition-colors"
        style={{
          backgroundColor: "var(--adm-sidebar-bg)",
          color: "var(--adm-mobile-btn-fg)",
          boxShadow: "var(--adm-sidebar-glow)",
        }}
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
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[68px]" : "w-[240px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          backgroundColor: "var(--adm-sidebar-bg)",
          borderRight: "1px solid var(--adm-sidebar-border)",
          boxShadow: "var(--adm-sidebar-glow)",
        }}
      >
        {/* Header */}
        <div
          className={cn(
            "flex border-b",
            collapsed
              ? "flex-col items-center gap-1 py-2.5 px-2"
              : "h-14 items-center justify-between px-4",
          )}
          style={{ borderColor: "var(--adm-sidebar-border)" }}
        >
          <Link
            href="/admin"
            className="flex min-w-0 items-center transition-opacity hover:opacity-90"
            aria-label={SITE_NAME}
            title={SITE_NAME}
          >
            <BrandLogo height={collapsed ? 28 : 32} variant="app" className="min-w-0" />
          </Link>
          <button
            onClick={() => {
              setCollapsed(!collapsed);
              setMobileOpen(false);
            }}
            className="p-1.5 rounded-md transition-colors hover:bg-[color:var(--adm-nav-hover-bg)] hover:text-[color:var(--adm-nav-fg-hover)]"
            style={{ color: "var(--adm-nav-fg)" }}
            title={collapsed ? "Развернуть меню" : "Свернуть меню"}
          >
            <ChevronLeft size={16} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isLeads = item.href === "/admin/leads";
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                  transition-all duration-150
                  ${isActive ? "" : "hover:bg-[color:var(--adm-nav-hover-bg)] hover:text-[color:var(--adm-nav-fg-hover)]"}
                  ${isLeads && leadsHighlight ? "ring-2 ring-[#0F3D2E]/50 shadow-[0_0_18px_rgba(15,61,46,0.12)] motion-safe:animate-pulse" : ""}
                `}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--adm-nav-active-bg)",
                        color: "var(--adm-nav-active-fg)",
                      }
                    : { color: "var(--adm-nav-fg)" }
                }
                title={
                  collapsed
                    ? isLeads && leadsBadge > 0
                      ? `${item.label}: ${leadsBadge} новых`
                      : item.label
                    : undefined
                }
              >
                <span className="relative flex-shrink-0">
                  <Icon size={18} />
                  {isLeads && collapsed && leadsBadge > 0 && (
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
                    {isLeads && leadsBadge > 0 && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400 shrink-0">
                        +{leadsBadge > 99 ? "99+" : leadsBadge}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t space-y-1.5" style={{ borderColor: "var(--adm-sidebar-border)" }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 hover:bg-[color:var(--adm-nav-hover-bg)] hover:text-[color:var(--adm-nav-fg-hover)]"
            style={{ color: "var(--adm-nav-fg)" }}
            title={collapsed ? "На сайт" : undefined}
          >
            <ExternalLink size={18} className="flex-shrink-0" />
            {!collapsed && <span>На сайт</span>}
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 hover:text-red-400 hover:bg-red-500/[0.08]"
            style={{ color: "var(--adm-foot-fg)" }}
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
