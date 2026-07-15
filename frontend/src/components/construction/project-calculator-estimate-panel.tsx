"use client";

import { ChevronDown } from "lucide-react";
import { formatRub } from "@/lib/construction-data";
import { partOfSoulRoofLabels, type PartOfSoulRoofPitch } from "@/lib/part-of-soul-pricing";
import {
  normalizeTransportBands,
  transportBandIndex,
} from "@/lib/project-transport-surcharge";
import type { CalculatorTransportBand } from "@/lib/project-calculator-types";
import { TransportDistanceSlider } from "@/components/construction/transport-distance-slider";
import { cn } from "@/lib/utils";

const softBorder = "border border-[var(--border)]";
const softDivide = "border-[var(--border)]";

export type EstimateLine = { id: string; label: string; amountRub: number };

type Props = {
  projectTitle: string;
  areaM2: number;
  roofPitch: PartOfSoulRoofPitch;
  shellPrice: number;
  facadeTotal: number;
  engTotal: number;
  conTotal: number;
  surcharge: number;
  grandTotal: number;
  quoteLoading?: boolean;
  catalogMode: boolean;
  engineeringLines: EstimateLine[];
  constructionLines: EstimateLine[];
  constructionSummaryOpen: boolean;
  onConstructionSummaryToggle: () => void;
  transportBands: CalculatorTransportBand[];
  transportId: string;
  onTransportIdChange: (id: string) => void;
  onRequestEstimate: () => void;
  /** Компактнее в боковом drawer на мобилке */
  compact?: boolean;
};

export function ProjectCalculatorEstimatePanel({
  projectTitle,
  areaM2,
  roofPitch,
  shellPrice,
  facadeTotal,
  engTotal,
  conTotal,
  surcharge,
  grandTotal,
  quoteLoading,
  catalogMode,
  engineeringLines,
  constructionLines,
  constructionSummaryOpen,
  onConstructionSummaryToggle,
  transportBands,
  transportId,
  onTransportIdChange,
  onRequestEstimate,
  compact = false,
}: Props) {
  const bands = normalizeTransportBands(transportBands);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[28px] bg-[var(--bg)] shadow-[0_20px_50px_rgb(0_0_0/0.08)]",
        softBorder,
        compact && "rounded-none border-0 bg-transparent shadow-none",
      )}
    >
      <div className={cn(compact ? "pb-4" : "p-6 border-b", !compact && softDivide)}>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Проект</p>
        <h3 className={cn("mt-1 font-heading text-[var(--graphite)]", compact ? "text-lg" : "text-xl")}>
          {projectTitle}
        </h3>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-[color-mix(in_srgb,var(--bg-secondary)_80%,var(--bg))] px-3 py-2.5">
            <dt className="text-[var(--text-muted)]">Площадь</dt>
            <dd className="mt-0.5 font-bold tabular-nums text-[var(--text)]">{areaM2} м²</dd>
          </div>
          <div className="rounded-xl bg-[color-mix(in_srgb,var(--bg-secondary)_80%,var(--bg))] px-3 py-2.5">
            <dt className="text-[var(--text-muted)]">Кровля</dt>
            <dd className="mt-0.5 font-semibold leading-snug text-[var(--text)]">
              {partOfSoulRoofLabels(roofPitch)}
            </dd>
          </div>
        </dl>
      </div>

      <div className={cn(compact ? "pb-4" : "px-6 py-5")}>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Смета ориентир</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex justify-between gap-3">
            <span className="text-[var(--text-muted)]">Коробка</span>
            <span className="shrink-0 tabular-nums font-semibold text-[var(--text)]">
              {quoteLoading && catalogMode ? "…" : formatRub(shellPrice)}
            </span>
          </li>
          {catalogMode && facadeTotal > 0 ? (
            <li className="flex justify-between gap-3">
              <span className="text-[var(--text-muted)]">Фасад</span>
              <span className="shrink-0 tabular-nums font-semibold text-[var(--text)]">{formatRub(facadeTotal)}</span>
            </li>
          ) : null}
          {catalogMode && engTotal > 0 ? (
            <li className={cn("border-t pt-2", softDivide)}>
              <p className="mb-2 text-xs font-semibold text-[var(--text)]">Инженерия</p>
              <ul className="space-y-1.5">
                {engineeringLines.map((row) => (
                  <li key={row.id} className="flex justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-[var(--text-muted)]">{row.label}</span>
                    <span className="tabular-nums font-medium text-[var(--text)]">{formatRub(row.amountRub)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ) : null}
          {catalogMode && conTotal > 0 ? (
            <li className={cn("border-t pt-2", softDivide)}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-left text-xs font-semibold text-[var(--text)] transition",
                  "hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]",
                )}
                onClick={onConstructionSummaryToggle}
                aria-expanded={constructionSummaryOpen}
              >
                <span className="min-w-0">
                  <span>
                    Доп. опции
                    <span className="ml-1 font-medium text-[var(--text-muted)]">({constructionLines.length})</span>
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium tabular-nums text-[var(--text-muted)]">
                    {formatRub(conTotal)}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform",
                    constructionSummaryOpen && "rotate-180",
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
              {constructionSummaryOpen ? (
                <ul className="mt-2 space-y-1.5">
                  {constructionLines.map((row) => (
                    <li key={row.id} className="flex justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate text-[var(--text-muted)]">{row.label}</span>
                      <span className="tabular-nums font-medium text-[var(--text)]">{formatRub(row.amountRub)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ) : catalogMode ? (
            <li className={cn("border-t pt-2", softDivide)}>
              <p className="text-xs text-[var(--text-muted)]">Доп. опции не выбраны</p>
            </li>
          ) : null}
          <li className={cn("border-t pt-3", softDivide)}>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Расстояние до объекта
            </p>
            <TransportDistanceSlider
              bands={bands}
              valueIndex={transportBandIndex(bands, transportId)}
              onChangeIndex={(index) => {
                const band = bands[index];
                if (band) onTransportIdChange(band.id);
              }}
            />
            <div className="mt-3 flex justify-between gap-3 text-sm">
              <span className="text-[var(--text-muted)]">Транспортные расходы</span>
              <span className="tabular-nums font-semibold text-[var(--text)]">{formatRub(surcharge)}</span>
            </div>
          </li>
        </ul>
      </div>

      <div className={cn(compact ? "pt-1" : "border-t px-6 pb-6 pt-5", !compact && softDivide)}>
        <div className="rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_75%,#1a5c45)] p-5 text-[var(--accent-contrast)] shadow-[0_12px_36px_rgb(var(--accent-rgb)/0.35)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">Ориентир итого</p>
          <p className="mt-2 font-heading text-3xl font-bold tabular-nums tracking-tight md:text-[2rem]">
            {quoteLoading && catalogMode ? "…" : formatRub(grandTotal)}
          </p>
          <p className="mt-2 text-[11px] leading-snug text-white/75">
            {formatRub(shellPrice)} коробка
            {catalogMode ? ` + ${formatRub(facadeTotal + engTotal + conTotal)} опции` : ""}
            {` + ${formatRub(surcharge)} транспортные расходы`}
          </p>
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-2xl bg-[var(--graphite)] py-4 text-sm font-bold text-[var(--bg)] transition hover:opacity-90 dark:bg-[var(--accent-contrast)] dark:text-[var(--graphite)]"
          onClick={onRequestEstimate}
        >
          Получить детальную смету
        </button>
        <p className="mt-3 text-center text-[11px] leading-snug text-[var(--text-muted)]">
          Точная стоимость — после замера участка и согласования комплектации.
        </p>
      </div>
    </div>
  );
}
