"use client";

import type { CalculatorTransportBand } from "@/lib/project-calculator-types";
import { transportBandPercentLabel } from "@/lib/project-transport-surcharge";
import { cn } from "@/lib/utils";

type Props = {
  bands: CalculatorTransportBand[];
  valueIndex: number;
  onChangeIndex: (index: number) => void;
  className?: string;
};

export function TransportDistanceSlider({ bands, valueIndex, onChangeIndex, className }: Props) {
  const max = Math.max(0, bands.length - 1);
  const safeIndex = Math.min(Math.max(0, valueIndex), max);
  const band = bands[safeIndex];
  const percentLabel = transportBandPercentLabel(band);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-[var(--text)]">{band?.label ?? "—"}</p>
        {percentLabel ? (
          <span className="shrink-0 text-xs font-semibold tabular-nums text-[var(--accent)]">{percentLabel}</span>
        ) : band?.id === "unk" ? (
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            в смете
          </span>
        ) : null}
      </div>

      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={safeIndex}
        onChange={(e) => onChangeIndex(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color-mix(in_srgb,var(--text)_8%,var(--bg))] accent-[var(--accent)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgb(var(--accent-rgb)/0.45)]"
        aria-label="Расстояние до объекта"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={safeIndex}
        aria-valuetext={band?.label}
      />

      <div className="flex justify-between gap-1 text-[9px] leading-tight text-[var(--text-muted)] sm:text-[10px]">
        {bands.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onChangeIndex(i)}
            className={cn(
              "max-w-[4.5rem] flex-1 truncate text-center transition hover:text-[var(--text)]",
              i === safeIndex ? "font-semibold text-[var(--accent)]" : "",
            )}
            title={b.label}
          >
            {b.id === "unk" ? "?" : b.id === "100" ? "100" : b.id}
            <span className="hidden sm:inline"> км</span>
          </button>
        ))}
      </div>
    </div>
  );
}
