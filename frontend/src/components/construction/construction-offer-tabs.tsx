"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ConstructionOfferTab } from "@/lib/construction-service-data";

export function ConstructionOfferTabs({
  stripTitle,
  tabs,
}: {
  stripTitle: string;
  tabs: ConstructionOfferTab[];
}) {
  const [active, setActive] = useState(0);
  const t = tabs[active] ?? tabs[0];

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="px-4 py-3 text-center text-sm font-semibold text-[var(--accent-contrast)] sm:text-left sm:px-6" style={{ backgroundColor: "var(--accent)" }}>
        {stripTitle}
      </div>
      <div className="flex flex-wrap gap-1 border-b p-2 sm:p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
        {tabs.map((tab, i) => {
          const isActive = i === active;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(i)}
              className="rounded-xl px-3 py-2 text-left text-[12px] font-semibold transition-colors sm:text-[13px]"
              style={{
                backgroundColor: isActive ? "var(--accent)" : "transparent",
                color: isActive ? "var(--accent-contrast)" : "var(--text)",
                border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="grid md:grid-cols-2 md:divide-x" style={{ borderColor: "var(--border)" }}>
        <div className="relative aspect-[4/3] min-h-[220px] w-full md:min-h-[300px]">
          <Image src={t.imageSrc} alt={t.imageAlt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="flex flex-col justify-center border-t p-6 md:border-t-0 md:p-8 lg:p-10" style={{ borderColor: "var(--border)" }}>
          <ul className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {t.bullets.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t p-4 sm:px-6 sm:pb-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
        <Link
          href="/contacts"
          className="flex w-full items-center justify-center rounded-xl py-3 text-center text-sm font-semibold text-[var(--accent-contrast)] transition-opacity hover:opacity-95"
          style={{ backgroundColor: "var(--accent)" }}
        >
          Заказать консультацию
        </Link>
      </div>
    </div>
  );
}
