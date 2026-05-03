"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProjectListItem } from "@/lib/get-projects";
import type { BuiltObjectItem } from "@/lib/construction-shared";
import { PortfolioProjectListCard } from "@/components/portfolio/portfolio-project-list-card";
import { HomeCasesAccordion } from "@/components/sections/home-cases-accordion";

export type PortfolioSectionProps = {
  projects?: ProjectListItem[];
  /** Построенные дома с `/portfolio` — для главной; если задано, `projects` не используется. */
  builtObjects?: BuiltObjectItem[];
  sectionTitle?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
  sectionId?: string;
};

export function PortfolioSection({
  projects: items = [],
  builtObjects,
  sectionTitle = "Наши проекты",
  viewAllLabel = "Смотреть все проекты",
  viewAllHref = "/portfolio",
  sectionId = "portfolio",
}: PortfolioSectionProps = {}) {
  const useBuilt = Boolean(builtObjects?.length);

  return (
    <section
      id={sectionId}
      className="overflow-hidden py-11 sm:py-14 md:py-[4.25rem]"
      style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border)" }}
    >
      <div className="container mx-auto max-w-[1180px] px-5">
        {/* Шапка как у «Популярные проекты» */}
        <div className="mb-8 flex flex-col gap-5 md:mb-9">
          <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <h2 className="min-w-0 w-full flex-1 text-balance font-heading text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl md:text-[2.25rem] md:leading-[1.1]">
              {sectionTitle}
            </h2>
            <Link
              href={viewAllHref}
              className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--text)] underline-offset-4 transition hover:text-[var(--accent)] hover:underline sm:mt-1 sm:text-sm"
            >
              {viewAllLabel}
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
            </Link>
          </div>
        </div>

        {useBuilt ? (
          <HomeCasesAccordion objects={builtObjects!} />
        ) : (
          <div className="flex max-w-5xl flex-col gap-4">
            {items.map((project) => (
              <PortfolioProjectListCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
