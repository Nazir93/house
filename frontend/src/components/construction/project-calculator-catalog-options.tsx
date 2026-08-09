"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { formatRub } from "@/lib/construction-data";
import type { PublicCalculatorCatalog } from "@/lib/calculator-catalog";
import { isCalculatorOptionDiagramUrl } from "@/lib/project-calculator-option-images";
import { cn } from "@/lib/utils";
import { CmsImage } from "@/components/ui/cms-image";

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

  useEffect(() => {
    const urls = [
      ...catalog.engineering.map((o) => o.imageUrl),
      ...catalog.construction.map((o) => o.imageUrl),
      ...catalog.facades.map((f) => f.imageUrl),
    ].filter((url): url is string => Boolean(url?.trim()));

    for (const url of urls) {
      const img = new window.Image();
      img.decoding = "async";
      img.src = url;
    }
  }, [catalog]);

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
        <div className="grid gap-0.5 sm:grid-cols-2">
          {catalog.facades.map((f) => {
            const active = facadeSlug === f.slug;
            return (
              <label
                key={f.slug}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  active
                    ? "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]"
                    : "hover:bg-[color-mix(in_srgb,var(--text)_4%,transparent)]",
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
              "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              !facadeSlug
                ? "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]"
                : "hover:bg-[color-mix(in_srgb,var(--text)_4%,transparent)]",
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
        {(() => {
          const selected = catalog.facades.find((f) => f.slug === facadeSlug);
          const description = selected?.description?.trim();
          const imageUrl = selected?.imageUrl?.trim();
          if (!description && !imageUrl) return null;
          return (
            <OptionWorkScope
              name={selected?.name ?? "Фасад"}
              description={description}
              imageUrl={imageUrl}
            />
          );
        })()}
      </OptionSection>

      <OptionSection
        title="Инженерные коммуникации"
        open={engineeringOpen}
        onToggle={() => setEngineeringOpen((value) => !value)}
      >
        <ul className="divide-y divide-[color-mix(in_srgb,var(--text)_7%,transparent)]">
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
        <ul className="divide-y divide-[color-mix(in_srgb,var(--text)_7%,transparent)]">
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
    <section className="rounded-[1.5rem] bg-[color-mix(in_srgb,var(--bg-secondary)_55%,var(--bg))] px-4 py-4 shadow-[0_12px_36px_rgba(15,61,46,0.05)] md:px-5 md:py-5">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left"
        onClick={onToggle}
        aria-expanded={open}
      >
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
          {title}
        </h3>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform", open && "rotate-180")}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {open ? <div className="mt-3">{children}</div> : null}
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
        "px-1 py-2.5 transition-colors first:pt-1 last:pb-1",
        disabled && "opacity-50",
        checked && !disabled && "rounded-lg bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] px-2",
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[var(--accent)]"
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
        <OptionWorkScope name={name} description={description} imageUrl={imageUrl} zoomable={!isCalculatorOptionDiagramUrl(imageUrl)} />
      ) : null}
    </li>
  );
}

function OptionWorkScope({
  name,
  description,
  imageUrl,
  zoomable = false,
}: {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  zoomable?: boolean;
}) {
  const src = imageUrl?.trim() || "";
  const text = description?.trim() || "";
  const isDiagram = isCalculatorOptionDiagramUrl(src);

  return (
    <div className="mt-3 rounded-xl bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] p-3 sm:p-4">
      <div
        className={cn(
          "grid gap-2.5 sm:items-start sm:gap-4",
          src ? "grid-cols-1 sm:grid-cols-[minmax(120px,160px)_minmax(0,1fr)]" : "grid-cols-1",
        )}
      >
        {src ? (
          <div
            className={cn(
              "relative mx-auto w-full overflow-hidden rounded-lg sm:mx-0",
              isDiagram
                ? "aspect-[4/3] max-w-[280px] bg-transparent sm:aspect-square sm:max-w-none"
                : "aspect-[4/3] max-w-[280px] bg-[var(--stone)] sm:max-w-none",
            )}
          >
            <CmsImage
              src={src}
              alt={name}
              fill
              unoptimized={isDiagram}
              className={cn(isDiagram ? "object-contain object-center" : "object-cover object-center")}
              sizes="(max-width: 640px) 280px, 160px"
            />
            {zoomable && !isDiagram ? (
              <button
                type="button"
                onClick={() => window.open(src, "_blank")}
                className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                aria-label={`Открыть схему: ${name}`}
              />
            ) : null}
          </div>
        ) : null}
        {text ? (
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:text-[11px]">
              Состав работ
            </p>
            <p className="mt-1.5 whitespace-pre-line text-[11px] leading-[1.45] text-[var(--text-muted)] sm:mt-2 sm:text-xs sm:leading-relaxed">
              {text}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
