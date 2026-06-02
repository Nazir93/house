"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bath,
  Bed,
  Maximize2,
} from "lucide-react";
import { ProjectEngagementBadges } from "@/components/projects/project-engagement-badges";

import type { HeroPricingTier, HouseProjectItem } from "@/lib/construction-data";
import { getProjectRenders } from "@/lib/construction-shared";
import { revealDelayStyle } from "@/lib/reveal-animation";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE = 4;
const LOAD_MORE = 4;

/** Запасные обложки, если в данных нет рендеров или файлы отсутствуют в public */
const COVER_FALLBACK_BY_SLUG: Record<string, string> = {
  aurora: "/images/banner/banner-hero-01.png",
  duet: "/images/banner/banner-hero-02.png",
  line: "/images/banner/banner-hero-06.png",
  horizon: "/images/banner/banner-hero-04.png",
};

const COVER_FALLBACK_ROTATE = [
  "/images/banner/banner-hero-01.png",
  "/images/banner/banner-hero-02.png",
  "/images/banner/banner-hero-03.png",
  "/images/banner/banner-hero-04.png",
  "/images/banner/banner-hero-05.png",
  "/images/banner/banner-hero-06.png",
] as const;

function pickCover(p: HouseProjectItem, index: number): string {
  const renders = getProjectRenders(p);
  const first = p.media[0];
  const fromData = renders[0]?.url ?? (first?.type === "RENDER" ? first.url : null);
  if (fromData) return fromData;
  return COVER_FALLBACK_BY_SLUG[p.slug] ?? COVER_FALLBACK_ROTATE[index % COVER_FALLBACK_ROTATE.length];
}

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

