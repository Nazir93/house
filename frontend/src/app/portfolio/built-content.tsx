"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LayoutGrid, MapPinned } from "lucide-react";
import dynamic from "next/dynamic";
import { PortfolioFilterSelect } from "@/components/portfolio/portfolio-filter-select";
import { builtObjectMaterialLabel, getBuiltObjectCover, type BuiltObjectItem } from "@/lib/construction-shared";
import {
  filterPortfolioObjects,
  mergeFloorFilterOptions,
  mergeMaterialFilterOptions,
  PORTFOLIO_AREA_FILTER_OPTIONS,
  type PortfolioAreaFilterId,
  type PortfolioFilterOptionsConfig,
} from "@/lib/portfolio-filter-options";
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

function chipClass(active: boolean) {
  return cn(
    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors sm:text-[13px]",
    active
      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
      : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text)] hover:border-[var(--accent)]/50 dark:bg-[var(--card-bg)]"
  );
}

export function BuiltPortfolioContent({
  objects,
  filterConfig,
  initialView = "grid",
}: {
  objects: BuiltObjectItem[];
  filterConfig: PortfolioFilterOptionsConfig;
  initialView?: ViewMode;
}) {
  const [material, setMaterial] = useState("all");
  const [floorId, setFloorId] = useState("all");
  const [areaId, setAreaId] = useState<PortfolioAreaFilterId>("all");
  const [view, setView] = useState<ViewMode>(initialView);
  const explorerRef = useRef<HTMLDivElement>(null);

  const materialOptions = useMemo(
    () => [
      { value: "all", label: "Любая" },
      ...mergeMaterialFilterOptions(filterConfig).map((m) => ({ value: m.value, label: m.label })),
    ],
    [filterConfig]
  );

  const floorOptions = useMemo(() => mergeFloorFilterOptions(filterConfig), [filterConfig]);

  const floorSelectOptions = useMemo(
    () => [{ value: "all", label: "Любая" }, ...floorOptions.map((f) => ({ value: f.id, label: f.label }))],
    [floorOptions]
  );

  const areaSelectOptions = useMemo(
    () => PORTFOLIO_AREA_FILTER_OPTIONS.map((a) => ({ value: a.id, label: a.label })),
    []
  );

  const filtered = useMemo(
    () => filterPortfolioObjects(objects, { material, floorId, areaId }, floorOptions),
    [areaId, floorId, floorOptions, material, objects]
  );

  const filtersAreDefault = material === "all" && floorId === "all" && areaId === "all";

  function resetAllFilters() {
    setMaterial("all");
    setFloorId("all");
    setAreaId("all");
  }

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
    <section className="page-top-offset pb-24" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
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

        <div className="mt-5 max-w-3xl md:mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Построенные дома</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-[var(--accent)] md:text-[2.75rem] md:leading-[1.06] lg:text-[3.15rem] dark:text-[var(--text)]">
            Портфолио
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
            Реализованные дома, которые можно отфильтровать по материалу, этажности и площади.
          </p>
        </div>

        <div ref={explorerRef} id="portfolio-explorer" className="mt-8 scroll-mt-24 space-y-8 md:scroll-mt-28">
          {view === "map" ? (
            <div className="space-y-6">
              <div className="flex w-full flex-wrap items-center gap-2">
                <button type="button" onClick={() => setView("grid")} className={chipClass(true)}>
                  <LayoutGrid size={15} strokeWidth={2} aria-hidden />
                  К сетке
                </button>
                <Link
                  href="/portfolio/map"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-[12px] font-semibold text-[var(--accent)] transition-colors hover:border-[var(--accent)] dark:bg-[var(--card-bg)] sm:text-[13px]"
                >
                  <MapPinned size={15} strokeWidth={2} aria-hidden />
                  Открыть страницу карты
                </Link>
              </div>
              <div className="overflow-hidden rounded-[1.5rem]">
                <PortfolioObjectMapExplorer objects={objects} layout="embedded" />
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Фильтры портфолио
                  </p>
                  <span className="rounded-full bg-[var(--bg)] px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
                    {filtered.length} объектов
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className={chipClass(filtersAreDefault)}
                    aria-pressed={filtersAreDefault}
                  >
                    Все
                  </button>

                  <PortfolioFilterSelect
                    label="Материал"
                    value={material}
                    onValueChange={setMaterial}
                    options={materialOptions}
                    active={material !== "all"}
                  />
                  <PortfolioFilterSelect
                    label="Этажность"
                    value={floorId}
                    onValueChange={setFloorId}
                    options={floorSelectOptions}
                    active={floorId !== "all"}
                  />
                  <PortfolioFilterSelect
                    label="Площадь"
                    value={areaId}
                    onValueChange={(v) => setAreaId(v as PortfolioAreaFilterId)}
                    options={areaSelectOptions}
                    active={areaId !== "all"}
                  />

                  <button
                    type="button"
                    onClick={() => showMapView()}
                    className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-[12px] font-semibold text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] dark:bg-[var(--card-bg)] sm:text-[13px]"
                  >
                    <MapPinned size={15} strokeWidth={2} className="shrink-0 text-[var(--accent)]" aria-hidden />
                    Показать на карте
                    <span className="text-[11px] font-normal text-[var(--text-muted)]">({mappedCount})</span>
                  </button>
                </div>
              </div>

              {objects.length === 0 ? (
                <p className="py-16 text-center text-sm text-[var(--text-muted)]">Объекты портфолио пока не добавлены.</p>
              ) : filtered.length === 0 ? (
                <p className="py-16 text-center text-sm text-[var(--text-muted)]">Нет объектов с выбранными фильтрами.</p>
              ) : (
                <ul className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {filtered.map((object) => {
                    const cover = getBuiltObjectCover(object);
                    return (
                      <li key={object.id}>
                        <Link
                          href={`/portfolio/${object.slug}`}
                          className="group block overflow-hidden rounded-[1.35rem] bg-[var(--bg)] p-3 shadow-[0_10px_34px_rgba(15,61,46,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(15,61,46,0.12)]"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--stone)]">
                            {cover ? (
                              <CmsImage
                                src={cover.url}
                                alt={cover.alt || object.title}
                                fill
                                className="object-cover grayscale transition-[filter,transform] duration-500 ease-out group-hover:scale-[1.02] group-hover:grayscale-0"
                                sizes="(max-width: 768px) 50vw, 360px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">
                                Нет фото
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 px-1 pb-1 pt-3 text-center">
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
  );
}
