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
} from "lucide-react";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";

const NAV = [
  { href: "/account/dashboard", label: "Главная", icon: LayoutDashboard },
  { href: "/account/stages", label: "Этапы строительства", icon: ListOrdered },
  { href: "/account/photos", label: "Фотоотчёты", icon: Images },
  { href: "/account/camera", label: "Онлайн камера", icon: Video },
  { href: "/account/documents", label: "Документы", icon: FileText },
  { href: "/account/payments", label: "Платежи", icon: CreditCard },
  { href: "/account/support", label: "Обращения", icon: MessageCircle },
] as const;

export function AccountShell({
  children,
  supportPhone,
  workingHours,
}: {
  children: React.ReactNode;
  supportPhone: string;
  workingHours: string;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const greeting = session?.user?.name?.trim() || "Клиент";

  return (
    <div
      className="min-h-screen flex"
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
          fixed lg:sticky top-0 z-[70] h-screen w-[260px] flex-shrink-0 flex flex-col border-r
          transition-transform duration-200 lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--card-bg)",
        }}
      >
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/account/dashboard" className="font-heading font-bold text-lg tracking-tight">
            {SITE_NAME}
          </Link>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Личный кабинет
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/account/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "" : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
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
                <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-xs border-t space-y-1" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          <p className="font-semibold" style={{ color: "var(--text)" }}>
            Поддержка
          </p>
          {supportPhone ? <p>{supportPhone}</p> : null}
          {workingHours ? <p>{workingHours}</p> : null}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header
          className="sticky top-0 z-[60] flex items-center justify-between gap-3 px-4 py-3 border-b backdrop-blur-md"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "color-mix(in srgb, var(--bg) 88%, transparent)",
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
            <span
              className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted border"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <Bell className="h-3.5 w-3.5" aria-hidden /> 0
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/account/login" })}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold border transition hover:opacity-90"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden xs:inline">Выход</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
