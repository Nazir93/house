"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { LayoutGrid, MapPinned } from "lucide-react";
import { PortfolioExcursionFab } from "@/components/portfolio/portfolio-excursion-fab";
import { builtObjectMaterialLabel, getBuiltObjectCover, type BuiltObjectItem } from "@/lib/construction-shared";
import { effectiveBuiltObjectRegionSlug } from "@/lib/built-object-map-taxonomy";
import { cn } from "@/lib/utils";
import { CmsImage } from "@/components/ui/cms-image";

const PortfolioObjectMapExplorer = dynamic(
  () => import("@/components/portfolio/portfolio-object-map-explorer").then((m) => m.PortfolioObjectMapExplorer),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[min(520px,70vh)] w-full items-center justify-center rounded-[1.35rem] text-sm"
        style={{ backgroundColor: "var(--stone)", color: "var(--text-muted)" }}
      >
        Загрузка карты…
      </div>
    ),
  }
);

type ViewMode = "grid" | "map";
type RegionFilter = "all" | "lo" | "mo";
type FloorFilter = "all" | "1" | "2plus";
type AreaFilter = "all" | "lte150" | "mid" | "gt250";

/** Сетка портфолио: два чипа региона — как на карте, сначала `regionSlug`, затем эвристика по адресу. */
function regionBucket(o: BuiltObjectItem): "lo" | "mo" | "other" {
  const slug = effectiveBuiltObjectRegionSlug(o);
  if (slug === "mo") return "mo";
  if (slug === "lo" || slug === "vnovgorod") return "lo";
  return "other";
}

/** Чипы: без фиксированных «светлых» rgba — в dark текст и фон снова контрастны. */
function chipBaseClass(on: boolean) {
  return cn(
    "rounded-full px-4 py-2 text-[13px] font-medium transition-colors sm:text-sm border",
    on
      ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-none"
      : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:bg-[var(--card-bg)] dark:shadow-none"
  );
}

function chipMutedClass(on: boolean) {
  return cn(
    "rounded-full px-4 py-2 text-[13px] font-medium transition-colors sm:text-sm border",
    on
      ? "border-[var(--accent)] bg-[rgba(15,61,46,0.14)] text-[var(--accent)] dark:bg-[rgba(61,143,110,0.22)]"
      : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:bg-[var(--card-bg)] dark:shadow-none"
  );
}

