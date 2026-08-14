import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  HOME_TURNKEY_SERVICES_H2,
  HOME_TURNKEY_SERVICES_LEAD,
  HOME_TURNKEY_SERVICE_TILES,
} from "@/lib/home-turnkey-services-block";

/** ТЗ SEO §4: H2 + текст + плитки-ссылки на услуги. Server HTML для робота. */
export function HomeTurnkeyServicesSection() {
  return (
    <section
      id="home-turnkey-services"
      className="border-b border-[var(--border)] bg-[var(--bg)] py-10 sm:py-12 md:py-14"
      aria-labelledby="home-turnkey-services-heading"
    >
      <div className="section-inline-pad mx-auto max-w-[1280px]">
        <h2
          id="home-turnkey-services-heading"
          className="max-w-3xl text-balance font-heading text-[clamp(1.15rem,2.9vw,1.95rem)] font-bold uppercase leading-[1.15] tracking-[-0.03em] text-[var(--text)]"
        >
          {HOME_TURNKEY_SERVICES_H2}
        </h2>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-[var(--text)]/88 dark:text-[var(--text-muted)] md:text-[15px]">
          {HOME_TURNKEY_SERVICES_LEAD.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>

        <ul className="mt-8 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {HOME_TURNKEY_SERVICE_TILES.map((tile) => (
            <li key={tile.id}>
              <Link
                href={tile.href}
                className="group flex min-h-[72px] items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-4 text-[var(--text)] shadow-[0_8px_28px_rgba(15,61,46,0.06)] transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] hover:shadow-[0_12px_36px_rgba(15,61,46,0.1)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
              >
                <span className="font-heading text-sm font-bold uppercase tracking-tight">{tile.label}</span>
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
