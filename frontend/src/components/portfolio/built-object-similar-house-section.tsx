import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  BUILT_OBJECT_SIMILAR_HOUSE_H2,
  builtObjectSimilarHouseLinks,
} from "@/lib/built-object-similar-house-links";

/** ТЗ SEO §6: перелинковка с объекта → проекты / калькулятор / материал. Server HTML. */
export function BuiltObjectSimilarHouseSection({
  material,
}: {
  material: string | null | undefined;
}) {
  const links = builtObjectSimilarHouseLinks(material);

  return (
    <section
      id="similar-house"
      className="border-t border-[var(--border)] bg-[var(--bg)] py-10 sm:py-12 md:py-14"
      aria-labelledby="similar-house-heading"
    >
      <div className="container mx-auto max-w-[1180px] px-5">
        <h2
          id="similar-house-heading"
          className="max-w-3xl text-balance font-heading text-[clamp(1.15rem,2.9vw,1.85rem)] font-bold uppercase leading-[1.15] tracking-[-0.03em] text-[var(--text)]"
        >
          {BUILT_OBJECT_SIMILAR_HOUSE_H2}
        </h2>
        <ul className="mt-6 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {links.map((link) => (
            <li key={link.id}>
              <Link
                href={link.href}
                className="group flex min-h-[72px] items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-4 text-[var(--text)] shadow-[0_8px_28px_rgba(15,61,46,0.06)] transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] hover:shadow-[0_12px_36px_rgba(15,61,46,0.1)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
              >
                <span className="font-heading text-sm font-bold uppercase tracking-tight">{link.label}</span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 opacity-55 transition group-hover:opacity-90 group-hover:text-[var(--accent)]"
                  strokeWidth={2}
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
