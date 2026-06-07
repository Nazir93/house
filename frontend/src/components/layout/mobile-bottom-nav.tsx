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
      className="mobile-bottom-nav-shell fixed inset-x-0 bottom-0 z-50 lg:hidden pointer-events-none"
      aria-label="Основные разделы"
    >
      <div className="mobile-bottom-nav-bar pointer-events-auto mx-auto flex max-w-md items-center justify-around gap-1 px-1">
        {NAV_ITEMS.map(({ href, label, Icon, isActive }) => {
          const active = isActive(pathname);

          return (
            <Link
              key={href}
              href={href}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-0.5 transition-colors duration-200 touch-manipulation"
            >
              <span className="relative flex h-10 w-10 items-center justify-center">
                <span
                  className={`absolute inset-0 rounded-2xl ${
                    active
                      ? "mobile-bottom-nav-icon-glow"
                      : "mobile-bottom-nav-icon-base"
                  }`}
                  aria-hidden
                />
                <Icon
                  size={20}
                  strokeWidth={active ? 2.35 : 2.1}
                  className="relative shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                  style={{ color: active ? "var(--accent)" : "var(--text)" }}
                  aria-hidden
                />
              </span>
              <span
                className="max-w-full truncate text-[10px] font-semibold leading-none tracking-[0.01em]"
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
