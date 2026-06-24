"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Home, LayoutGrid, Images, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BUILT_HOMES_SECTION_LABEL } from "@/lib/constants";
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
    label: BUILT_HOMES_SECTION_LABEL,
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
  const [arrivedIndex, setArrivedIndex] = useState<number | null>(null);
  const lastScrollYRef = useRef(0);
  const prevPathnameRef = useRef(pathname);
  const activeIndex = NAV_ITEMS.findIndex(({ isActive }) => isActive(pathname));

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;

      if (currentScrollY <= 16) {
        setIsCompact(false);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (Math.abs(delta) < 4) {
        return;
      }

      if (delta > 0) {
        setIsCompact(true);
      } else {
        setIsCompact(false);
      }
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

  useEffect(() => {
    if (pathname === prevPathnameRef.current) return;

    prevPathnameRef.current = pathname;
    const idx = NAV_ITEMS.findIndex(({ isActive }) => isActive(pathname));
    if (idx < 0) return;

    setArrivedIndex(idx);
    const timer = window.setTimeout(() => setArrivedIndex(null), 560);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <nav
      className="mobile-bottom-nav-shell fixed inset-x-0 bottom-0 z-50 lg:hidden pointer-events-none"
      aria-label="Основные разделы"
    >
      <div
        className={cn(
          "mobile-bottom-nav-bar pointer-events-auto relative mx-auto grid max-w-[min(100%,17.5rem)] grid-cols-4 items-center gap-0 overflow-hidden px-1 py-1",
          isCompact && "mobile-bottom-nav-bar--compact"
        )}
        style={{ ["--active-index" as string]: Math.max(activeIndex, 0) }}
      >
        {activeIndex >= 0 ? (
          <span
            className={cn(
              "mobile-bottom-nav-active-pill",
              arrivedIndex === activeIndex && "mobile-bottom-nav-active-pill--arrived"
            )}
            aria-hidden
          />
        ) : null}
        {NAV_ITEMS.map(({ href, label, Icon, isActive }, index) => {
          const active = isActive(pathname);
          const justArrived = arrivedIndex === index;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="mobile-bottom-nav-item relative z-10 flex min-w-0 items-center justify-center rounded-[1.65rem] py-2 transition-[color,transform] duration-300 ease-out touch-manipulation active:scale-95"
            >
              <span
                className={cn(
                  "mobile-bottom-nav-icon-wrap relative flex h-8 w-8 items-center justify-center",
                  active && "mobile-bottom-nav-icon-wrap--active",
                  justArrived && "mobile-bottom-nav-icon-wrap--arrived"
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.55 : 2.3}
                  className="relative shrink-0"
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
