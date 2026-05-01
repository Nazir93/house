"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight, Bath, Bed, Layers, Maximize2 } from "lucide-react";

import type { HouseProjectItem } from "@/lib/construction-data";
import { formatRub, getProjectRenders } from "@/lib/construction-shared";

const INITIAL_VISIBLE = 3;
const LOAD_MORE = 3;

function pickCover(p: HouseProjectItem): string | null {
  const renders = getProjectRenders(p);
  const first = p.media[0];
  return renders[0]?.url ?? first?.url ?? null;
}

function formatFloorsLabel(n: number): string {
  const s = Number.isInteger(n) ? `${n}` : String(n);
  return `${s} эт.`;
}

function SpecRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Maximize2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className="h-[18px] w-[18px] shrink-0 text-[var(--text-subtle)]" aria-hidden strokeWidth={1.75} />
      <div className="flex min-w-0 flex-1 items-baseline justify-between gap-2 text-sm">
        <span style={{ color: "var(--text-muted)" }}>{label}</span>
        <span className="font-medium tabular-nums" style={{ color: "var(--text)" }}>
          {value}
        </span>
      </div>
    </div>
  );
}

export function FeaturedHouseProjectsSection({ projects }: { projects: HouseProjectItem[] }) {
  const list = useMemo(() => {
    return [...projects]
      .filter((p) => p.published)
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : a.price - b.price));
  }, [projects]);

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  if (list.length === 0) return null;

  const shown = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;

  return (
    <section
      id="catalog-preview"
      className="py-16 sm:py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border)" }}
    >
      <div className="container mx-auto px-5 sm:px-8 md:px-12 lg:px-20 xl:px-28">
        <div className="mb-10 sm:mb-12 md:mb-14 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2
            className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-3xl"
            style={{ color: "var(--text)" }}
          >
            Популярные проекты домов
          </h2>
          <p className="max-w-md text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Вы можете выбрать одно из 500+ готовых решений или заказать индивидуальный проект.
          </p>
        </div>

        <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => {
            const cover = pickCover(p);
            const href = `/projects/${p.slug}`;
            return (
              <article
                key={p.id}
                className="flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
                style={{ borderColor: "var(--border)", backgroundColor: "#fff" }}
              >
                <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-[var(--stone)]">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : null}
                </Link>

                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <h3 className="font-heading text-lg font-bold leading-snug md:text-xl" style={{ color: "var(--text)" }}>
                    <Link href={href} className="transition-colors hover:text-[var(--accent)]">
                      Авторский проект «{p.title}»
                    </Link>
                  </h3>

                  <div
                    className="mt-4 divide-y border-t border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <SpecRow icon={Maximize2} label="Площадь" value={`${p.area} м²`} />
                    <SpecRow icon={Layers} label="Этажность" value={formatFloorsLabel(p.floors)} />
                    <SpecRow icon={Bed} label="Количество спален" value={`${p.rooms} шт.`} />
                    <SpecRow icon={Bath} label="Количество санузлов" value={`${p.bathrooms} шт.`} />
                  </div>

                  <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t pt-5" style={{ borderColor: "var(--border)" }}>
                    <p className="font-heading text-lg font-bold tabular-nums md:text-xl" style={{ color: "var(--text)" }}>
                      от {formatRub(p.price)}
                    </p>
                    <Link
                      href={href}
                      className="inline-flex shrink-0 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {hasMore ? (
          <button
            type="button"
            onClick={() => setVisibleCount((n) => Math.min(n + LOAD_MORE, list.length))}
            className="mx-auto mt-10 flex w-full max-w-md items-center justify-center rounded-xl border px-6 py-4 text-base font-semibold transition-colors hover:bg-[var(--bg-secondary)] sm:mt-12 md:mt-14"
            style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg-secondary)" }}
          >
            Показать ещё
          </button>
        ) : null}

        <Link
          href="/projects"
          className="mt-8 sm:mt-10 flex w-full items-center justify-between rounded-2xl px-5 py-5 font-heading text-lg transition-colors sm:px-8 sm:py-6 md:py-7 sm:text-xl md:text-2xl"
          style={{ border: "1px solid var(--border)", color: "var(--text)" }}
        >
          Весь каталог проектов
          <ArrowRight size={22} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
