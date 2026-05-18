"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ListOrdered,
  Images,
  Video,
  FileText,
  CreditCard,
  MessageCircle,
  LogOut,
  Menu,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { AccountHeaderSignals } from "@/lib/account-header-signals";
import { CLIENT_CABINET_NOTIFICATIONS_HREF } from "@/lib/client-cabinet-bell";

const NAV = [
  { href: "/account/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/account/stages", label: "Этапы строительства", icon: ListOrdered },
  { href: "/account/photos", label: "Фотоотчёты", icon: Images },
  { href: "/account/camera", label: "Онлайн камера", icon: Video },
  { href: "/account/documents", label: "Документы", icon: FileText },
  { href: "/account/payments", label: "Платежи", icon: CreditCard },
  { href: "/account/support", label: "Обращения", icon: MessageCircle },
] as const;

const SIDEBAR_STORAGE_KEY = "account-sidebar-collapsed";

const DEFAULT_SIGNALS: AccountHeaderSignals = {
  attentionCount: 0,
  notificationsUnread: 0,
  paymentsDue: 0,
  ticketsActive: 0,
};

export function AccountShell({
  children,
  supportPhone,
  workingHours,
  headerSignals = DEFAULT_SIGNALS,
}: {
  children: React.ReactNode;
  supportPhone: string;
  workingHours: string;
  headerSignals?: AccountHeaderSignals;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const greeting = session?.user?.name?.trim() || "Клиент";
  const { attentionCount, notificationsUnread, paymentsDue, ticketsActive } = headerSignals;

  const bellHref = CLIENT_CABINET_NOTIFICATIONS_HREF;
  const bellCount = notificationsUnread;

  const bellLabel =
    notificationsUnread > 0
      ? `Непрочитанных уведомлений: ${notificationsUnread}. Открыть центр уведомлений`
      : "Уведомления";

  const sidebarWide = !sidebarCollapsed;

  return (
    <div
      className="account-premium-shell app-branded-surface min-h-screen flex"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[65] bg-black/40 lg:hidden"
          aria-label="Закрыть меню"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          account-premium-sidebar fixed lg:sticky top-0 z-[70] h-screen flex-shrink-0 flex flex-col border-r backdrop-blur-xl
          transition-[width,transform] duration-200 lg:translate-x-0
          ${sidebarCollapsed ? "account-premium-sidebar--collapsed w-[4.25rem]" : "w-[220px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          borderColor: "var(--border)",
          backgroundColor: "color-mix(in srgb, var(--card-bg) 92%, var(--bg) 8%)",
        }}
      >
        <div className="p-3 border-b flex items-center gap-2 min-h-[3.25rem]" style={{ borderColor: "var(--border)" }}>
          <Link
            href="/account/dashboard"
            className="min-w-0 flex items-center gap-2.5 transition-opacity hover:opacity-90"
            title={SITE_NAME}
            aria-label={SITE_NAME}
          >
            <BrandLogo height={30} variant="app" className="shrink-0" />
            <span className="account-sidebar-brand-text font-heading text-base font-bold tracking-tight truncate transition-opacity">
              {SITE_NAME}
            </span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 mt-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/account/dashboard" && pathname.startsWith(href));
            const navBadge =
              href === "/account/payments" ? paymentsDue : href === "/account/support" ? ticketsActive : 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={sidebarWide ? undefined : label}
                className={`account-nav-link relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "shadow-sm"
                    : "hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)] dark:hover:bg-white/[0.06]"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
                        color: "var(--accent)",
                      }
                    : { color: "var(--text-muted)" }
                }
              >
                <Icon className="h-[17px] w-[17px] shrink-0 opacity-90" aria-hidden />
                <span className="account-sidebar-label flex-1 text-left truncate">{label}</span>
                {navBadge > 0 ? (
                  <span
                    className="account-nav-badge min-w-[1.15rem] rounded-full px-1 py-0.5 text-center text-[9px] font-bold tabular-nums leading-none"
                    style={{
                      backgroundColor:
                        href === "/account/payments"
                          ? "color-mix(in srgb, var(--sale) 20%, transparent)"
                          : "color-mix(in srgb, var(--accent) 18%, transparent)",
                      color: href === "/account/payments" ? "var(--sale)" : "var(--accent)",
                    }}
                  >
                    {sidebarWide ? (navBadge > 99 ? "99+" : navBadge) : ""}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t p-2 lg:block space-y-1" style={{ borderColor: "var(--border)" }}>
          <button
            type="button"
            onClick={toggleSidebar}
            className="account-nav-link flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors hover:bg-[color-mix(in_srgb,var(--text)_6%,transparent)]"
            style={{ color: "var(--text-muted)" }}
            title={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
            aria-expanded={sidebarWide}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-[17px] w-[17px] shrink-0" aria-hidden />
            ) : (
              <PanelLeftClose className="h-[17px] w-[17px] shrink-0" aria-hidden />
            )}
            <span className="account-sidebar-label">Свернуть меню</span>
          </button>
        </div>

        <div
          className="account-sidebar-support-text p-3 text-[11px] border-t space-y-0.5"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <p className="font-semibold text-xs" style={{ color: "var(--text)" }}>
            Поддержка
          </p>
          {supportPhone ? <p className="truncate">{supportPhone}</p> : null}
          {workingHours ? <p>{workingHours}</p> : null}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header
          className="sticky top-0 z-[60] flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5 border-b backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--bg)_82%,transparent)]"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "color-mix(in srgb, var(--bg) 90%, transparent)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg border"
              style={{ borderColor: "var(--border)" }}
              onClick={() => setMobileOpen(true)}
              aria-label="Открыть меню"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm sm:text-base font-medium truncate">
              Здравствуйте, <span className="font-semibold">{greeting}</span>!
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle variant="outline" />
            <Link
              href={bellHref}
              title={bellLabel}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold border transition hover:opacity-90"
              style={{
                borderColor:
                  notificationsUnread > 0
                    ? "color-mix(in srgb, var(--accent) 40%, var(--border))"
                    : "var(--border)",
                color: notificationsUnread > 0 ? "var(--accent)" : "var(--text-muted)",
                backgroundColor:
                  notificationsUnread > 0
                    ? "color-mix(in srgb, var(--accent) 8%, var(--card-bg))"
                    : "color-mix(in srgb, var(--bg) 55%, transparent)",
              }}
            >
              <Bell className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="tabular-nums">{bellCount}</span>
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/account/login" })}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold border transition hover:opacity-90"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Выход</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
