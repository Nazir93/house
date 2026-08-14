import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  AUTHOR_PROJECTS_AFTER_CATALOG_H2,
  AUTHOR_PROJECTS_AFTER_CATALOG_LINKS,
  AUTHOR_PROJECTS_AFTER_CATALOG_PARAGRAPHS,
} from "@/lib/seo/project-catalog-hub-seo";

/** SEO section 8: after /projects catalog grid, not before. */
export function AuthorProjectsAfterCatalogSection() {
  return (
    <section
      id="projects-seo-after-catalog"
      className="border-t border-[var(--border)] bg-[var(--bg)] py-10 sm:py-12 md:py-14"
      aria-labelledby="projects-seo-after-catalog-heading"
    >
      <div className="container mx-auto max-w-[1400px] px-5">
        <h2
          id="projects-seo-after-catalog-heading"
          className="max-w-5xl text-balance font-heading text-[clamp(1.1rem,2.6vw,1.75rem)] font-bold uppercase leading-[1.15] tracking-[-0.03em] text-[var(--text)]"
        >
          {AUTHOR_PROJECTS_AFTER_CATALOG_H2}
        </h2>
        <div className="mt-5 grid gap-4 text-sm leading-relaxed text-[var(--text)]/88 dark:text-[var(--text-muted)] md:grid-cols-2 md:gap-x-10 md:gap-y-5 md:text-[15px]">
          {AUTHOR_PROJECTS_AFTER_CATALOG_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
        <ul className="mt-8 flex list-none flex-wrap gap-2.5 p-0">
          {AUTHOR_PROJECTS_AFTER_CATALOG_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card-bg)] px-3.5 py-2 text-[12px] font-semibold text-[var(--text)] transition hover:border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] hover:text-[var(--accent)] sm:text-[13px]"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-60" strokeWidth={2} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
