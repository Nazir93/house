"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { formatRub } from "@/lib/construction-data";
import type { PublicCalculatorCatalog } from "@/lib/calculator-catalog";
import { isCalculatorOptionDiagramUrl } from "@/lib/project-calculator-option-images";
import { cn } from "@/lib/utils";
import { CmsImage } from "@/components/ui/cms-image";

const softBorder = "border border-[var(--border)]";

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
  const [facadeOpen, setFacadeOpen] = useState(true);
  const [engineeringOpen, setEngineeringOpen] = useState(true);
  const [constructionOpen, setConstructionOpen] = useState(true);
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
      <OptionSection title="Отделка фасада" open={facadeOpen} onToggle={() => setFacadeOpen((value) => !value)}>
        <div className="grid gap-2 sm:grid-cols-2">
          {catalog.facades.map((f) => {
            const active = facadeSlug === f.slug;
            return (
              <label
                key={f.slug}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors",
                  active
                    ? "bg-[color-mix(in_srgb,var(--accent)_10%,var(--bg))] text-[var(--accent)]"
                    : "bg-[color-mix(in_srgb,var(--bg-secondary)_72%,var(--bg))] hover:bg-[color-mix(in_srgb,var(--accent)_6%,var(--bg))]"
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
              "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors",
              !facadeSlug
                ? "bg-[color-mix(in_srgb,var(--accent)_10%,var(--bg))] text-[var(--accent)]"
                : "bg-[color-mix(in_srgb,var(--bg-secondary)_72%,var(--bg))]"
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
      </OptionSection>

      <OptionSection
        title="Инженерные коммуникации"
        open={engineeringOpen}
        onToggle={() => setEngineeringOpen((value) => !value)}
      >
        <ul className="space-y-2">
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
      </OptionSection>

      <OptionSection
        title="Дополнительные строительные опции"
        open={constructionOpen}
        onToggle={() => setConstructionOpen((value) => !value)}
      >
        <ul className="space-y-2">
          {catalog.construction.map((o) => (
            <OptionRow
              key={o.slug}
              name={o.name}
              description={o.description}
              imageUrl={o.imageUrl}
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
      </OptionSection>
    </div>
  );
}

function OptionSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl bg-[var(--bg)] p-5 md:p-6", softBorder)}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={onToggle}
        aria-expanded={open}
      >
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {title}
        </h3>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform", open && "rotate-180")}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {open ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

function OptionRow({
  name,
  description,
  imageUrl,
  checked,
  disabled,
  disabledHint,
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
  amount?: number;
  loading?: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasFootnote = Boolean(description?.trim() || imageUrl?.trim());

  return (
    <li
      className={cn(
        "rounded-xl bg-[color-mix(in_srgb,var(--bg-secondary)_72%,var(--bg))] px-4 py-3 transition-colors",
        disabled && "opacity-50",
        checked && !disabled && "bg-[color-mix(in_srgb,var(--accent)_9%,var(--bg))]"
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
            </span>
          </span>
        </label>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {checked && amount != null ? (
            <span className="text-sm font-bold tabular-nums text-[var(--text)]">{loading ? "…" : formatRub(amount)}</span>
          ) : null}
          {hasFootnote ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--text)_5%,transparent)] text-[var(--text-muted)] transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[var(--accent)]"
              aria-label={`Подробнее: ${name}`}
              aria-expanded={open}
            >
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
                strokeWidth={2}
                aria-hidden
              />
            </button>
          ) : null}
        </div>
      </div>
      {open && hasFootnote ? (
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-3 sm:p-4">
          <div
            className={cn(
              "grid items-start gap-3 sm:gap-4",
              imageUrl?.trim()
                ? "grid-cols-[minmax(84px,104px)_minmax(0,1fr)] sm:grid-cols-[minmax(120px,148px)_minmax(0,1fr)]"
                : "grid-cols-1",
            )}
          >
            {imageUrl?.trim() ? (
              <div
                className={cn(
                  "relative overflow-hidden rounded-lg border border-[var(--border)]",
                  isCalculatorOptionDiagramUrl(imageUrl)
                    ? "aspect-square bg-[var(--bg)] p-1.5 sm:p-2"
                    : "aspect-[4/3] bg-[var(--stone)]",
                )}
              >
                <CmsImage
                  src={imageUrl}
                  alt={name}
                  fill
                  className={cn(
                    isCalculatorOptionDiagramUrl(imageUrl)
                      ? "object-contain object-center"
                      : "object-cover object-center",
                  )}
                  sizes="(max-width: 640px) 104px, 148px"
                />
                <button
                  type="button"
                  onClick={() => window.open(imageUrl, "_blank")}
                  className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                  aria-label={`Открыть схему: ${name}`}
                />
              </div>
            ) : null}
            {description?.trim() ? (
              <div className="min-w-0 self-center sm:self-start">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:text-[11px]">
                  Состав работ
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--text-muted)] sm:mt-2 sm:text-xs">
                  {description}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}
