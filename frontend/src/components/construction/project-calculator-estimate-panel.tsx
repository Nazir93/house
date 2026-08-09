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

const softDivide = "border-[color-mix(in_srgb,var(--text)_8%,transparent)]";

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
  /** Компактнее в боковом drawer — меньше шрифт и отступы, чтобы смета помещалась без скролла. */
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
  const lineText = compact ? "text-[11px] leading-snug" : "text-xs";
  const sectionGap = compact ? "space-y-1" : "space-y-1.5";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.75rem] bg-[color-mix(in_srgb,var(--bg-secondary)_45%,var(--bg))] shadow-[0_20px_50px_rgb(0_0_0/0.08)]",
        compact && "rounded-none bg-transparent shadow-none",
      )}
    >
      <div className={cn(compact ? "pb-2" : "border-b p-6", !compact && softDivide)}>
        <p
          className={cn(
            "font-bold uppercase text-[var(--text-muted)]",
            compact ? "text-[9px] tracking-[0.12em]" : "text-[11px] tracking-[0.14em]",
          )}
        >
          Проект
        </p>
        <h3
          className={cn(
            "mt-0.5 font-heading leading-tight text-[var(--graphite)]",
            compact ? "text-base" : "mt-1 text-xl",
          )}
        >
          {projectTitle}
        </h3>
        <dl className={cn("grid grid-cols-2", compact ? "mt-2 gap-1.5 text-[10px]" : "mt-4 gap-3 text-xs")}>
          <div
            className={cn(
              "rounded-lg bg-[color-mix(in_srgb,var(--bg-secondary)_80%,var(--bg))]",
              compact ? "px-2 py-1.5" : "rounded-xl px-3 py-2.5",
            )}
          >
            <dt className="text-[var(--text-muted)]">Площадь</dt>
            <dd className={cn("font-bold tabular-nums text-[var(--text)]", compact ? "mt-0" : "mt-0.5")}>
              {areaM2} м²
            </dd>
          </div>
          <div
            className={cn(
              "rounded-lg bg-[color-mix(in_srgb,var(--bg-secondary)_80%,var(--bg))]",
              compact ? "px-2 py-1.5" : "rounded-xl px-3 py-2.5",
            )}
          >
            <dt className="text-[var(--text-muted)]">Кровля</dt>
            <dd className={cn("font-semibold leading-snug text-[var(--text)]", compact ? "mt-0" : "mt-0.5")}>
              {partOfSoulRoofLabels(roofPitch)}
            </dd>
          </div>
        </dl>
      </div>

      <div className={cn(compact ? "pb-2" : "px-6 py-5")}>
        <p
          className={cn(
            "font-bold uppercase text-[var(--text-muted)]",
            compact ? "text-[9px] tracking-[0.12em]" : "text-[11px] tracking-[0.14em]",
          )}
        >
          Смета ориентир
        </p>
        <ul className={cn(compact ? "mt-2 space-y-1.5 text-[11px]" : "mt-4 space-y-3 text-sm")}>
          <li className="flex justify-between gap-2">
            <span className="text-[var(--text-muted)]">Коробка</span>
            <span className="shrink-0 tabular-nums font-semibold text-[var(--text)]">
              {quoteLoading && catalogMode ? "…" : formatRub(shellPrice)}
            </span>
          </li>
          {catalogMode && facadeTotal > 0 ? (
            <li className="flex justify-between gap-2">
              <span className="text-[var(--text-muted)]">Фасад</span>
              <span className="shrink-0 tabular-nums font-semibold text-[var(--text)]">{formatRub(facadeTotal)}</span>
            </li>
          ) : null}
          {catalogMode && engTotal > 0 ? (
            <li className={cn("border-t", softDivide, compact ? "pt-1.5" : "pt-2")}>
              <p className={cn("font-semibold text-[var(--text)]", compact ? "mb-1 text-[11px]" : "mb-2 text-xs")}>
                Инженерия
              </p>
              <ul className={sectionGap}>
                {engineeringLines.map((row) => (
                  <li key={row.id} className={cn("flex justify-between gap-2", lineText)}>
                    <span className="min-w-0 truncate text-[var(--text-muted)]">{row.label}</span>
                    <span className="tabular-nums font-medium text-[var(--text)]">{formatRub(row.amountRub)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ) : null}
          {catalogMode && conTotal > 0 ? (
            <li className={cn("border-t", softDivide, compact ? "pt-1.5" : "pt-2")}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-2 text-left font-semibold text-[var(--text)] transition",
                  "hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]",
                  compact ? "rounded-lg px-1 py-1 text-[11px]" : "rounded-xl px-2 py-2 text-xs",
                )}
                onClick={onConstructionSummaryToggle}
                aria-expanded={constructionSummaryOpen}
              >
                <span className="min-w-0">
                  <span>
                    Доп. опции
                    <span className="ml-1 font-medium text-[var(--text-muted)]">({constructionLines.length})</span>
                  </span>
                  <span
                    className={cn(
                      "block font-medium tabular-nums text-[var(--text-muted)]",
                      compact ? "mt-0 text-[10px]" : "mt-0.5 text-[11px]",
                    )}
                  >
                    {formatRub(conTotal)}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "shrink-0 text-[var(--text-muted)] transition-transform",
                    compact ? "h-3.5 w-3.5" : "h-4 w-4",
                    constructionSummaryOpen && "rotate-180",
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
              {constructionSummaryOpen ? (
                <ul className={cn(sectionGap, compact ? "mt-1" : "mt-2")}>
                  {constructionLines.map((row) => (
                    <li key={row.id} className={cn("flex justify-between gap-2", lineText)}>
                      <span className="min-w-0 truncate text-[var(--text-muted)]">{row.label}</span>
                      <span className="tabular-nums font-medium text-[var(--text)]">{formatRub(row.amountRub)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ) : catalogMode ? (
            <li className={cn("border-t", softDivide, compact ? "pt-1.5" : "pt-2")}>
              <p className={cn("text-[var(--text-muted)]", compact ? "text-[11px]" : "text-xs")}>
                Доп. опции не выбраны
              </p>
            </li>
          ) : null}
          <li className={cn("border-t", softDivide, compact ? "pt-1.5" : "pt-3")}>
            <p
              className={cn(
                "font-bold uppercase text-[var(--text-muted)]",
                compact ? "mb-1.5 text-[9px] tracking-[0.1em]" : "mb-3 text-[11px] tracking-[0.12em]",
              )}
            >
              Расстояние до объекта
            </p>
            <TransportDistanceSlider
              compact={compact}
              bands={bands}
              valueIndex={transportBandIndex(bands, transportId)}
              onChangeIndex={(index) => {
                const band = bands[index];
                if (band) onTransportIdChange(band.id);
              }}
            />
            <div
              className={cn(
                "flex justify-between gap-2",
                compact ? "mt-1.5 text-[11px]" : "mt-3 text-sm",
              )}
            >
              <span className="text-[var(--text-muted)]">Транспортные расходы</span>
              <span className="tabular-nums font-semibold text-[var(--text)]">{formatRub(surcharge)}</span>
            </div>
          </li>
        </ul>
      </div>

      <div className={cn(compact ? "pt-0.5" : "border-t px-6 pb-6 pt-5", !compact && softDivide)}>
        <div
          className={cn(
            "bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_75%,#1a5c45)] text-[var(--accent-contrast)] shadow-[0_12px_36px_rgb(var(--accent-rgb)/0.35)]",
            compact ? "rounded-xl p-3" : "rounded-2xl p-5",
          )}
        >
          <p
            className={cn(
              "font-bold uppercase text-white/80",
              compact ? "text-[9px] tracking-[0.12em]" : "text-[11px] tracking-[0.14em]",
            )}
          >
            Итого
          </p>
          <p
            className={cn(
              "font-heading font-bold tabular-nums tracking-tight",
              compact ? "mt-1 text-xl" : "mt-2 text-3xl md:text-[2rem]",
            )}
          >
            {quoteLoading && catalogMode ? "…" : formatRub(grandTotal)}
          </p>
          <p className={cn("leading-snug text-white/75", compact ? "mt-1 text-[10px]" : "mt-2 text-[11px]")}>
            {formatRub(shellPrice)} коробка
            {catalogMode ? ` + ${formatRub(facadeTotal + engTotal + conTotal)} опции` : ""}
            {` + ${formatRub(surcharge)} транспортные расходы`}
          </p>
        </div>

        <button
          type="button"
          className={cn(
            "w-full font-bold text-[var(--bg)] transition hover:opacity-90 dark:bg-[var(--accent-contrast)] dark:text-[var(--graphite)]",
            compact
              ? "mt-2 rounded-xl bg-[var(--graphite)] py-2.5 text-xs"
              : "mt-4 rounded-2xl bg-[var(--graphite)] py-4 text-sm",
          )}
          onClick={onRequestEstimate}
        >
          Получить детальную смету
        </button>
        <p
          className={cn(
            "text-center leading-snug text-[var(--text-muted)]",
            compact ? "mt-1.5 text-[10px]" : "mt-3 text-[11px]",
          )}
        >
          Точная стоимость — после замера участка и согласования комплектации.
        </p>
      </div>
    </div>
  );
}
