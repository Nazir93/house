"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import type { ProjectListItem } from "@/lib/get-projects";
import { PortfolioProjectListCard } from "@/components/portfolio/portfolio-project-list-card";
import { formatArticleBody, PAGE_INTRO_PROSE_CLASS } from "@/lib/html-content";

function LoadMoreButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center justify-between mt-6 px-8 py-6 md:py-7 rounded-2xl font-heading text-xl md:text-2xl lg:text-3xl transition-all duration-500 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div
        className="absolute inset-0 origin-left transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] rounded-2xl"
        style={{
          backgroundColor: "var(--text)",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
        }}
      />
      <span
        className="relative z-10 transition-colors duration-700"
        style={{ color: hovered ? "var(--bg)" : "var(--text)" }}
      >
        Смотреть ещё
      </span>
      <ArrowDown
        size={24}
        className="relative z-10 transition-colors duration-700"
        style={{ color: hovered ? "var(--bg)" : "var(--text)" }}
      />
    </button>
  );
}

const INITIAL_COUNT = 5;

export function PortfolioPageContent({
  projects,
  pageH1,
  introText,
  bodyHtml,
}: {
  projects: ProjectListItem[];
  pageH1: string;
  introText: string;
  bodyHtml?: string | null;
}) {
  const [showAll, setShowAll] = useState(false);

  const visibleProjects = showAll ? projects : projects.slice(0, INITIAL_COUNT);

  return (
    <section className="pt-12 pb-20 md:pt-16 md:pb-28" style={{ backgroundColor: "var(--bg)" }}>
      <div className="container mx-auto max-w-5xl px-5">
        <span
          className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.12em] px-3 py-1.5 rounded-full mb-4 sm:mb-5"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          Наши проекты
        </span>
        <h1
          className="font-heading text-xl sm:text-2xl md:text-[1.75rem] leading-[1.2] tracking-tight mb-5 sm:mb-6 max-w-3xl break-words"
          style={{ color: "var(--text)" }}
        >
          {pageH1}
        </h1>
        <div
          className={`${PAGE_INTRO_PROSE_CLASS} ${bodyHtml ? "mb-8 md:mb-10" : "mb-10 md:mb-14"}`}
          style={{ color: "var(--text-muted)" }}
          dangerouslySetInnerHTML={{ __html: formatArticleBody(introText) }}
        />
        {bodyHtml ? (
          <div
            className={`${PAGE_INTRO_PROSE_CLASS} mb-10 md:mb-14 max-w-none w-full overflow-x-auto sm:max-w-full`}
            style={{ color: "var(--text-muted)" }}
            dangerouslySetInnerHTML={{ __html: formatArticleBody(bodyHtml) }}
          />
        ) : null}
      </div>

      <div className="container mx-auto px-5">
        {/* Cards */}
        <div className="flex flex-col gap-4">
          {visibleProjects.map((project) => (
            <PortfolioProjectListCard key={project.id} project={project} />
          ))}
        </div>

        {/* Load more */}
        {!showAll && projects.length > INITIAL_COUNT && (
          <LoadMoreButton onClick={() => setShowAll(true)} />
        )}
      </div>
    </section>
  );
}
