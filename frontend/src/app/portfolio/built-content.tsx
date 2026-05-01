"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { LayoutGrid, MapPinned } from "lucide-react";
import { PortfolioExcursionFab } from "@/components/portfolio/portfolio-excursion-fab";
import { builtObjectMaterialLabel, getBuiltObjectCover, type BuiltObjectItem } from "@/lib/construction-shared";

const PortfolioBuiltMap = dynamic(
  () => import("@/components/portfolio/portfolio-built-map").then((m) => m.PortfolioBuiltMap),
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

function regionBucket(o: BuiltObjectItem): "lo" | "mo" | "other" {
  const l = (o.location || "").toLowerCase();
  if (/моск|подмоск|м\. о\.|московск/.test(l)) return "mo";
  if (/ленинград|санкт|спб|петербург|псков|карел/.test(l)) return "lo";
  return "other";
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
  const [view, setView] = useState<ViewMode>(initialView);
  const explorerRef = useRef<HTMLDivElement>(null);

  const materials = useMemo(
    () => ["Все", ...Array.from(new Set(objects.map((o) => o.material)))],
    [objects]
  );

  const filtered = useMemo(() => {
    let list = material === "Все" ? objects : objects.filter((o) => o.material === material);
    if (region === "lo") list = list.filter((o) => regionBucket(o) === "lo");
    if (region === "mo") list = list.filter((o) => regionBucket(o) === "mo");
    return list;
  }, [material, objects, region]);

  function chipLabel(m: string) {
    if (m === "Все") return "Все материалы";
    return builtObjectMaterialLabel(m);
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
            <span className="text-[var(--text)]">Портфолио</span>
          </nav>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Реализованные объекты</p>
              <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-[2.65rem] lg:leading-[1.08]">
                Наши работы
              </h1>
              <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)] sm:text-sm md:text-[15px]">
                Фильтр по материалу и региону. На карте видно географию строительства — от Ленинградской области до Москвы и области.
                Запишитесь на экскурсию по действующим площадкам — круглая кнопка справа внизу.
              </p>
            </div>
          </div>

          <div ref={explorerRef} id="portfolio-explorer" className="mt-8 scroll-mt-24 space-y-6 md:scroll-mt-28">
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Режим просмотра">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors sm:text-sm ${
                    view === "grid" ? "text-white" : ""
                  }`}
                  style={{
                    backgroundColor: view === "grid" ? "var(--accent)" : "rgba(232, 230, 225, 0.95)",
                    color: view === "grid" ? "#fff" : "var(--text)",
                    border: `1px solid ${view === "grid" ? "var(--accent)" : "rgba(43, 47, 45, 0.06)"}`,
                  }}
                >
                  <LayoutGrid size={17} strokeWidth={2} aria-hidden />
                  Сетка
                </button>
                <button
                  type="button"
                  onClick={() => showMapView()}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors sm:text-sm ${
                    view === "map" ? "text-white" : ""
                  }`}
                  style={{
                    backgroundColor: view === "map" ? "var(--accent)" : "rgba(232, 230, 225, 0.95)",
                    color: view === "map" ? "#fff" : "var(--text)",
                    border: `1px solid ${view === "map" ? "var(--accent)" : "rgba(43, 47, 45, 0.06)"}`,
                  }}
                >
                  <MapPinned size={17} strokeWidth={2} aria-hidden />
                  Карта ({mappedCount})
                </button>
              </div>
              <button
                type="button"
                onClick={() => showMapView()}
                className="inline-flex w-fit items-center gap-2 self-start rounded-full border px-5 py-3 text-sm font-semibold transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:self-center"
                style={{ borderColor: "var(--border)", backgroundColor: "rgba(237, 235, 229, 0.65)" }}
              >
                <MapPinned size={18} strokeWidth={2} className="text-[var(--accent)]" aria-hidden />
                Объекты на карте
              </button>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Материал стен">
              {materials.map((item) => {
                const on = material === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMaterial(item)}
                    className="rounded-full px-4 py-2 text-[13px] font-medium transition-colors sm:text-sm"
                    style={{
                      backgroundColor: on ? "var(--accent)" : "rgba(232, 230, 225, 0.95)",
                      color: on ? "#fff" : "var(--text)",
                      border: `1px solid ${on ? "var(--accent)" : "rgba(43, 47, 45, 0.06)"}`,
                      boxShadow: on ? "none" : "0 1px 0 rgba(255,255,255,0.9) inset",
                    }}
                  >
                    {chipLabel(item)}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Регион">
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
                    className="rounded-full px-4 py-2 text-[13px] font-medium transition-colors sm:text-sm"
                    style={{
                      backgroundColor: on ? "rgba(15, 61, 46, 0.14)" : "rgba(232, 230, 225, 0.95)",
                      color: on ? "var(--accent)" : "var(--text)",
                      border: `1px solid ${on ? "var(--accent)" : "rgba(43, 47, 45, 0.06)"}`,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {objects.length === 0 ? (
              <p className="py-16 text-center text-sm text-[var(--text-muted)]">Объекты портфолио пока не добавлены.</p>
            ) : filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-[var(--text-muted)]">Нет объектов с выбранными фильтрами.</p>
            ) : view === "grid" ? (
              <ul className="grid list-none grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-12">
                {filtered.map((object) => {
                  const cover = getBuiltObjectCover(object);
                  return (
                    <li key={object.id}>
                      <Link href={`/portfolio/${object.slug}`} className="group block">
                        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--stone)]">
                          {cover ? (
                            <img
                              src={cover.url}
                              alt={cover.alt || object.title}
                              className="h-full w-full object-cover transition-[filter,transform] duration-500 ease-out grayscale contrast-[0.9] brightness-[1.05] group-hover:scale-[1.02] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100"
                              loading="lazy"
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
            ) : (
              <div id="portfolio-map" className="scroll-mt-24 md:scroll-mt-28">
                <PortfolioBuiltMap objects={filtered} />
                <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)] md:text-sm">
                  Масштаб компании виден по географии точек. Нажмите на маркер — откроется карточка объекта.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