export function BuiltPortfolioContent({
  objects,
  initialView = "grid",
}: {
  objects: BuiltObjectItem[];
  initialView?: ViewMode;
}) {
  const [material, setMaterial] = useState("Все");
  const [region, setRegion] = useState<RegionFilter>("all");
  const [floorFilter, setFloorFilter] = useState<FloorFilter>("all");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("all");
  const [view, setView] = useState<ViewMode>(initialView);
  const explorerRef = useRef<HTMLDivElement>(null);

  const materials = useMemo(
    () => ["Все", ...Array.from(new Set(objects.map((o) => o.material)))],
    [objects]
  );

  const hasFloorData = useMemo(() => objects.some((o) => o.floors != null), [objects]);
  const hasAreaData = useMemo(() => objects.some((o) => o.area != null), [objects]);

  const filtered = useMemo(() => {
    let list = material === "Все" ? objects : objects.filter((o) => o.material === material);
    if (region === "lo") list = list.filter((o) => regionBucket(o) === "lo");
    if (region === "mo") list = list.filter((o) => regionBucket(o) === "mo");
    if (floorFilter === "1") list = list.filter((o) => o.floors === 1);
    if (floorFilter === "2plus") list = list.filter((o) => o.floors != null && o.floors >= 2);
    if (areaFilter === "lte150") list = list.filter((o) => o.area != null && o.area <= 150);
    if (areaFilter === "mid") list = list.filter((o) => o.area != null && o.area > 150 && o.area <= 250);
    if (areaFilter === "gt250") list = list.filter((o) => o.area != null && o.area > 250);
    return list;
  }, [areaFilter, floorFilter, material, objects, region]);

  function chipLabel(m: string) {
    if (m === "Все") return "Все";
    return builtObjectMaterialLabel(m);
  }

  function resetAllFilters() {
    setMaterial("Все");
    setRegion("all");
    setFloorFilter("all");
    setAreaFilter("all");
  }

  const filtersAreDefault =
    material === "Все" && region === "all" && floorFilter === "all" && areaFilter === "all";

  function scrollToExplorer() {
    requestAnimationFrame(() => {
      explorerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function showMapView() {
    setView("map");
    setTimeout(scrollToExplorer, 80);
  }

  const mappedCount = filtered.filter((o) => o.latitude != null && o.longitude != null).length;

  return (
    <>
      <PortfolioExcursionFab />

      <section className="pb-24 pt-28" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <div className="container mx-auto max-w-[1320px] px-5">
          <nav className="text-[12px] tracking-[0.02em] text-[var(--text-muted)] sm:text-[13px]" aria-label="Навигация по разделу">
            <Link href="/" className="transition-colors hover:text-[var(--accent)]">
              Главная
            </Link>
            <span className="mx-1.5 text-[var(--text-subtle)] sm:mx-2" aria-hidden>
              {" > "}
            </span>
            <span className="text-[var(--text)]">Наши проекты</span>
          </nav>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Построенные дома</p>
              <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-[var(--accent)] md:text-[2.75rem] md:leading-[1.06] lg:text-[3.15rem] dark:text-[var(--text)]">
                Портфолио
              </h1>
              <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)] sm:text-sm md:text-[15px]">
                Фильтр по материалу, этажности и площади. На карте — география объектов. Запишитесь на экскурсию — круглая кнопка справа внизу.
              </p>
            </div>
          </div>

          <div ref={explorerRef} id="portfolio-explorer" className="mt-8 scroll-mt-24 space-y-8 md:scroll-mt-28">
            {view === "map" ? (
              <div className="space-y-6">
                <div className="flex w-full flex-wrap items-center gap-2 border-b border-[var(--border)] pb-6">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={cn("inline-flex items-center gap-2 font-semibold", chipBaseClass(true))}
                  >
                    <LayoutGrid size={17} strokeWidth={2} aria-hidden />
                    К сетке
                  </button>
                  <Link
                    href="/portfolio/map"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-[13px] font-semibold text-[var(--accent)] transition-colors hover:border-[var(--accent)] dark:bg-[var(--card-bg)] sm:text-sm"
                  >
                    <MapPinned size={17} strokeWidth={2} aria-hidden />
                    Открыть страницу карты
                  </Link>
                </div>
                <PortfolioObjectMapExplorer objects={objects} layout="embedded" />
              </div>
            ) : (
              <>
                <div className="flex w-full flex-wrap items-center gap-2 border-b border-[var(--border)] pb-6">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className={chipBaseClass(filtersAreDefault)}
                    aria-pressed={filtersAreDefault}
                  >
                    Все
                  </button>

                  <span className="hidden h-4 w-px bg-[var(--border)] sm:block" aria-hidden />

                  <span className="w-full text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)] sm:hidden">
                    Материал
                  </span>
                  {materials.map((item) => {
                    if (item === "Все") return null;
                    const on = material === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setMaterial(item)}
                        className={chipBaseClass(on)}
                      >
                        {chipLabel(item)}
                      </button>
                    );
                  })}

                  {hasFloorData ? (
                    <>
                      <span className="w-full text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)] sm:ml-1 sm:w-auto">
                        Этажность
                      </span>
                      {(
                        [
                          { id: "all" as const, label: "Любая" },
                          { id: "1" as const, label: "1 этаж" },
                          { id: "2plus" as const, label: "2+ этажа" },
                        ] as const
                      ).map(({ id, label }) => {
                        const on = floorFilter === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setFloorFilter(id)}
                            className={chipMutedClass(on)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </>
                  ) : null}

                  {hasAreaData ? (
                    <>
                      <span className="w-full text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)] sm:ml-1 sm:w-auto">
                        Площадь
                      </span>
                      {(
                        [
                          { id: "all" as const, label: "Любая" },
                          { id: "lte150" as const, label: "до 150 м²" },
                          { id: "mid" as const, label: "150–250 м²" },
                          { id: "gt250" as const, label: "свыше 250 м²" },
                        ] as const
                      ).map(({ id, label }) => {
                        const on = areaFilter === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setAreaFilter(id)}
                            className={chipMutedClass(on)}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </>
                  ) : null}

                  <span className="w-full text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)] sm:ml-1 sm:w-auto">
                    Регион
                  </span>
                  {(
                    [
                      { id: "all" as const, label: "Все регионы" },
                      { id: "lo" as const, label: "Северо-Запад и ЛО" },
                      { id: "mo" as const, label: "Москва и область" },
                    ] as const
                  ).map(({ id, label }) => {
                    const on = region === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setRegion(id)}
                        className={chipMutedClass(on)}
                      >
                        {label}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => showMapView()}
                    className="ml-auto inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2 text-[13px] font-semibold text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] dark:bg-[var(--card-bg)] sm:text-sm"
                  >
                    <MapPinned size={17} strokeWidth={2} className="shrink-0 text-[var(--accent)]" aria-hidden />
                    Показать на карте
                    <span className="text-[11px] font-normal text-[var(--text-muted)]">({mappedCount})</span>
                  </button>
                </div>

                {objects.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[var(--text-muted)]">Объекты портфолио пока не добавлены.</p>
                ) : filtered.length === 0 ? (
                  <p className="py-16 text-center text-sm text-[var(--text-muted)]">Нет объектов с выбранными фильтрами.</p>
                ) : (
                  <ul className="grid list-none grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((object) => {
                      const cover = getBuiltObjectCover(object);
                      return (
                        <li key={object.id}>
                          <Link href={`/portfolio/${object.slug}`} className="group block">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--stone)] ring-1 ring-[var(--border)] transition-shadow duration-300 group-hover:ring-[var(--accent)]/40">
                              {cover ? (
                                <CmsImage
                                  src={cover.url}
                                  alt={cover.alt || object.title}
                                  fill
                                  className="object-cover transition-[filter,transform] duration-700 ease-out [filter:grayscale(1)_brightness(0.88)_contrast(1.05)] group-hover:scale-[1.03] group-hover:[filter:grayscale(0)_brightness(1)_contrast(1)]"
                                  sizes="(max-width: 768px) 50vw, 360px"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">Нет фото</div>
                              )}
                            </div>
                            <div className="mt-3 space-y-1 px-0.5">
                              <h2 className="font-heading text-[13px] font-bold uppercase leading-snug tracking-[0.04em] text-[var(--text)] sm:text-sm md:text-[15px]">
                                {object.title}
                              </h2>
                              <p className="text-[11px] font-normal leading-relaxed text-[var(--text-muted)] sm:text-xs md:text-[13px]">
                                {builtObjectMaterialLabel(object.material)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
