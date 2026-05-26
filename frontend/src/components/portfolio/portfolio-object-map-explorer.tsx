"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { BuiltObjectItem } from "@/lib/construction-shared";
import {
  BUILT_OBJECT_MAP_REGIONS,
  districtOptionsForRegion,
  filterBuiltObjectsForMap,
  MAP_AREA_FILTER_OPTIONS,
  MAP_FLOOR_FILTER_OPTIONS,
  type BuiltObjectMapFilterState,
  type BuiltObjectMapRegionSlug,
} from "@/lib/built-object-map-taxonomy";
import { PortfolioObjectMapDrawer } from "@/components/portfolio/portfolio-object-map-drawer";
import { SiteSelect } from "@/components/ui/site-select";
import { cn } from "@/lib/utils";

const PortfolioBuiltMap = dynamic(
  () => import("@/components/portfolio/portfolio-built-map").then((m) => m.PortfolioBuiltMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[min(520px,70vh)] w-full items-center justify-center rounded-[1.35rem] border text-sm md:h-[min(640px,75vh)]"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--stone)", color: "var(--text-muted)" }}
      >
        Загрузка карты…
      </div>
    ),
  }
);

function materialOptions(objects: BuiltObjectItem[]): { value: string; label: string }[] {
  return ["Все", ...Array.from(new Set(objects.map((o) => o.material)))].map((m) => ({
    value: m,
    label: m,
  }));
}

type Layout = "page" | "embedded";

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-[140px] flex-1 flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{label}</span>
      {children}
    </div>
  );
}

export function PortfolioObjectMapExplorer({
  objects,
  layout = "page",
  initialObjectSlug,
}: {
  objects: BuiltObjectItem[];
  layout?: Layout;
  /** Slug объекта — открыть маркер и карточку при загрузке (/portfolio/map?object=…) */
  initialObjectSlug?: string | null;
}) {
  const [material, setMaterial] = useState("Все");
  const [region, setRegion] = useState<"all" | BuiltObjectMapRegionSlug>("all");
  const [district, setDistrict] = useState("all");
  const [area, setArea] = useState<BuiltObjectMapFilterState["area"]>("all");
  const [floors, setFloors] = useState<BuiltObjectMapFilterState["floors"]>("all");
  const initialId =
    initialObjectSlug?.trim()
      ? objects.find((o) => o.slug === initialObjectSlug.trim())?.id ?? null
      : null;
  const [selectedId, setSelectedId] = useState<string | null>(initialId);

  const filters = useMemo<BuiltObjectMapFilterState>(
    () => ({ material, region, district, area, floors }),
    [material, region, district, area, floors]
  );

  const filtered = useMemo(() => filterBuiltObjectsForMap(objects, filters), [objects, filters]);

  const districtOpts = useMemo(() => districtOptionsForRegion(region, objects), [region, objects]);

  const regionOptions = useMemo(
    () => [{ value: "all", label: "Все регионы" }, ...BUILT_OBJECT_MAP_REGIONS.map((r) => ({ value: r.slug, label: r.label }))],
    []
  );

  const districtOptions = useMemo(
    () => [{ value: "all", label: "Все районы" }, ...districtOpts.map((d) => ({ value: d.slug, label: d.label }))],
    [districtOpts]
  );

  useEffect(() => {
    setDistrict("all");
  }, [region]);

  useEffect(() => {
    if (!selectedId) return;
    if (!filtered.some((o) => o.id === selectedId)) setSelectedId(null);
  }, [filtered, selectedId]);

  const selected = selectedId ? filtered.find((o) => o.id === selectedId) ?? null : null;

  const mappedCount = filtered.filter((o) => o.latitude != null && o.longitude != null).length;

  return (
    <div className={cn("space-y-5", layout === "page" && "pb-8")}>
      {layout === "page" ? (
        <header className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Построенные дома</p>
          <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[var(--accent)] md:text-3xl dark:text-[var(--text)]">
            Карта построенных объектов
          </h1>
        </header>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <FilterField label="Материал">
          <SiteSelect
            value={material}
            onValueChange={setMaterial}
            options={materialOptions(objects)}
            variant="field"
            size="md"
            aria-label="Материал"
          />
        </FilterField>
        <FilterField label="Регион">
          <SiteSelect
            value={region}
            onValueChange={(v) => setRegion(v as "all" | BuiltObjectMapRegionSlug)}
            options={regionOptions}
            variant="field"
            size="md"
            aria-label="Регион"
          />
        </FilterField>
        <FilterField label="Район">
          <SiteSelect
            value={district}
            onValueChange={setDistrict}
            options={districtOptions}
            variant="field"
            size="md"
            disabled={region === "all"}
            aria-label="Район"
          />
        </FilterField>
        <FilterField label="Площадь">
          <SiteSelect
            value={area}
            onValueChange={(v) => setArea(v as BuiltObjectMapFilterState["area"])}
            options={MAP_AREA_FILTER_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
            variant="field"
            size="md"
            aria-label="Площадь"
          />
        </FilterField>
        <FilterField label="Этажность">
          <SiteSelect
            value={floors}
            onValueChange={(v) => setFloors(v as BuiltObjectMapFilterState["floors"])}
            options={MAP_FLOOR_FILTER_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
            variant="field"
            size="md"
            aria-label="Этажность"
          />
        </FilterField>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        На карте с координатами: <strong className="text-[var(--text)]">{mappedCount}</strong> из {filtered.length}{" "}
        отфильтрованных объектов.
      </p>

      <div
        className={cn(
          "relative min-h-[min(420px,55vh)] md:min-h-[min(560px,72vh)]",
          layout === "page" && "overflow-hidden rounded-[1.35rem] border border-[rgba(43,47,45,0.09)]"
        )}
      >
        <PortfolioBuiltMap
          objects={filtered}
          selectedId={selectedId}
          onSelectMarker={setSelectedId}
          onMapBackgroundClick={() => setSelectedId(null)}
          mapHeightClass={layout === "page" ? "h-[min(560px,72vh)] md:h-[min(640px,78vh)]" : "h-[min(520px,70vh)]"}
          frameless={layout === "page"}
        />
        {selected ? <PortfolioObjectMapDrawer object={selected} onClose={() => setSelectedId(null)} /> : null}
      </div>
    </div>
  );
}
