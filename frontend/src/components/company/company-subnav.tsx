"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/about", label: "О нас" },
  { href: "/contacts", label: "Контакты" },
  { href: "/partners/vacancies", label: "Вакансии" },
  { href: "/reviews", label: "Отзывы" },
] as const;

export function CompanySubnav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap gap-2" aria-label="Раздел «О компании»">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || (href !== "/about" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors md:text-sm"
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