export function FeaturedHouseProjectsSection({
  projects,
  projectHeroTiers = {},
}: {
  projects: HouseProjectItem[];
  projectHeroTiers?: Record<string, HeroPricingTier[]>;
}) {
  const list = useMemo(() => {
    return [...projects]
      .filter((p) => p.published)
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : a.price - b.price));
  }, [projects]);

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [tab, setTab] = useState<"serial" | "individual">("serial");

  if (list.length === 0) return null;

  const shown = tab === "serial" ? list.slice(0, visibleCount) : [];
  const hasMore = tab === "serial" && visibleCount < list.length;

  return (
    <section
      id="catalog-preview"
      data-reveal="section"
      className="overflow-hidden py-11 sm:py-14 md:py-[4.25rem]"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="container mx-auto max-w-[1180px]">
        {/* Шапка как в макете */}
        <div className="mb-8 flex flex-col gap-5 md:mb-9">
          <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <h2
              className="min-w-0 w-full flex-1 text-balance font-heading text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl md:text-[2.25rem] md:leading-[1.1]"
            >
              Популярные проекты
            </h2>
            <Link
              href="/projects"
              className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--text)] underline-offset-4 transition hover:text-[var(--accent)] hover:underline sm:mt-1 sm:text-sm"
            >
              Все проекты
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
            </Link>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
            <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain scrollbar-none pb-0.5 sm:w-auto sm:overflow-visible sm:pb-0">
              <div className="inline-flex min-w-max rounded-full bg-[var(--bg-secondary)] p-[3px] ring-1 ring-[var(--border)] ring-inset">
                <button
                  type="button"
                  onClick={() => {
                    setTab("serial");
                    setVisibleCount(INITIAL_VISIBLE);
                  }}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[12px] font-semibold transition sm:px-5 sm:py-2 sm:text-[13px]",
                    tab === "serial"
                      ? "bg-white text-[var(--text)] shadow-[0_1px_4px_rgba(15,61,46,0.12)] dark:bg-[var(--card-bg)] dark:text-[var(--text)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]",
                  )}
                >
                  Авторские
                </button>
                <button
                  type="button"
                  onClick={() => setTab("individual")}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[12px] font-semibold transition sm:px-5 sm:py-2 sm:text-[13px]",
                    tab === "individual"
                      ? "bg-white text-[var(--text)] shadow-[0_1px_4px_rgba(15,61,46,0.12)] dark:bg-[var(--card-bg)] dark:text-[var(--text)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]",
                  )}
                >
                  Индивидуальные
                </button>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-[15px] lg:max-w-[440px] lg:text-right">
              Вы можете выбрать одно из 500+ готовых решений или заказать индивидуальный проект под участок и привычки семьи.
            </p>
          </div>
        </div>

        {tab === "individual" ? (
          <div
            className="rounded-[22px] border px-6 py-14 text-center sm:px-10 sm:py-16"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            <p className="mx-auto max-w-lg text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              Индивидуальные дома проектируем с нуля: фасад, планировки и инженерия под ваш участок и бюджет.
            </p>
            <Link
              href="/individual-design"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--accent)] px-8 text-sm font-bold uppercase tracking-[0.08em] text-[var(--accent-contrast)] transition hover:opacity-[0.96]"
            >
              Заказать проектирование
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2 md:gap-x-5 md:gap-y-4">
              {shown.map((p, idx) => {
                const cover = pickCover(p, idx);
                const href = `/projects/${p.slug}`;
                const views = 180 + p.area + p.order * 7;
                const hot = 12 + (p.isNew ? 28 : 0) + p.order * 3;
                const tiers = projectHeroTiers[p.id] ?? [];
                const standardPrice = tiers.length ?
                  Math.min(...tiers.map((tier) => tier.price).filter((price) => price > 0))
                : p.price;
                const mats = materialsLine(tiers.length ? tiers.map((tier) => tier.label) : p.materials);

                return (
                  <article key={p.id} data-reveal="card" style={revealDelayStyle(idx)} className="flex flex-col">
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[22px] bg-[var(--stone)] shadow-[0_12px_40px_rgba(15,61,46,0.08)] transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-[0_18px_52px_rgba(15,61,46,0.14)]">
                      <Link href={href} className="absolute inset-0 z-0">
                        <Image
                          src={cover}
                          alt={p.title}
                          fill
                          quality={78}
                          className="scale-[1.06] object-cover object-[center_38%] transition duration-700 ease-out hover:scale-[1.1]"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </Link>

                      <ProjectEngagementBadges
                        slug={p.slug}
                        initialViewCount={p.viewCount}
                        initialLikeCount={p.likeCount}
                        className="absolute inset-x-0 top-3 z-[2] px-3"
                      />

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
                          {p.title}
                        </Link>
                        <span className="shrink-0 font-heading text-[15px] font-bold tabular-nums leading-none text-[var(--text)] sm:text-base">
                          от {formatPriceMln(standardPrice)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-[var(--text-muted)] sm:gap-x-3 sm:text-[13px]">
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Maximize2 className="h-3.5 w-3.5 shrink-0 text-[var(--text-subtle)]" strokeWidth={1.75} aria-hidden />
                          <span className="whitespace-nowrap font-medium text-[var(--text)]">{p.area} м²</span>
                        </span>
                        <span className="h-3 w-px shrink-0 bg-[var(--border)] opacity-70" aria-hidden />
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Bed className="h-3.5 w-3.5 shrink-0 text-[var(--text-subtle)]" strokeWidth={1.75} aria-hidden />
                          <span className="whitespace-nowrap font-medium text-[var(--text)]">{ruRoomsLabel(p.rooms)}</span>
                        </span>
                        <span className="h-3 w-px shrink-0 bg-[var(--border)] opacity-70" aria-hidden />
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Bath className="h-3.5 w-3.5 shrink-0 text-[var(--text-subtle)]" strokeWidth={1.75} aria-hidden />
                          <span className="whitespace-nowrap font-medium text-[var(--text)]">{ruBathroomsLabel(p.bathrooms)}</span>
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
              })}
            </div>

            {hasMore ? (
              <button
                type="button"
                onClick={() => setVisibleCount((n) => Math.min(n + LOAD_MORE, list.length))}
                className="mx-auto mt-8 flex w-full max-w-md items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--bg)] sm:mt-9"
              >
                Показать ещё
              </button>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
