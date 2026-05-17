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

const selectClass =
  "min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-[13px] font-medium text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] dark:shadow-none sm:text-sm";

function materialOptions(objects: BuiltObjectItem[]): string[] {
  return ["Все", ...Array.from(new Set(objects.map((o) => o.material)))];
}

type Layout = "page" | "embedded";

export function PortfolioObjectMapExplorer({
  objects,
  layout = "page",
}: {
  objects: BuiltObjectItem[];
  layout?: Layout;
}) {
  const [material, setMaterial] = useState("Все");
  const [region, setRegion] = useState<"all" | BuiltObjectMapRegionSlug>("all");
  const [district, setDistrict] = useState("all");
  const [area, setArea] = useState<BuiltObjectMapFilterState["area"]>("all");
  const [floors, setFloors] = useState<BuiltObjectMapFilterState["floors"]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filters = useMemo<BuiltObjectMapFilterState>(
    () => ({ material, region, district, area, floors }),
    [material, region, district, area, floors]
  );

  const filtered = useMemo(() => filterBuiltObjectsForMap(objects, filters), [objects, filters]);

  const districtOpts = useMemo(() => districtOptionsForRegion(region, objects), [region, objects]);

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
        <label className="flex min-w-[140px] flex-1 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Материал</span>
          <select className={selectClass} value={material} onChange={(e) => setMaterial(e.target.value)}>
            {materialOptions(objects).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[140px] flex-1 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Регион</span>
          <select
            className={selectClass}
            value={region}
            onChange={(e) => setRegion(e.target.value as "all" | BuiltObjectMapRegionSlug)}
          >
            <option value="all">Все регионы</option>
            {BUILT_OBJECT_MAP_REGIONS.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[140px] flex-1 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Район</span>
          <select
            className={selectClass}
            value={district}
            disabled={region === "all"}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="all">Все районы</option>
            {districtOpts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[120px] flex-1 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Площадь</span>
          <select className={selectClass} value={area} onChange={(e) => setArea(e.target.value as BuiltObjectMapFilterState["area"])}>
            {MAP_AREA_FILTER_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[120px] flex-1 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">Этажность</span>
          <select
            className={selectClass}
            value={floors}
            onChange={(e) => setFloors(e.target.value as BuiltObjectMapFilterState["floors"])}
          >
            {MAP_FLOOR_FILTER_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
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
