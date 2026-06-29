"use client";

import Link from "next/link";
import { Home, MapPin, X } from "lucide-react";
import type { BuiltObjectItem } from "@/lib/construction-shared";
import { getBuiltObjectCover, builtObjectMaterialLabel } from "@/lib/construction-shared";
import {
  formatImplementationDays,
  resolveBuiltObjectArea,
  resolveBuiltObjectBathrooms,
  resolveBuiltObjectRooms,
} from "@/lib/built-object-detail";
import { CmsImage } from "@/components/ui/cms-image";
import { cn } from "@/lib/utils";

function fmtCount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${Math.round(n)} шт.`;
}

function fmtFloors(f: number | null | undefined): string {
  if (f == null || !Number.isFinite(f) || f <= 0) return "—";
  if (Math.abs(f - 1.5) < 0.06) return "1,5 эт.";
  if (Math.abs(f - Math.round(f)) < 0.06) return `${Math.round(f)} эт.`;
  return `${String(f).replace(".", ",")} эт.`;
}

type Props = {
  object: BuiltObjectItem;
  onClose: () => void;
};

export function PortfolioObjectMapDrawer({ object, onClose }: Props) {
  const cover = getBuiltObjectCover(object);
  const isConstruction = object.siteStatus === "UNDER_CONSTRUCTION";
  const area = resolveBuiltObjectArea(object);
  const rooms = resolveBuiltObjectRooms(object);
  const bathrooms = resolveBuiltObjectBathrooms(object);
  const buildTermLabel = formatImplementationDays(object.buildTerm) ?? object.buildTerm?.trim() ?? null;

  return (
    <>
      <button
        type="button"
        aria-label="Закрыть карточку объекта"
        className="fixed inset-0 z-[8000] bg-black/35 backdrop-blur-[1px] md:bg-black/25"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed z-[8010] flex max-h-[92vh] w-full flex-col overflow-hidden border-[var(--border)] bg-[var(--bg)] shadow-2xl",
          "bottom-0 left-0 right-0 rounded-t-3xl border-t md:bottom-auto md:left-auto md:right-0 md:top-20 md:max-h-[calc(100vh-5rem)] md:w-[min(100vw,420px)] md:rounded-none md:rounded-l-2xl md:border-b-0 md:border-l md:border-r-0 md:border-t-0"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-drawer-title"
      >
        {buildTermLabel ? (
          <div className="shrink-0 bg-[var(--accent)] px-4 py-2.5 text-center text-[12px] font-semibold text-white sm:text-sm">
            Срок работ: {buildTermLabel}
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              <Home size={14} className="shrink-0 text-[var(--accent)]" aria-hidden />
              {isConstruction ? "Стройплощадка" : "Объект"}
            </p>
            <h2 id="map-drawer-title" className="mt-1 font-heading text-lg font-bold leading-snug text-[var(--text)]">
              {object.title}
            </h2>
            {object.location ? (
              <p className="mt-1 flex items-start gap-1 text-xs text-[var(--text-muted)]">
                <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden />
                <span>{object.location}</span>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4">
          {cover ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[var(--stone)] ring-1 ring-[var(--border)]">
              <CmsImage
                src={cover.url}
                alt={cover.alt || object.title}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 400px"
              />
            </div>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-[var(--stone)] text-xs text-[var(--text-muted)]">
              Нет фото
            </div>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-2.5 text-sm sm:gap-3">
            <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Площадь</dt>
              <dd className="mt-0.5 font-semibold text-[var(--text)]">{area != null ? `${area} м²` : "—"}</dd>
            </div>
            <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Этажность</dt>
              <dd className="mt-0.5 font-semibold text-[var(--text)]">{fmtFloors(object.floors)}</dd>
            </div>
            <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Спальни</dt>
              <dd className="mt-0.5 font-semibold text-[var(--text)]">{fmtCount(rooms)}</dd>
            </div>
            <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Санузлы</dt>
              <dd className="mt-0.5 font-semibold text-[var(--text)]">{fmtCount(bathrooms)}</dd>
            </div>
          </dl>

          <p className="mt-3 text-xs text-[var(--text-muted)]">{builtObjectMaterialLabel(object.material)}</p>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={`/portfolio/${object.slug}`}
              className="flex w-full items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-95"
              onClick={onClose}
            >
              Открыть карточку
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
