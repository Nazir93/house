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
  Calculator,
  UserRound,
  Users,
  Landmark,
  Images,
  HelpCircle,
  Star,
  ContactRound,
  ClipboardList,
  PanelTop,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import { BrandLogo } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
import { useAdminNewLeadsNotify } from "@/hooks/use-admin-new-leads-notify";
import { useAdminPendingTicketsNotify } from "@/hooks/use-admin-pending-tickets-notify";

const NAV_ITEMS = [
  { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Заявки", icon: Inbox },
  { href: "/admin/tickets", label: "Чат с клиентами", icon: MessageCircle },
  { href: "/admin/house-projects", label: "Проекты домов", icon: Home },
  { href: "/admin/calculator", label: "Калькулятор проектов", icon: Calculator },
  { href: "/admin/design-project-pricing", label: "Калькулятор проектирования", icon: Calculator },
  { href: "/admin/home-banner", label: "Главный баннер", icon: PanelTop },
  { href: "/admin/built-objects", label: "Портфолио", icon: Images },
  { href: "/admin/client-projects", label: "Клиенты (кабинет)", icon: UserRound },
  { href: "/admin/posts", label: "Новости", icon: FileText },
  { href: "/admin/services", label: "Услуги", icon: Briefcase },
  { href: "/admin/partners", label: "Партнёры", icon: Users },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/reviews", label: "Отзывы", icon: Star },
  { href: "/admin/team", label: "Команда", icon: ContactRound },
  { href: "/admin/vacancies", label: "Вакансии", icon: ClipboardList },
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
  const { newCount: leadsNewCount, highlight: leadsHighlight } = useAdminNewLeadsNotify();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-[60] relative p-2 rounded-xl shadow-lg transition-colors"
        style={{
          backgroundColor: "var(--adm-sidebar-bg)",
          color: "var(--adm-mobile-btn-fg)",
          boxShadow: "var(--adm-sidebar-glow)",
        }}
        aria-label={
          mobileBadgeCount > 0 ? `Меню, ${mobileBadgeCount} новых уведомлений` : "Меню"
        }
      >
        <Menu size={20} />
        {mobileBadgeCount > 0 ? (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center tabular-nums ring-2 ring-[var(--adm-sidebar-bg)]"
            aria-hidden
          >
            {mobileBadgeCount > 99 ? "99+" : mobileBadgeCount}
          </span>
        ) : null}
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
            const isTickets = item.href === "/admin/tickets";
            const badgeCount = isLeads ? leadsNewCount : isTickets ? ticketsPendingCount : 0;
            const badgeHighlight = isLeads ? leadsHighlight : isTickets ? ticketsHighlight : false;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                  !isActive && "hover:bg-[color:var(--adm-nav-hover-bg)] hover:text-[color:var(--adm-nav-fg-hover)]",
                  badgeCount > 0 && !isActive && "bg-red-500/[0.08]",
                  badgeHighlight &&
                    "ring-2 ring-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.35)] motion-safe:animate-pulse",
                )}
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
                    ? badgeCount > 0
                      ? `${item.label}: ${badgeCount} новых`
                      : item.label
                    : badgeCount > 0
                      ? `${badgeCount} требует внимания`
                      : undefined
                }
              >
                <span className="relative flex-shrink-0">
                  <Icon size={18} className={badgeCount > 0 && !isActive ? "text-red-400" : undefined} />
                  {badgeCount > 0 ? (
                    <span
                      className={cn(
                        "absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-0.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center tabular-nums shadow-[0_0_10px_rgba(239,68,68,0.55)]",
                        collapsed ? "" : "-top-1 -right-2",
                      )}
                      aria-hidden
                    >
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  ) : null}
                </span>
                {!collapsed && (
                  <span className="flex flex-1 items-center justify-between gap-2 min-w-0">
                    <span className={badgeCount > 0 && !isActive ? "text-red-300 font-semibold" : undefined}>
                      {item.label}
                    </span>
                    {badgeCount > 0 ? (
                      <span className="shrink-0 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white tabular-nums">
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    ) : null}
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
