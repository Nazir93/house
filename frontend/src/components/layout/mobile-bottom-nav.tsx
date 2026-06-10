"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, LayoutGrid, Images, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isCompact, setIsCompact] = useState(false);
  const lastScrollYRef = useRef(0);
  const activeIndex = NAV_ITEMS.findIndex(({ isActive }) => isActive(pathname));

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;

      if (Math.abs(delta) < 6) {
        return;
      }

      setIsCompact(delta > 0 && currentScrollY > 12);
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsCompact(false);
    lastScrollYRef.current = window.scrollY;
  }, [pathname]);

  return (
    <nav
      className="mobile-bottom-nav-shell fixed inset-x-0 bottom-0 z-50 lg:hidden pointer-events-none"
      aria-label="Основные разделы"
    >
      <div
        className={cn(
          "mobile-bottom-nav-bar pointer-events-auto relative mx-auto grid max-w-md grid-cols-4 items-center gap-0 overflow-hidden px-1.5 py-1.5",
          isCompact && "mobile-bottom-nav-bar--compact"
        )}
        style={{ ["--active-index" as string]: Math.max(activeIndex, 0) }}
      >
        {activeIndex >= 0 ? (
          <span className="mobile-bottom-nav-active-pill" aria-hidden />
        ) : null}
        {NAV_ITEMS.map(({ href, label, Icon, isActive }) => {
          const active = isActive(pathname);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="mobile-bottom-nav-item relative z-10 flex min-w-0 items-center justify-center rounded-[1.65rem] py-2.5 transition-[color,transform] duration-300 ease-out touch-manipulation active:scale-95"
            >
              <span className="relative flex h-9 w-9 items-center justify-center">
                <Icon
                  size={26}
                  strokeWidth={active ? 2.55 : 2.3}
                  className="relative shrink-0 transition-all duration-300 ease-out"
                  style={{ color: active ? "var(--accent)" : "var(--text)" }}
                  aria-hidden
                />
              </span>
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
