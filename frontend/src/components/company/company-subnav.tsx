"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/about", label: "О нас" },
  { href: "/team", label: "Команда" },
  { href: "/contacts", label: "Контакты" },
  { href: "/partners/vacancies", label: "Вакансии" },
  { href: "/reviews", label: "Отзывы" },
] as const;

export function CompanySubnav() {
  const pathname = usePathname();

  return (
    <nav
      className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 scroll-smooth [scrollbar-width:none] sm:-mx-5 sm:mt-6 sm:flex-wrap sm:overflow-visible sm:px-5 sm:pb-0 [&::-webkit-scrollbar]:hidden"
      aria-label="Раздел «О компании»"
    >
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || (href !== "/about" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors sm:px-4 sm:text-[13px] md:text-sm"
            style={{
              borderColor: active ? "var(--accent)" : "var(--border)",
              backgroundColor: active ? "rgba(15, 61, 46, 0.1)" : "transparent",
              color: active ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
