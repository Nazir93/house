"use client";

import { useMemo, useState } from "react";
import { formatRub } from "@/lib/construction-data";
import type { PublicCalculatorCatalog } from "@/lib/calculator-catalog";
import { cn } from "@/lib/utils";
import { CmsImage } from "@/components/ui/cms-image";

const softBorder = "border border-[color-mix(in_srgb,var(--text)_7%,transparent)]";

const CONSTRUCTION_OPTION_HINTS: Record<string, string> = {
  roof_folding: "Нельзя выбрать одновременно с мягкой кровлей.",
  roof_soft: "Нельзя выбрать одновременно с фальцевой кровлей.",
  roof_insulation_200: "Нельзя выбрать одновременно с утеплением 250 мм.",
  roof_insulation_250: "Нельзя выбрать одновременно с утеплением 200 мм.",
};

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
              description={o.description}
              imageUrl={o.imageUrl}
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
              description={o.description}
              imageUrl={o.imageUrl}
              checked={constructionSlugs.has(o.slug)}
              disabled={!o.allowed}
              disabledHint="Недоступно"
              hint={CONSTRUCTION_OPTION_HINTS[o.slug]}
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
  description,
  imageUrl,
  checked,
  disabled,
  disabledHint,
  hint,
  amount,
  loading,
  onToggle,
}: {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  checked: boolean;
  disabled?: boolean;
  disabledHint?: string;
  hint?: string;
  amount?: number;
  loading?: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasFootnote = Boolean(description?.trim() || imageUrl?.trim());

  return (
    <li
      className={cn(
        "rounded-xl border px-4 py-3",
        disabled && "opacity-50",
        checked && !disabled && "border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--accent)_6%,var(--bg))]"
      )}
      title={disabled ? disabledHint : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className={cn("flex min-w-0 flex-1 items-center gap-3", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-[var(--accent)]"
            checked={checked}
            disabled={disabled}
            onChange={onToggle}
          />
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-sm text-[var(--text)]">
              {name}
              {hasFootnote ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen((v) => !v);
                  }}
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[11px] font-bold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  aria-label={`Подробнее: ${name}`}
                  aria-expanded={open}
                >
                  i
                </button>
              ) : null}
            </span>
            {hint ? <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">{hint}</span> : null}
          </span>
        </label>
        {checked && amount != null ? (
          <span className="text-sm font-bold tabular-nums text-[var(--text)]">{loading ? "…" : formatRub(amount)}</span>
        ) : null}
      </div>
      {open && hasFootnote ? (
        <div className="mt-3 grid gap-3 rounded-xl bg-[var(--bg-secondary)] p-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
          {description?.trim() ? (
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">{description}</p>
          ) : null}
          {imageUrl?.trim() ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--stone)]">
              <CmsImage src={imageUrl} alt={name} fill className="object-cover" sizes="144px" />
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
