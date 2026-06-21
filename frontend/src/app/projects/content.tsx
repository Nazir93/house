"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutGrid, LayoutList, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRub, getProjectRenders, type HouseProjectItem } from "@/lib/construction-data";
import {
  buildProjectsSearchParams,
  hasCustomProjectsCatalogFilters,
  getCatalogFiltersForMaterialChange,
  MATERIAL_OPTIONS,
  parseMaterialParam,
  parseProjectsCatalogSearchParams,
  projectMatchesAreaPrice,
  projectMatchesCatalogFiltersExceptRange,
  projectMatchesFloors,
  projectMatchesMaterial,
  projectMatchesQuery,
  getPublishedProjectBounds,
  type FloorsFilterId,
  type MaterialFilterId,
  type ProjectsSortKey,
} from "@/lib/project-filters";
import { HouseProjectGridCard } from "@/components/projects/house-project-grid-card";
import {
  AUTHOR_HOUSE_PROJECT_CATALOG,
  houseProjectDetailPath,
  type HouseProjectCatalogConfig,
} from "@/lib/house-project-catalog";
import { resolveProjectListingPriceRub } from "@/lib/project-listing-price";
import { houseProjectCatalogTeaser } from "@/lib/house-project-teaser";
import { CmsImage } from "@/components/ui/cms-image";
import { SiteSelect } from "@/components/ui/site-select";

const PAGE_SIZE = 6;

