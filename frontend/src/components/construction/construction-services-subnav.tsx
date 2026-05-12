"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SERVICES } from "@/lib/constants";

export function ConstructionServicesSubnav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-wrap gap-2" aria-label="Раздел «Услуги строительства»">
      {SERVICES.map((s) => {
        const href = s.slug.startsWith("/") ? s.slug : `/services/${s.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={s.id}
            href={href}
            className="rounded-full border px-3 py-2 text-[12px] font-semibold transition-colors sm:px-4 sm:text-[13px]"
            style={{
              borderColor: active ? "var(--accent)" : "var(--border)",
              backgroundColor: active ? "rgba(15, 61, 46, 0.1)" : "transparent",
              color: active ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {s.title}
          </Link>
        );
      })}
    </nav>
  );
}
