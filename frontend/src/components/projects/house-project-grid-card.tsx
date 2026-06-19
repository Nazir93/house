"use client";

import Link from "next/link";
import { ArrowRight, Bath, Bed, Maximize2 } from "lucide-react";
import type { CSSProperties } from "react";

import { ProjectEngagementBadges } from "@/components/projects/project-engagement-badges";
import { ProjectCompareButton } from "@/components/projects/project-compare-button";
import type { HouseProjectCatalogKind } from "@/lib/house-project-catalog";
import { CmsImage } from "@/components/ui/cms-image";
import type { HouseProjectItem } from "@/lib/construction-data";
import { getProjectRenders } from "@/lib/construction-shared";

function formatPriceMln(priceRub: number): string {
  const mln = priceRub / 1_000_000;
  return `${mln.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} млн`;
}

function materialsLine(materials: string[]): string | null {
  if (!materials.length) return null;
  return materials.map((m) => m.replace(/\.$/, "").trim()).join(", ");
}

function ruRoomsLabel(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  const word =
    m10 === 1 && m100 !== 11 ? "комната" : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? "комнаты" : "комнат";
  return `${n} ${word}`;
}

function ruBathroomsLabel(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  const word =
    m10 === 1 && m100 !== 11 ? "санузел" : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? "санузла" : "санузлов";
  return `${n} ${word}`;
}

export function HouseProjectGridCard({
  project,
  priceRub,
  revealStyle,
  imageSizes = "(max-width: 768px) 100vw, 50vw",
  projectBasePath = "/projects",
  catalogKind = "author",
}: {
  project: HouseProjectItem;
  priceRub?: number;
  revealStyle?: CSSProperties;
  imageSizes?: string;
  projectBasePath?: string;
  catalogKind?: HouseProjectCatalogKind;
}) {
  const href = `${projectBasePath}/${project.slug}`;
  const cover = getProjectRenders(project)[0];
  const price = priceRub ?? project.price;
  const mats = materialsLine(project.materials);

  return (
    <article data-reveal="card" style={revealStyle} className="group flex flex-col">
      <div className="relative isolate aspect-[16/9] w-full overflow-hidden rounded-[22px] bg-[var(--stone)] shadow-[0_12px_40px_rgba(15,61,46,0.08)] transition-[box-shadow,transform] duration-500 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_52px_rgba(15,61,46,0.14)]">
        <Link href={href} className="absolute inset-0 z-0 block overflow-hidden rounded-[inherit]">
          {cover ? (
            <CmsImage
              src={cover.url}
              alt={cover.alt || project.title}
              fill
              className="scale-[1.06] object-cover object-[center_38%] transition duration-700 ease-out group-hover:scale-[1.1]"
              sizes={imageSizes}
            />
          ) : null}
        </Link>

        <div className="absolute inset-x-0 top-3 z-[2] flex items-start justify-between gap-2 px-3">
          <ProjectCompareButton slug={project.slug} catalogKind={catalogKind} variant="card" />
          <ProjectEngagementBadges
            slug={project.slug}
            initialViewCount={project.viewCount}
            initialLikeCount={project.likeCount}
            className="shrink-0"
          />
        </div>

        <div className="absolute bottom-2 left-2 right-2 z-[1] sm:bottom-3 sm:left-auto sm:right-3">
          <Link
            href={`${href}#project-calculator`}
            className="inline-flex w-full min-w-0 items-center justify-center gap-1 rounded-full bg-[#e8f3eb] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#0f3d2e] shadow-sm transition hover:bg-[#dcefe2] sm:w-auto sm:justify-start sm:px-4 sm:text-[11px]"
            onClick={(e) => e.stopPropagation()}
          >
            Калькулятор проекта
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 px-0.5 sm:mt-3.5">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <Link
            href={href}
            className="min-w-0 flex-1 truncate font-heading text-base font-bold uppercase tracking-tight text-[var(--text)] transition hover:text-[var(--accent)] sm:text-lg"
          >
            {project.title}
          </Link>
          <span className="shrink-0 font-heading text-[15px] font-bold tabular-nums leading-none text-[var(--text)] sm:text-base">
            от {formatPriceMln(price)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-[var(--text-muted)] sm:gap-x-3 sm:text-[13px]">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Maximize2 className="h-3.5 w-3.5 shrink-0 text-[var(--text-subtle)]" strokeWidth={1.75} aria-hidden />
            <span className="whitespace-nowrap font-medium text-[var(--text)]">{project.area} м²</span>
          </span>
          <span className="h-3 w-px shrink-0 bg-[var(--border)] opacity-70" aria-hidden />
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Bed className="h-3.5 w-3.5 shrink-0 text-[var(--text-subtle)]" strokeWidth={1.75} aria-hidden />
            <span className="whitespace-nowrap font-medium text-[var(--text)]">{ruRoomsLabel(project.rooms)}</span>
          </span>
          <span className="h-3 w-px shrink-0 bg-[var(--border)] opacity-70" aria-hidden />
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Bath className="h-3.5 w-3.5 shrink-0 text-[var(--text-subtle)]" strokeWidth={1.75} aria-hidden />
            <span className="whitespace-nowrap font-medium text-[var(--text)]">{ruBathroomsLabel(project.bathrooms)}</span>
          </span>
        </div>
        {mats ? (
          <p className="text-[11px] leading-snug text-[var(--text-muted)] sm:text-[12px]">
            <span className="font-medium text-[var(--text-subtle)]">Материалы стен: </span>
            {mats}
          </p>
        ) : null}
      </div>
    </article>
  );
}