function parseNumParam(v: string | null | undefined, fallback: number): number {
  if (v == null || String(v).trim() === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const filterShellClass =
  "overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--text)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-secondary)_55%,var(--bg))] shadow-[0_8px_32px_rgb(0_0_0/0.04)]";
const filterSectionClass =
  "border-b border-[color-mix(in_srgb,var(--text)_7%,transparent)] px-4 py-4 last:border-b-0 md:px-5 md:py-5";
const catalogFieldClass =
  "catalog-field-input w-full border text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--accent)]";
const catalogFieldStyle = {
  borderColor: "color-mix(in srgb, var(--text) 12%, transparent)",
  backgroundColor: "var(--bg)",
  color: "var(--text)",
} as const;
const filterInputClass = `${catalogFieldClass} px-4 py-2.5`;
const catalogSearchInputClass = `${catalogFieldClass} funnel-text-input h-12 py-2 pl-10 pr-4`;

export function ProjectsCatalogContent({
  projects,
  searchParams,
  catalog = AUTHOR_HOUSE_PROJECT_CATALOG,
  pageTitle,
  pageDescription,
  breadcrumbLabel,
  seoLandingLinks = [],
}: {
  projects: HouseProjectItem[];
  searchParams: Record<string, string | string[] | undefined>;
  catalog?: HouseProjectCatalogConfig;
  pageTitle?: string;
  pageDescription?: string;
  breadcrumbLabel?: string;
  seoLandingLinks?: Array<{ href: string; label: string; description: string }>;
}) {
  const basePath = catalog.basePath;
  const router = useRouter();
  const materialFromUrl = useMemo(() => {
    const raw = searchParams.material;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return parseMaterialParam(value ?? null);
  }, [searchParams.material]);
  const bounds = useMemo(
    () => getPublishedProjectBounds(projects, materialFromUrl),
    [projects, materialFromUrl],
  );
  const filters = useMemo(
    () => parseProjectsCatalogSearchParams(searchParams, bounds),
    [searchParams, bounds],
  );

  const { areaMin, areaMax, priceMinRub, priceMaxRub, material, floors, sort, q } = filters;

  const [page, setPage] = useState(1);
  const [queryInput, setQueryInput] = useState(q);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileFiltersPortalReady, setMobileFiltersPortalReady] = useState(false);
  const mobileFiltersDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileFiltersPortalReady(true);
  }, []);

  useEffect(() => {
    setQueryInput(q);
  }, [q]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileFiltersOpen]);

  const hasCustomFilters = hasCustomProjectsCatalogFilters(searchParams);

  const pushFilters = useCallback(
    (next: {
      areaMin: number;
      areaMax: number;
      priceMinRub: number;
      priceMaxRub: number;
      material: MaterialFilterId;
      floors: FloorsFilterId;
      q: string;
      sort: ProjectsSortKey;
    }) => {
      const nextBounds = getPublishedProjectBounds(projects, next.material);
      const qs = buildProjectsSearchParams({
        ...next,
        priceMinRub: next.priceMinRub,
        priceMaxRub: next.priceMaxRub,
        sort: next.sort,
        bounds: nextBounds,
      });
      router.push(qs ? `${basePath}?${qs}` : basePath);
      setPage(1);
    },
    [router, projects, basePath],
  );

  const setMaterialFilter = useCallback(
    (nextMaterial: MaterialFilterId) => {
      pushFilters(getCatalogFiltersForMaterialChange(projects, nextMaterial, { floors, q, sort }));
    },
    [projects, pushFilters, floors, q, sort],
  );

  const listingPriceRub = useCallback(
    (project: HouseProjectItem) => resolveProjectListingPriceRub(project, material),
    [material],
  );

  const filtered = useMemo(() => {
    const result = projects.filter((project) => {
      if (!project.published) return false;
      if (!projectMatchesMaterial(project, material)) return false;
      if (!projectMatchesFloors(project, floors)) return false;
      if (!projectMatchesAreaPrice(project, areaMin, areaMax, priceMinRub, priceMaxRub, material)) return false;
      if (!projectMatchesQuery(project, q)) return false;
      return true;
    });
    return [...result].sort((a, b) => {
      if (sort === "area") return a.area - b.area;
      if (sort === "new") return Number(b.isNew) - Number(a.isNew);
      return listingPriceRub(a) - listingPriceRub(b);
    });
  }, [areaMax, areaMin, floors, listingPriceRub, material, priceMaxRub, priceMinRub, projects, q, sort]);

  /** Старый URL с зафиксированным areaMax/priceMax скрывал новые проекты — сбрасываем только диапазон. */
  useEffect(() => {
    const published = projects.filter((p) => p.published);
    if (published.length === 0 || filtered.length > 0) return;

    const hasRangeInUrl =
      searchParams.areaMin != null ||
      searchParams.areaMax != null ||
      searchParams.priceMin != null ||
      searchParams.priceMax != null;
    if (!hasRangeInUrl) return;

    const matchesWithoutRange = published.some((p) =>
      projectMatchesCatalogFiltersExceptRange(p, { material, floors, q }),
    );
    if (!matchesWithoutRange) return;

    const qs = buildProjectsSearchParams({
      areaMin: bounds.minArea,
      areaMax: bounds.maxArea,
      priceMinRub: bounds.minPriceRub,
      priceMaxRub: bounds.maxPriceRub,
      material,
      floors,
      q,
      sort,
      bounds,
    });
    router.replace(qs ? `${basePath}?${qs}` : basePath);
  }, [
    bounds,
    filtered.length,
    floors,
    material,
    projects,
    q,
    router,
    searchParams.areaMax,
    searchParams.areaMin,
    searchParams.priceMax,
    searchParams.priceMin,
    sort,
  ]);

  const visible = filtered.slice(0, page * PAGE_SIZE);

  function chip(active: boolean) {
    return {
      backgroundColor: active
        ? "var(--accent)"
        : "color-mix(in srgb, var(--bg) 70%, var(--bg-secondary))",
      borderColor: active ? "var(--accent)" : "color-mix(in srgb, var(--text) 12%, transparent)",
      color: active ? "var(--accent-contrast)" : "var(--text-muted)",
    };
  }

  function presetChipStyle() {
    return {
      borderColor: "color-mix(in srgb, var(--text) 12%, transparent)",
      backgroundColor: "color-mix(in srgb, var(--bg) 80%, var(--bg-secondary))",
      color: "var(--text-muted)",
    };
  }

  function clearFilters() {
    router.push(basePath);
    setPage(1);
  }

  const filtersRef = useRef({
    areaMin,
    areaMax,
    priceMinRub,
    priceMaxRub,
    material,
    floors,
    sort,
  });

  useEffect(() => {
    filtersRef.current = { areaMin, areaMax, priceMinRub, priceMaxRub, material, floors, sort };
  }, [areaMin, areaMax, priceMinRub, priceMaxRub, material, floors, sort]);

  /** Поиск по строке с задержкой; актуальные фильтры берём из ref */
  useEffect(() => {
    const t = setTimeout(() => {
      if (queryInput.trim() === q) return;
      const f = filtersRef.current;
      pushFilters({ ...f, q: queryInput.trim() });
    }, 450);
    return () => clearTimeout(t);
  }, [queryInput, q, pushFilters]);

  const applyRange = (next: {
    areaMin: number;
    areaMax: number;
    priceMinRub: number;
    priceMaxRub: number;
  }) => {
    const aLo = Math.min(next.areaMin, next.areaMax);
    const aHi = Math.max(next.areaMin, next.areaMax);
    const pLo = Math.min(next.priceMinRub, next.priceMaxRub);
    const pHi = Math.max(next.priceMinRub, next.priceMaxRub);
    pushFilters({
      areaMin: aLo,
      areaMax: aHi,
      priceMinRub: pLo,
      priceMaxRub: pHi,
      material,
      floors,
      q,
      sort,
    });
  };

  const floorsBtn = (id: FloorsFilterId) => {
    const active = floors === id;
    const label =
      id === "all" ? "Все" : id === "1.5" ? "1½" : id === "1" ? "1" : id === "2" ? "2" : id;
    return (
      <button
        key={id}
        type="button"
        onClick={() =>
          pushFilters({
            areaMin,
            areaMax,
            priceMinRub,
            priceMaxRub,
            material,
            floors: id,
            q,
            sort,
          })
        }
        className={`flex min-h-11 items-center justify-center rounded-full border px-3 text-sm font-semibold transition-colors hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)] ${id === "all" ? "min-w-[3.25rem]" : "h-11 w-11 p-0"}`}
        style={chip(active)}
        aria-pressed={active}
      >
        {label}
      </button>
    );
  };

  const drawerTouchStartY = useRef(0);

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

  const filtersPanel = (
    <div className={filterShellClass}>
              <div className={filterSectionClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-subtle)" }}>
                  Технология / материал
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {MATERIAL_OPTIONS.map((o) => {
                    const active = material === o.id;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setMaterialFilter(o.id)}
                        className="rounded-full border px-3 py-2 text-left text-[13px] font-medium leading-snug transition-colors hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)]"
                        style={chip(active)}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={filterSectionClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-subtle)" }}>
                  Этажность
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {floorsBtn("all")}
                  {floorsBtn("1")}
                  {floorsBtn("1.5")}
                  {floorsBtn("2")}
                </div>
              </div>

              <div className={filterSectionClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-subtle)" }}>
                  Площадь, м²
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      от
                    </span>
                    <input
                      type="number"
                      min={bounds.minArea}
                      max={bounds.maxArea}
                      value={areaMin}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isFinite(v)) return;
                        applyRange({
                          areaMin: Math.min(Math.max(v, bounds.minArea), areaMax),
                          areaMax,
                          priceMinRub,
                          priceMaxRub,
                        });
                      }}
                      className={filterInputClass}
                      style={catalogFieldStyle}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      до
                    </span>
                    <input
                      type="number"
                      min={bounds.minArea}
                      max={bounds.maxArea}
                      value={areaMax}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isFinite(v)) return;
                        applyRange({
                          areaMin,
                          areaMax: Math.max(Math.min(v, bounds.maxArea), areaMin),
                          priceMinRub,
                          priceMaxRub,
                        });
                      }}
                      className={filterInputClass}
                      style={catalogFieldStyle}
                    />
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { label: "до 150 м²", aMin: bounds.minArea, aMax: Math.min(150, bounds.maxArea) },
                    { label: "150–220 м²", aMin: Math.max(bounds.minArea, 150), aMax: Math.min(220, bounds.maxArea) },
                    { label: "от 220 м²", aMin: Math.max(bounds.minArea, 220), aMax: bounds.maxArea },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        applyRange({
                          areaMin: preset.aMin,
                          areaMax: Math.max(preset.aMax, preset.aMin),
                          priceMinRub,
                          priceMaxRub,
                        })
                      }
                      className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors hover:border-[color-mix(in_srgb,var(--accent)_35%,transparent)] hover:text-[var(--text)]"
                      style={presetChipStyle()}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={filterSectionClass}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-subtle)" }}>
                  Стоимость, ₽
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      от (млн)
                    </span>
                    <input
                      type="number"
                      step={0.5}
                      min={bounds.minPriceRub / 1_000_000}
                      max={bounds.maxPriceRub / 1_000_000}
                      value={priceMinRub / 1_000_000}
                      onChange={(e) => {
                        const v = Number(e.target.value.replace(",", ".")) * 1_000_000;
                        if (!Number.isFinite(v)) return;
                        applyRange({
                          areaMin,
                          areaMax,
                          priceMinRub: Math.min(Math.max(v, bounds.minPriceRub), priceMaxRub),
                          priceMaxRub,
                        });
                      }}
                      className={filterInputClass}
                      style={catalogFieldStyle}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      до (млн)
                    </span>
                    <input
                      type="number"
                      step={0.5}
                      min={bounds.minPriceRub / 1_000_000}
                      max={bounds.maxPriceRub / 1_000_000}
                      value={priceMaxRub / 1_000_000}
                      onChange={(e) => {
                        const v = Number(e.target.value.replace(",", ".")) * 1_000_000;
                        if (!Number.isFinite(v)) return;
                        applyRange({
                          areaMin,
                          areaMax,
                          priceMinRub,
                          priceMaxRub: Math.max(Math.min(v, bounds.maxPriceRub), priceMinRub),
                        });
                      }}
                      className={filterInputClass}
                      style={catalogFieldStyle}
                    />
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    { label: "до 10 млн", pMin: bounds.minPriceRub, pMax: Math.min(10_000_000, bounds.maxPriceRub) },
                    {
                      label: "10–15 млн",
                      pMin: Math.max(bounds.minPriceRub, 10_000_000),
                      pMax: Math.min(15_000_000, bounds.maxPriceRub),
                    },
                    { label: "от 15 млн", pMin: Math.max(bounds.minPriceRub, 15_000_000), pMax: bounds.maxPriceRub },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        applyRange({
                          areaMin,
                          areaMax,
                          priceMinRub: preset.pMin,
                          priceMaxRub: preset.pMax,
                        })
                      }
                      className="rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors hover:border-[color-mix(in_srgb,var(--accent)_35%,transparent)] hover:text-[var(--text)]"
                      style={presetChipStyle()}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
  );

  const mobileFiltersPortal =
    mobileFiltersPortalReady &&
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
          aria-controls="projects-catalog-filters-drawer"
        >
          <SlidersHorizontal size={20} strokeWidth={2.2} aria-hidden />
          <span className="sr-only">Фильтры</span>
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
            id="projects-catalog-filters-drawer"
            ref={mobileFiltersDrawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Фильтры каталога"
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
                    onClick={clearFilters}
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
    <section className="page-top-offset pb-20 md:pb-28" style={{ backgroundColor: "var(--bg)" }}>
      {mobileFiltersPortal}

      <div className="container mx-auto max-w-[1400px] px-5">
        <div className="grid gap-10 lg:grid-cols-[minmax(260px,320px)_1fr] lg:items-start lg:gap-12">
          <aside className="hidden space-y-4 lg:sticky lg:top-28 lg:block">
            {filtersPanel}
            <div className="flex items-center justify-between">
              {hasCustomFilters ? (
                <button type="button" onClick={clearFilters} className="text-sm font-medium underline-offset-4 hover:underline" style={{ color: "var(--text-muted)" }}>
                  Сбросить фильтры
                </button>
              ) : (
                <span />
              )}
            </div>
          </aside>

          {/* ——— Основная колонка ——— */}
          <div className="min-w-0">
            <nav className="text-[12px] tracking-[0.02em] sm:text-[13px]" style={{ color: "var(--text-muted)" }} aria-label="Навигация по разделу">
              <Link href="/" className="transition-colors hover:text-[var(--accent)]">
                Главная
              </Link>
              <span className="mx-1.5 text-[var(--text-subtle)] sm:mx-2" aria-hidden>
                {' › '}
              </span>
              <span style={{ color: "var(--text)" }}>{breadcrumbLabel || catalog.listBreadcrumb}</span>
            </nav>

            <h1 className="mt-4 font-heading text-[1.75rem] font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.5rem]" style={{ color: "var(--text)" }}>
              {pageTitle || catalog.listTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
              {pageDescription || catalog.listDescription}
            </p>

            {seoLandingLinks.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-subtle)" }}>
                  Популярные подборки
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {seoLandingLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      title={link.description}
                      className="rounded-full border px-4 py-2 text-[13px] font-medium transition-colors hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)] hover:text-[var(--text)]"
                      style={{
                        borderColor: "color-mix(in srgb, var(--text) 12%, transparent)",
                        backgroundColor: "color-mix(in srgb, var(--bg) 75%, var(--bg-secondary))",
                        color: "var(--text-muted)",
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} aria-hidden />
                <input
                  type="search"
                  placeholder="Например, название или артикул проекта"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className={catalogSearchInputClass}
                  style={catalogFieldStyle}
                  aria-label="Поиск по каталогу"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <SiteSelect
                  value={sort}
                  onValueChange={(next) =>
                    pushFilters({
                      areaMin,
                      areaMax,
                      priceMinRub,
                      priceMaxRub,
                      material,
                      floors,
                      q,
                      sort: next as ProjectsSortKey,
                    })
                  }
                  options={[
                    { value: "price", label: "По цене" },
                    { value: "area", label: "По площади" },
                    { value: "new", label: "Сначала новинки" },
                  ]}
                  variant="pill"
                  size="lg"
                  className="min-w-[11rem]"
                  aria-label="Сортировка"
                />
                <div
                  className="flex rounded-full border p-1"
                  role="group"
                  aria-label="Вид списка"
                  style={{
                    borderColor: "color-mix(in srgb, var(--text) 12%, transparent)",
                    backgroundColor: "color-mix(in srgb, var(--bg-secondary) 50%, var(--bg))",
                  }}
                >
                  <button
                    type="button"
                    aria-pressed={view === "grid"}
                    onClick={() => setView("grid")}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                    style={{
                      backgroundColor: view === "grid" ? "var(--accent)" : "transparent",
                      color: view === "grid" ? "var(--accent-contrast)" : "var(--text-muted)",
                    }}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    type="button"
                    aria-pressed={view === "list"}
                    onClick={() => setView("list")}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                    style={{
                      backgroundColor: view === "list" ? "var(--accent)" : "transparent",
                      color: view === "list" ? "var(--accent-contrast)" : "var(--text-muted)",
                    }}
                  >
                    <LayoutList size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Быстрые пресеты */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                {
                  label: "Одноэтажные",
                  fn: () =>
                    pushFilters({
                      areaMin,
                      areaMax,
                      priceMinRub,
                      priceMaxRub,
                      material,
                      floors: "1",
                      q,
                      sort,
                    }),
                },
                {
                  label: "Двухэтажные",
                  fn: () =>
                    pushFilters({
                      areaMin,
                      areaMax,
                      priceMinRub,
                      priceMaxRub,
                      material,
                      floors: "2",
                      q,
                      sort,
                    }),
                },
                {
                  label: "Газобетон",
                  fn: () =>
                    pushFilters({
                      areaMin,
                      areaMax,
                      priceMinRub,
                      priceMaxRub,
                      material: "gazobeton",
                      floors,
                      q,
                      sort,
                    }),
                },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={preset.fn}
                  className="rounded-full border px-4 py-2 text-[13px] font-medium transition-colors hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)] hover:text-[var(--text)]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--text) 12%, transparent)",
                    backgroundColor: "color-mix(in srgb, var(--bg) 75%, var(--bg-secondary))",
                    color: "var(--text-muted)",
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Карточки */}
            <div
              className={
                view === "grid"
                  ? "mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 md:gap-x-5 md:gap-y-4 xl:grid-cols-3"
                  : "mt-10 grid gap-5"
              }
            >
              {visible.map((project) => {
                const cover = getProjectRenders(project)[0];
                const matLabel = project.materials[0] || "на выбор";

                if (view === "grid") {
                  return (
                    <HouseProjectGridCard
                      key={project.id}
                      project={project}
                      priceRub={listingPriceRub(project)}
                      projectBasePath={basePath}
                      catalogKind={catalog.kind}
                      imageSizes="(max-width: 1280px) 50vw, 400px"
                    />
                  );
                }

                return (
                  <article
                    key={project.id}
                    className="group grid overflow-hidden rounded-[28px] border md:grid-cols-[minmax(260px,420px)_1fr]"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
                  >
                    <Link href={houseProjectDetailPath(catalog, project.slug)} className="relative min-h-[260px] overflow-hidden bg-[var(--stone)]">
                      {cover ? (
                        <CmsImage
                          src={cover.url}
                          alt={cover.alt || project.title}
                          fill
                          className="scale-[1.06] object-cover object-[center_38%] transition-transform duration-700 group-hover:scale-[1.1]"
                          sizes="(max-width: 768px) 100vw, 420px"
                        />
                      ) : null}
                      <div className="absolute left-4 top-4 flex gap-2">
                        {project.isNew ? (
                          <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: "var(--accent)" }}>
                            Новый проект
                          </span>
                        ) : null}
                        {project.pricePromo ? (
                          <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: "var(--sale)" }}>
                            {project.pricePromo}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                    <div className="flex flex-col gap-6 p-5 md:p-8">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <Link
                            href={houseProjectDetailPath(catalog, project.slug)}
                            className="font-heading text-3xl transition-colors group-hover:text-[var(--accent)]"
                            style={{ color: "var(--text)" }}
                          >
                            {project.title}
                          </Link>
                          <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            {houseProjectCatalogTeaser(project.shortDescription, project.description)}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--text-subtle)" }}>
                            Стоимость
                          </p>
                          <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--sale)" }}>
                            {formatRub(listingPriceRub(project))}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {[
                          ["Этажность", `${project.floors}`],
                          ["Площадь", `${project.area} м²`],
                          ["Комнаты", `${project.rooms}`],
                          ["Санузлы", `${project.bathrooms}`],
                          ["Материалы", matLabel],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-2xl bg-[var(--bg)] p-3">
                            <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--text-subtle)" }}>
                              {label}
                            </p>
                            <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text)" }}>
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={houseProjectDetailPath(catalog, project.slug)}
                          className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
                          style={{ backgroundColor: "var(--accent)" }}
                        >
                          Смотреть проект <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {filtered.length === 0 ? (
              <p className="mt-10 text-center text-base" style={{ color: "var(--text-muted)" }}>
                Нет проектов по выбранным условиям. Измените фильтры или{" "}
                <Link href="/#projects-constructor" className="font-medium underline-offset-4 hover:underline" style={{ color: "var(--accent)" }}>
                  посмотрите подбор по материалам на главной
                </Link>
                .
              </p>
            ) : null}

            {visible.length < filtered.length ? (
              <button
                type="button"
                onClick={() => setPage((value) => value + 1)}
                className="mt-10 w-full rounded-[24px] border px-6 py-5 text-lg font-semibold transition-colors hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                Показать ещё {Math.min(PAGE_SIZE, filtered.length - visible.length)} проектов
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
