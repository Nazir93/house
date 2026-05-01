"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { HouseProjectItem } from "@/lib/construction-data";
import {
  buildProjectsSearchParams,
  FLOORS_OPTIONS,
  MATERIAL_OPTIONS,
  type FloorsFilterId,
  type MaterialFilterId,
  getPublishedProjectBounds,
} from "@/lib/project-filters";

const MATERIAL_CARDS: {
  id: Exclude<MaterialFilterId, "all">;
  title: string;
  pricePerM2: string;
  image: string;
}[] = [
  {
    id: "gazobeton",
    title: "Дома из газобетона",
    pricePerM2: "от 48 300 руб/м²",
    image: "/images/projects/house-placeholder-1.jpg",
  },
  {
    id: "keramoblok",
    title: "Дома из керамоблока",
    pricePerM2: "от 50 400 руб/м²",
    image: "/images/projects/house-placeholder-2.jpg",
  },
  {
    id: "kirpich",
    title: "Дома из кирпича",
    pricePerM2: "от 52 600 руб/м²",
    image: "/images/projects/house-placeholder-3.jpg",
  },
];

function DualRange({
  label,
  min,
  max,
  low,
  high,
  unit,
  onLow,
  onHigh,
}: {
  label: string;
  min: number;
  max: number;
  low: number;
  high: number;
  unit: string;
  onLow: (v: number) => void;
  onHigh: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
          {label}
        </span>
        <span className="font-medium tabular-nums text-[var(--text)]">
          {low} — {high}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <div className="relative h-8">
        <input
          type="range"
          min={min}
          max={max}
          value={Math.min(low, high)}
          onChange={(e) => {
            const v = Number(e.target.value);
            onLow(Math.min(v, high));
          }}
          className="absolute inset-x-0 top-1/2 z-10 h-2 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--accent)] [&::-webkit-slider-thumb]:bg-white"
          aria-label={`${label}: минимум`}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={Math.max(low, high)}
          onChange={(e) => {
            const v = Number(e.target.value);
            onHigh(Math.max(v, low));
          }}
          className="absolute inset-x-0 top-1/2 z-20 h-2 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--accent)] [&::-webkit-slider-thumb]:bg-white"
          aria-label={`${label}: максимум`}
        />
        <div
          className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--border)]"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function ProjectsConstructorSection({ projects }: { projects: HouseProjectItem[] }) {
  const router = useRouter();
  const bounds = useMemo(() => getPublishedProjectBounds(projects), [projects]);

  const [areaMin, setAreaMin] = useState(bounds.minArea);
  const [areaMax, setAreaMax] = useState(bounds.maxArea);
  const [priceMinMln, setPriceMinMln] = useState(Math.floor(bounds.minPriceRub / 1_000_000));
  const [priceMaxMln, setPriceMaxMln] = useState(Math.ceil(bounds.maxPriceRub / 1_000_000));
  const [material, setMaterial] = useState<MaterialFilterId>("all");
  const [floors, setFloors] = useState<FloorsFilterId>("all");
  const [q, setQ] = useState("");

  const priceMinRub = priceMinMln * 1_000_000;
  const priceMaxRub = priceMaxMln * 1_000_000;

  function applyAndGo() {
    const qs = buildProjectsSearchParams({
      areaMin,
      areaMax,
      priceMinRub,
      priceMaxRub,
      material,
      floors,
      q,
    });
    router.push(`/projects?${qs}`);
  }

  function clearFilters() {
    setAreaMin(bounds.minArea);
    setAreaMax(bounds.maxArea);
    setPriceMinMln(Math.floor(bounds.minPriceRub / 1_000_000));
    setPriceMaxMln(Math.ceil(bounds.maxPriceRub / 1_000_000));
    setMaterial("all");
    setFloors("all");
    setQ("");
  }

  return (
    <section
      id="projects-constructor"
      className="relative overflow-hidden border-b py-12 sm:py-16 md:py-20"
      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border)" }}
    >
      <div className="container mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            #ПРОЕКТЫ
          </p>
          <h2
            className="mt-3 max-w-4xl font-heading text-3xl leading-tight text-[#1e3a5f] sm:text-4xl md:text-5xl md:text-[var(--text)]"
          >
            Построим Ваш идеальный дом
          </h2>
          <p className="mt-3 max-w-2xl text-base text-[var(--text-muted)] md:text-lg">
            с учётом всех пожеланий
          </p>
        </div>

        <div
          className="rounded-2xl border p-5 shadow-sm md:p-7 lg:p-8"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "rgba(148, 163, 184, 0.12)",
          }}
        >
          <div className="mb-6 inline-block rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Поиск проекта
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(260px,320px)] lg:items-start lg:gap-10">
            <div className="grid gap-6 md:grid-cols-2">
              <DualRange
                label="Площадь, м²"
                min={bounds.minArea}
                max={bounds.maxArea}
                low={areaMin}
                high={areaMax}
                unit=""
                onLow={setAreaMin}
                onHigh={setAreaMax}
              />
              <DualRange
                label="Цена, млн ₽"
                min={Math.floor(bounds.minPriceRub / 1_000_000)}
                max={Math.ceil(bounds.maxPriceRub / 1_000_000)}
                low={priceMinMln}
                high={priceMaxMln}
                unit=""
                onLow={setPriceMinMln}
                onHigh={setPriceMaxMln}
              />
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-snug text-[var(--text-muted)]">
                Уже знаете, что хотите, и ищете конкретный проект? Введите название.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyAndGo()}
                    placeholder="Название проекта"
                    className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] pl-10 pr-3 text-sm text-[var(--text)] outline-none ring-[var(--accent)] focus-visible:ring-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyAndGo}
                  className="h-11 shrink-0 rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Поиск
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Материал
              </span>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value as MaterialFilterId)}
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                {MATERIAL_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Этажность
              </span>
              <select
                value={floors}
                onChange={(e) => setFloors(e.target.value as FloorsFilterId)}
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                {FLOORS_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-2 lg:justify-end">
              <button
                type="button"
                onClick={applyAndGo}
                className="h-11 min-w-[200px] rounded-xl bg-[var(--accent)] px-8 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Смотреть проекты
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-11 items-center gap-2 text-sm font-medium text-[var(--text-muted)] underline-offset-4 hover:text-[var(--text)] hover:underline"
              >
                <X className="h-4 w-4" aria-hidden />
                Очистить фильтр
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {MATERIAL_CARDS.map((card) => (
            <div
              key={card.id}
              className="overflow-hidden rounded-2xl border bg-[var(--bg)] shadow-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <Link href={`/projects?material=${card.id}`} className="relative block aspect-[4/3]">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </Link>
              <div className="space-y-4 p-5">
                <h3 className="font-heading text-lg font-semibold text-[var(--text)]">{card.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{card.pricePerM2}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/projects?material=${card.id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Проекты домов
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-[var(--accent)] bg-transparent px-4 py-2.5 text-center text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/10"
                  >
                    Комплектация
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
