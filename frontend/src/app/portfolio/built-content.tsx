"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { LayoutGrid, MapPinned, SlidersHorizontal, X } from "lucide-react";
import dynamic from "next/dynamic";
import { PortfolioFilterSelect } from "@/components/portfolio/portfolio-filter-select";
import { builtObjectMaterialLabel, getBuiltObjectCover, type BuiltObjectItem } from "@/lib/construction-shared";
import {
  filterPortfolioObjects,
  mergeFloorFilterOptions,
  mergeMaterialFilterOptions,
  PORTFOLIO_AREA_FILTER_OPTIONS,
  type PortfolioAreaFilterId,
} from "@/lib/portfolio-filter-options";
import {
  builtObjectSiteStatusFilterToParam,
  filterBuiltObjectsBySiteStatus,
  type BuiltObjectSiteStatusFilter,
} from "@/lib/built-object-site-status";
import { resolveBuiltObjectCoverAlt } from "@/lib/seo/built-object-image-seo";
import { cn } from "@/lib/utils";
import { BUILT_HOMES_SECTION_LABEL, UNDER_CONSTRUCTION_SECTION_LABEL } from "@/lib/constants";
import { CmsImage } from "@/components/ui/cms-image";
import { keepBrandNameTogether } from "@/lib/company-requisites";
import { PAGE_LEAD_CLASSNAME } from "@/lib/responsive-copy";

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
  initialView = "grid",
  siteScope = "COMPLETED",
  pageTitle,
  pageDescription,
  breadcrumbLabel,
}: {
  objects: BuiltObjectItem[];
  initialView?: ViewMode;
  /** Какие объекты показывать: готовые, строящиеся или все. */
  siteScope?: BuiltObjectSiteStatusFilter;
  pageTitle?: string;
  pageDescription?: string;
  breadcrumbLabel?: string;
}) {
  const [material, setMaterial] = useState("all");
  const [floorId, setFloorId] = useState("all");
  const [areaId, setAreaId] = useState<PortfolioAreaFilterId>("all");
  const [view, setView] = useState<ViewMode>(initialView);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileFiltersPortalReady, setMobileFiltersPortalReady] = useState(false);
  const explorerRef = useRef<HTMLDivElement>(null);
  const mobileFiltersDrawerRef = useRef<HTMLDivElement>(null);
  const drawerTouchStartY = useRef(0);

  const scopedObjects = useMemo(
    () => filterBuiltObjectsBySiteStatus(objects, siteScope),
    [objects, siteScope]
  );

  const resolvedTitle =
    pageTitle ??
    (siteScope === "UNDER_CONSTRUCTION" ? UNDER_CONSTRUCTION_SECTION_LABEL : BUILT_HOMES_SECTION_LABEL);
  const resolvedBreadcrumb = breadcrumbLabel ?? resolvedTitle;
  const resolvedDescription =
    pageDescription ??
    (siteScope === "UNDER_CONSTRUCTION"
      ? "Дома в процессе строительства: можно отфильтровать по материалу, этажности и площади, посмотреть на карте."
      : "Реализованные дома, которые можно отфильтровать по материалу, этажности и площади.");
  const mapStatusParam = builtObjectSiteStatusFilterToParam(siteScope) ?? "all";
  const mapHref =
    mapStatusParam === "all" ? "/portfolio/map" : `/portfolio/map?status=${mapStatusParam}`;

  useEffect(() => {
    setMobileFiltersPortalReady(true);
  }, []);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileFiltersOpen]);

  const materialOptions = useMemo(
    () => [
      { value: "all", label: "Любая" },
      ...mergeMaterialFilterOptions().map((m) => ({ value: m.value, label: m.label })),
    ],
    []
  );

  const floorOptions = useMemo(() => mergeFloorFilterOptions(), []);

  const floorSelectOptions = useMemo(
    () => [{ value: "all", label: "Любая" }, ...floorOptions.map((f) => ({ value: f.id, label: f.label }))],
    [floorOptions]
  );

  const areaSelectOptions = useMemo(
    () => PORTFOLIO_AREA_FILTER_OPTIONS.map((a) => ({ value: a.id, label: a.label })),
    []
  );

  const filtered = useMemo(
    () => filterPortfolioObjects(scopedObjects, { material, floorId, areaId }, floorOptions),
    [areaId, floorId, floorOptions, material, scopedObjects]
  );

  const filtersAreDefault = material === "all" && floorId === "all" && areaId === "all";
  const hasCustomFilters = !filtersAreDefault;

  function resetAllFilters() {
    setMaterial("all");
    setFloorId("all");
    setAreaId("all");
  }

  function onDrawerTouchStart(e: React.TouchEvent) {
    drawerTouchStartY.current = e.touches[0]?.clientY ?? 0;
  }

  function onDrawerTouchMove(e: React.TouchEvent) {
    const el = mobileFiltersDrawerRef.current;
    if (!el || el.scrollTop > 2) return;
    const y = e.touches[0]?.clientY ?? 0;
    if (y - drawerTouchStartY.current > 52) {
      setMobileFiltersOpen(false);
    }
  }

  const mappedCount = filtered.filter((o) => o.latitude != null && o.longitude != null).length;

  const filterControls = (
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
    </div>
  );

  const mapButton = (
    <Link
      href={mapHref}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-[12px] font-semibold text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] dark:bg-[var(--card-bg)] sm:text-[13px]"
    >
      <MapPinned size={15} strokeWidth={2} className="shrink-0 text-[var(--accent)]" aria-hidden />
      Показать на карте
      <span className="text-[11px] font-normal text-[var(--text-muted)]">({mappedCount})</span>
    </Link>
  );

  const filtersPanel = (
    <div className="flex flex-col gap-3">
      {filterControls}
      {mapButton}
    </div>
  );

  const mobileFiltersPortal =
    mobileFiltersPortalReady &&
    view === "grid" &&
    createPortal(
      <>
        <button
          type="button"
          className={cn(
            "projects-catalog-filters-fab lg:hidden",
            mobileFiltersOpen && "projects-catalog-filters-fab--hidden"
          )}
          onClick={() => setMobileFiltersOpen(true)}
          aria-expanded={mobileFiltersOpen}
          aria-controls="portfolio-filters-drawer"
        >
          <SlidersHorizontal size={20} strokeWidth={2.2} aria-hidden />
          <span className="sr-only">Фильтры: {BUILT_HOMES_SECTION_LABEL}</span>
          {hasCustomFilters ? <span className="projects-catalog-filters-fab__dot" aria-hidden /> : null}
        </button>

        <div
          className={cn(
            "projects-catalog-filters-overlay lg:hidden",
            mobileFiltersOpen && "projects-catalog-filters-overlay--open"
          )}
          aria-hidden={!mobileFiltersOpen}
        >
          <button
            type="button"
            className="projects-catalog-filters-backdrop"
            aria-label="Закрыть фильтры"
            onClick={() => setMobileFiltersOpen(false)}
            onWheel={() => setMobileFiltersOpen(false)}
            tabIndex={mobileFiltersOpen ? 0 : -1}
          />
          <aside
            id="portfolio-filters-drawer"
            ref={mobileFiltersDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Фильтры: ${BUILT_HOMES_SECTION_LABEL}`}
            className={cn(
              "projects-catalog-filters-drawer",
              mobileFiltersOpen && "projects-catalog-filters-drawer--open"
            )}
            onTouchStart={onDrawerTouchStart}
            onTouchMove={onDrawerTouchMove}
          >
            <div className="projects-catalog-filters-drawer__head">
              <span
                className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--text)" }}
              >
                <SlidersHorizontal size={18} aria-hidden />
                Фильтры
              </span>
              <div className="flex items-center gap-3">
                {hasCustomFilters ? (
                  <button
                    type="button"
                    onClick={() => {
                      resetAllFilters();
                    }}
                    className="text-sm font-medium underline-offset-4 hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Сбросить
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:border-[var(--accent)]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--text) 12%, transparent)",
                    color: "var(--text-muted)",
                  }}
                  aria-label="Закрыть"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div
              className="projects-catalog-filters-drawer__body"
              onWheel={(e) => {
                const el = mobileFiltersDrawerRef.current;
                if (el && el.scrollTop <= 0 && e.deltaY < 0) {
                  setMobileFiltersOpen(false);
                }
              }}
            >
              {filtersPanel}
            </div>
          </aside>
        </div>
      </>,
      document.body
    );

  return (
    <section className="page-top-offset pb-24" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      {mobileFiltersPortal}
      <div className="container mx-auto max-w-[1320px] px-5">
        <nav className="text-[12px] tracking-[0.02em] text-[var(--text-muted)] sm:text-[13px]" aria-label="Навигация по разделу">
          <Link href="/" className="transition-colors hover:text-[var(--accent)]">
            Главная
          </Link>
          <span className="mx-1.5 text-[var(--text-subtle)] sm:mx-2" aria-hidden>
            {" > "}
          </span>
          {siteScope === "UNDER_CONSTRUCTION" ? (
            <>
              <Link href="/portfolio" className="transition-colors hover:text-[var(--accent)]">
                {BUILT_HOMES_SECTION_LABEL}
              </Link>
              <span className="mx-1.5 text-[var(--text-subtle)] sm:mx-2" aria-hidden>
                {" > "}
              </span>
              <span className="text-[var(--text)]">{resolvedBreadcrumb}</span>
            </>
          ) : (
            <span className="text-[var(--text)]">{resolvedBreadcrumb}</span>
          )}
        </nav>

        <div className="mt-5 md:mt-6">
          <h1 className="max-w-3xl font-heading text-2xl font-bold leading-tight tracking-tight text-[var(--accent)] sm:text-3xl md:text-4xl dark:text-[var(--text)]">
            {resolvedTitle}
          </h1>
          <p className={`mt-4 ${PAGE_LEAD_CLASSNAME}`}>
            {keepBrandNameTogether(resolvedDescription)}
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
                  href={mapHref}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-[12px] font-semibold text-[var(--accent)] transition-colors hover:border-[var(--accent)] dark:bg-[var(--card-bg)] sm:text-[13px]"
                >
                  <MapPinned size={15} strokeWidth={2} aria-hidden />
                  Открыть страницу карты
                </Link>
              </div>
              <div className="overflow-hidden rounded-[1.5rem]">
                <PortfolioObjectMapExplorer
                  objects={scopedObjects}
                  layout="embedded"
                  initialSiteStatus={siteScope}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    Фильтры
                  </p>
                  <span className="rounded-full bg-[var(--bg)] px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
                    {filtered.length} объектов
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {filterControls}
                  <div className="ml-auto">{mapButton}</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 lg:hidden">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Объекты
                </p>
                <span className="rounded-full bg-[var(--bg)] px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)]">
                  {filtered.length} объектов
                </span>
              </div>

              {scopedObjects.length === 0 ? (
                <p className="py-16 text-center text-sm text-[var(--text-muted)]">
                  {siteScope === "UNDER_CONSTRUCTION"
                    ? "Строящиеся объекты пока не добавлены."
                    : "Построенные дома пока не добавлены."}
                </p>
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
                                alt={resolveBuiltObjectCoverAlt(object, cover.alt)}
                                title={resolveBuiltObjectCoverAlt(object, cover.alt)}
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
