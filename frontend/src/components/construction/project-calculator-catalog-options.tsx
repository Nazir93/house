"use client";

import { useMemo } from "react";
import { formatRub } from "@/lib/construction-data";
import type { PublicCalculatorCatalog } from "@/lib/calculator-catalog";
import { cn } from "@/lib/utils";

const softBorder = "border border-[color-mix(in_srgb,var(--text)_7%,transparent)]";

type Props = {
  catalog: PublicCalculatorCatalog;
  facadeSlug: string | null;
  onFacadeChange: (slug: string | null) => void;
  engineeringSlugs: Set<string>;
  onToggleEngineering: (slug: string) => void;
  constructionSlugs: Set<string>;
  onToggleConstruction: (slug: string) => void;
  lineAmounts: Map<string, number>;
  quoteLoading?: boolean;
};

export function ProjectCalculatorCatalogOptions({
  catalog,
  facadeSlug,
  onFacadeChange,
  engineeringSlugs,
  onToggleEngineering,
  constructionSlugs,
  onToggleConstruction,
  lineAmounts,
  quoteLoading,
}: Props) {
  const facadePrice = facadeSlug ? lineAmounts.get(`facade:${facadeSlug}`) : undefined;

  const engTotal = useMemo(() => {
    let s = 0;
    for (const slug of engineeringSlugs) {
      s += lineAmounts.get(slug) ?? 0;
    }
    return s;
  }, [engineeringSlugs, lineAmounts]);

  const conTotal = useMemo(() => {
    let s = 0;
    for (const slug of constructionSlugs) {
      s += lineAmounts.get(slug) ?? 0;
    }
    return s;
  }, [constructionSlugs, lineAmounts]);

  return (
    <div id="completion-addons" className="scroll-mt-28 space-y-8">
      <section className={cn("rounded-2xl bg-[var(--bg)] p-5 md:p-6", softBorder)}>
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Отделка фасада
        </h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {catalog.facades.map((f) => {
            const active = facadeSlug === f.slug;
            return (
              <label
                key={f.slug}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                  active
                    ? "border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--bg))]"
                    : "border-[color-mix(in_srgb,var(--text)_8%,transparent)] hover:border-[color-mix(in_srgb,var(--accent)_25%,transparent)]"
                )}
              >
                <input
                  type="radio"
                  name="facade"
                  className="h-4 w-4 accent-[var(--accent)]"
                  checked={active}
                  onChange={() => onFacadeChange(f.slug)}
                />
                <span className="min-w-0 flex-1 text-sm font-medium text-[var(--text)]">{f.name}</span>
              </label>
            );
          })}
          <label
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
              !facadeSlug
                ? "border-[color-mix(in_srgb,var(--accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--bg))]"
                : "border-[color-mix(in_srgb,var(--text)_8%,transparent)]"
            )}
          >
            <input
              type="radio"
              name="facade"
              className="h-4 w-4 accent-[var(--accent)]"
              checked={!facadeSlug}
              onChange={() => onFacadeChange(null)}
            />
            <span className="text-sm text-[var(--text-muted)]">Без отделки фасада</span>
          </label>
        </div>
        {facadeSlug && facadePrice != null ? (
          <p className="mt-3 text-sm font-semibold tabular-nums text-[var(--text)]">
            {quoteLoading ? "…" : formatRub(facadePrice)}
          </p>
        ) : null}
      </section>

      <section className={cn("rounded-2xl bg-[var(--bg)] p-5 md:p-6", softBorder)}>
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Инженерные коммуникации
        </h3>
        <ul className="mt-4 space-y-2">
          {catalog.engineering.map((o) => (
            <OptionRow
              key={o.slug}
              name={o.name}
              checked={engineeringSlugs.has(o.slug)}
              disabled={!o.allowed}
              disabledHint="Недоступно"
              amount={lineAmounts.get(o.slug)}
              loading={quoteLoading}
              onToggle={() => onToggleEngineering(o.slug)}
            />
          ))}
        </ul>
        <p className="mt-3 text-xs font-semibold tabular-nums text-[var(--text-muted)]">
          Итого инженерия: {quoteLoading ? "…" : formatRub(engTotal)}
        </p>
      </section>

      <section className={cn("rounded-2xl bg-[var(--bg)] p-5 md:p-6", softBorder)}>
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Дополнительные строительные опции
        </h3>
        <ul className="mt-4 space-y-2">
          {catalog.construction.map((o) => (
            <OptionRow
              key={o.slug}
              name={o.name}
              checked={constructionSlugs.has(o.slug)}
              disabled={!o.allowed}
              disabledHint="Недоступно"
              amount={lineAmounts.get(o.slug)}
              loading={quoteLoading}
              onToggle={() => onToggleConstruction(o.slug)}
            />
          ))}
        </ul>
        <p className="mt-3 text-xs font-semibold tabular-nums text-[var(--text-muted)]">
          Итого опции: {quoteLoading ? "…" : formatRub(conTotal)}
        </p>
      </section>
    </div>
  );
}

function OptionRow({
  name,
  checked,
  disabled,
  disabledHint,
  amount,
  loading,
  onToggle,
}: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  disabledHint?: string;
  amount?: number;
  loading?: boolean;
  onToggle: () => void;
}) {
  return (
    <li
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3",
        disabled && "opacity-50",
        checked && !disabled && "border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--bg))]"
      )}
      title={disabled ? disabledHint : undefined}
    >
      <label className={cn("flex min-w-0 flex-1 items-center gap-3", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
        <input
          type="checkbox"
          className="h-4 w-4 rounded accent-[var(--accent)]"
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
        />
        <span className="text-sm text-[var(--text)]">{name}</span>
      </label>
      {checked && amount != null ? (
        <span className="text-sm font-bold tabular-nums text-[var(--text)]">{loading ? "…" : formatRub(amount)}</span>
      ) : null}
    </li>
  );
}
