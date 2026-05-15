"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Images, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Главная",
    Icon: Home,
    isActive: (p) => p === "/",
  },
  {
    href: "/projects",
    label: "Проекты",
    Icon: LayoutGrid,
    isActive: (p) => p === "/projects" || p.startsWith("/projects/"),
  },
  {
    href: "/portfolio",
    label: "Портфолио",
    Icon: Images,
    isActive: (p) => p.startsWith("/portfolio"),
  },
  {
    href: "/contacts",
    label: "Контакты",
    Icon: Phone,
    isActive: (p) => p.startsWith("/contacts"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-bottom"
      aria-label="Основные разделы"
      style={{
        borderTop: "1px solid var(--border)",
        backgroundColor: "color-mix(in srgb, var(--card-bg) 94%, transparent)",
        boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom,0px)] pt-1">
        {NAV_ITEMS.map(({ href, label, Icon, isActive }) => {
          const active = isActive(pathname);

          return (
            <Link
              key={href}
              href={href}
              className="flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 transition-colors duration-200 touch-manipulation"
              style={{
                color: active ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: active ? "rgba(15, 61, 46, 0.12)" : "transparent",
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.25 : 2}
                  className="shrink-0"
                  aria-hidden
                />
              </span>
              <span
                className="max-w-full truncate text-[10px] font-semibold leading-tight tracking-[0.02em] sm:text-[11px]"
                style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
