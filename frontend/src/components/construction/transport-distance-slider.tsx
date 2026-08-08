"use client";

import type { CalculatorTransportBand } from "@/lib/project-calculator-types";
import { cn } from "@/lib/utils";

type Props = {
  bands: CalculatorTransportBand[];
  valueIndex: number;
  onChangeIndex: (index: number) => void;
  className?: string;
  compact?: boolean;
};

export function TransportDistanceSlider({
  bands,
  valueIndex,
  onChangeIndex,
  className,
  compact = false,
}: Props) {
  const max = Math.max(0, bands.length - 1);
  const safeIndex = Math.min(Math.max(0, valueIndex), max);
  const band = bands[safeIndex];

  return (
    <div className={cn(compact ? "space-y-1.5" : "space-y-3", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p
          className={cn(
            "font-medium leading-snug text-[var(--text)]",
            compact ? "text-[11px]" : "text-sm",
          )}
        >
          {band?.label ?? "—"}
        </p>
        {band?.id === "unk" ? (
          <span
            className={cn(
              "shrink-0 font-medium uppercase tracking-wide text-[var(--text-muted)]",
              compact ? "text-[9px]" : "text-[10px]",
            )}
          >
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
        className={cn(
          "w-full cursor-pointer appearance-none rounded-full bg-[color-mix(in_srgb,var(--text)_8%,var(--bg))] accent-[var(--accent)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgb(var(--accent-rgb)/0.45)]",
          compact
            ? "h-1.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5"
            : "h-2 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5",
        )}
        aria-label="Расстояние до объекта"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={safeIndex}
        aria-valuetext={band?.label}
      />

      <div
        className={cn(
          "flex justify-between gap-1 leading-tight text-[var(--text-muted)]",
          compact ? "text-[8px]" : "text-[9px] sm:text-[10px]",
        )}
      >
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
            <span className={cn(compact ? "inline" : "hidden sm:inline")}> км</span>
          </button>
        ))}
      </div>
    </div>
  );
}
