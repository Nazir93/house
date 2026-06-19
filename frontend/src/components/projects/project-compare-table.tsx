"use client";

import { Fragment, type ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { CmsImage } from "@/components/ui/cms-image";
import type { HouseProjectItem } from "@/lib/construction-data";
import { formatRub } from "@/lib/construction-data";
import { getProjectPlans, getProjectRenders } from "@/lib/construction-shared";
import {
  PARTNER_HOUSE_PROJECT_CATALOG,
  AUTHOR_HOUSE_PROJECT_CATALOG,
  houseProjectDetailPath,
  type HouseProjectCatalogKind,
} from "@/lib/house-project-catalog";
import type { ProjectCompareEntry } from "@/lib/project-compare";
import {
  formatProjectFloorsLabel,
  formatProjectMaterialsLabel,
} from "@/lib/project-compare";
import {
  type CompareQuoteCell,
  compareColumnKey,
  formatComparePriceDeltaRub,
} from "@/lib/project-compare-unified";
import {
  buildCompareCompletionRows,
  buildCompareHeroTierRows,
  buildCompareScheduleRows,
  formatCompareYesNo,
  maxComparePlanCount,
  projectHasCompletionItem,
  resolveCompareHeroTierPriceRub,
  resolveCompareProductionMonths,
  resolveCompareScheduleTerm,
  resolveCompareWarrantyYears,
} from "@/lib/project-compare-specs";
import { resolveProjectListingPriceRub } from "@/lib/project-listing-price";
import { cn } from "@/lib/utils";

export type CompareColumn = {
  entry: ProjectCompareEntry;
  project: HouseProjectItem;
};

type Props = {
  columns: CompareColumn[];
  slotsLeft: number;
  quotes: Map<string, CompareQuoteCell>;
  quotesLoading: boolean;
  cheapestKey: string | null;
  onRemove: (entry: ProjectCompareEntry) => void;
};

function formatPriceMln(priceRub: number): string {
  const mln = priceRub / 1_000_000;
  return `${mln.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} млн ₽`;
}

function catalogLabel(kind: HouseProjectCatalogKind): string {
  return kind === "partner" ? "Типовой" : "Авторский";
}

function catalogForKind(kind: HouseProjectCatalogKind) {
  return kind === "partner" ? PARTNER_HOUSE_PROJECT_CATALOG : AUTHOR_HOUSE_PROJECT_CATALOG;
}

function CompareGrid({
  columns,
  slotsLeft,
  children,
}: {
  columns: CompareColumn[];
  slotsLeft: number;
  children: ReactNode;
}) {
  return (
    <div
      className="grid min-w-[640px] gap-0"
      style={{
        gridTemplateColumns: `minmax(140px, 180px) repeat(${columns.length + Math.max(slotsLeft, 0)}, minmax(160px, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}

function LabelCell({
  children,
  className,
  sticky = true,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  sticky?: boolean;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        sticky && "sticky left-0 z-[2]",
        "border-b px-3 py-3 text-sm",
        onClick && "flex w-full items-center justify-between text-left",
        className,
      )}
      style={{ borderColor: "var(--border)" }}
    >
      {children}
    </Tag>
  );
}

function DataCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("border-b px-3 py-3 text-sm", className)} style={{ borderColor: "var(--border)" }}>
      {children}
    </div>
  );
}

function EmptySlotCells({ count, keyPrefix }: { count: number; keyPrefix: string }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`${keyPrefix}-${i}`} className="border-b" style={{ borderColor: "var(--border)" }} />
      ))}
    </>
  );
}

function QuoteAmountCell({
  amountRub,
  loading,
  hasCell,
}: {
  amountRub: number;
  loading: boolean;
  hasCell: boolean;
}) {
  if (loading && !hasCell) return <span className="text-[var(--text-muted)]">…</span>;
  if (amountRub <= 0) return <span className="text-[var(--text-muted)]">—</span>;
  return (
    <>
      <p className="tabular-nums font-medium">{formatRub(amountRub)}</p>
    </>
  );
}

export function ProjectCompareTable({
  columns,
  slotsLeft,
  quotes,
  quotesLoading,
  cheapestKey,
  onRemove,
}: Props) {
  const [paramsOpen, setParamsOpen] = useState(true);
  const [pricingOpen, setPricingOpen] = useState(true);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(true);

  const projects = useMemo(() => columns.map((c) => c.project), [columns]);
  const completionRows = useMemo(() => buildCompareCompletionRows(projects), [projects]);
  const scheduleRows = useMemo(() => buildCompareScheduleRows(projects), [projects]);
  const heroTierRows = useMemo(() => buildCompareHeroTierRows(projects), [projects]);
  const planCount = useMemo(() => maxComparePlanCount(projects), [projects]);

  const completionGroups = useMemo(() => {
    const groups: string[] = [];
    for (const row of completionRows) {
      if (!groups.includes(row.groupTitle)) groups.push(row.groupTitle);
    }
    return groups;
  }, [completionRows]);

  return (
    <CompareGrid columns={columns} slotsLeft={slotsLeft}>
      <div className="sticky left-0 z-[2] bg-[var(--bg)]" aria-hidden />

      {columns.map(({ entry, project }) => {
        const cover = getProjectRenders(project)[0];
        const catalog = catalogForKind(entry.catalogKind);
        const price = resolveProjectListingPriceRub(project);
        return (
          <div key={`${entry.catalogKind}:${entry.slug}`} className="border-b px-3 pb-4 pt-2" style={{ borderColor: "var(--border)" }}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--stone)]">
              {cover ? (
                <CmsImage
                  src={cover.url}
                  alt={cover.alt || project.title}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              ) : null}
              <button
                type="button"
                onClick={() => onRemove(entry)}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/70"
                aria-label={`Убрать ${project.title} из сравнения`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
            <span className="mt-2 inline-block rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
              {catalogLabel(entry.catalogKind)}
            </span>
            <Link
              href={houseProjectDetailPath(catalog, project.slug)}
              className="mt-1 block font-heading text-lg leading-tight hover:text-[var(--accent)]"
            >
              {project.title}
            </Link>
            <p className="mt-1 text-base font-bold text-[#0f3d2e] tabular-nums">от {formatPriceMln(price)}</p>
            <p className="text-xs text-[var(--text-subtle)] tabular-nums">каталог · {formatRub(price)}</p>
          </div>
        );
      })}

      {Array.from({ length: slotsLeft }).map((_, index) => (
        <Link
          key={`slot-${index}`}
          href="/projects"
          className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed px-3 py-6 text-center text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          style={{ borderColor: "var(--border)" }}
        >
          <Plus className="mb-2 h-6 w-6 opacity-60" aria-hidden />
          Добавить проект
        </Link>
      ))}

      {/* Стоимость при комплектации */}
      <LabelCell className="bg-[#0f3d2e] font-semibold text-white">При выбранной комплектации</LabelCell>
      {columns.map(({ entry }) => {
        const key = compareColumnKey(entry);
        const cell = quotes.get(key);
        const isCheapest = cheapestKey === key && cell && !cell.error;
        const cheapestTotal = cheapestKey ? quotes.get(cheapestKey)?.grandTotalRub ?? 0 : 0;
        const delta = cell && !cell.error && !isCheapest ? cell.grandTotalRub - cheapestTotal : 0;

        return (
          <DataCell
            key={`quote-${key}`}
            className={isCheapest ? "bg-[color-mix(in_srgb,#0f3d2e_8%,var(--bg))]" : undefined}
          >
            {quotesLoading && !cell ? (
              <span className="text-[var(--text-muted)]">…</span>
            ) : cell?.error ? (
              <span className="text-[var(--text-muted)]" title={cell.error}>—</span>
            ) : cell ? (
              <>
                <p className="text-base font-bold tabular-nums text-[#0f3d2e]">от {formatPriceMln(cell.grandTotalRub)}</p>
                <p className="text-xs tabular-nums text-[var(--text-subtle)]">{formatRub(cell.grandTotalRub)}</p>
                {isCheapest ? (
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#0f3d2e]">Выгоднее</p>
                ) : delta > 0 ? (
                  <p className="mt-1 text-xs text-[var(--text-muted)] tabular-nums">{formatComparePriceDeltaRub(delta)}</p>
                ) : null}
                {cell.fallbackUsed ? (
                  <p className="mt-1 text-[10px] leading-snug text-[var(--text-muted)]">
                    Часть опций недоступна — упрощённый расчёт
                  </p>
                ) : null}
              </>
            ) : (
              <span className="text-[var(--text-muted)]">—</span>
            )}
          </DataCell>
        );
      })}
      <EmptySlotCells count={slotsLeft} keyPrefix="quote-slot" />

      {/* Разбивка цены */}
      <LabelCell
        className="bg-[var(--bg-secondary)] font-semibold"
        onClick={() => setPricingOpen((v) => !v)}
      >
        Разбивка стоимости
        {pricingOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </LabelCell>
      {columns.map(({ entry }) => (
        <div key={`pricing-head-${compareColumnKey(entry)}`} className="border-b" style={{ borderColor: "var(--border)" }} />
      ))}
      <EmptySlotCells count={slotsLeft} keyPrefix="pricing-head-slot" />

      {pricingOpen ? (
        <>
          {(
            [
              { label: "Коробка", pick: (c: CompareQuoteCell) => c.shellTotalRub },
              { label: "Фасад", pick: (c: CompareQuoteCell) => c.facadeTotalRub },
              { label: "Инженерия", pick: (c: CompareQuoteCell) => c.engineeringTotalRub },
              { label: "Отделка", pick: (c: CompareQuoteCell) => c.constructionTotalRub },
              { label: "Транспорт", pick: (c: CompareQuoteCell) => c.transportSurchargeRub },
            ] as const
          ).map(({ label, pick }) => (
            <PriceBreakdownRow
              key={label}
              label={label}
              columns={columns}
              slotsLeft={slotsLeft}
              quotes={quotes}
              quotesLoading={quotesLoading}
              pick={pick}
            />
          ))}

          {heroTierRows.map((tier) => (
            <Fragment key={`tier-${tier.id}`}>
              <LabelCell className="pl-6 text-[var(--text-muted)]">Каталог · {tier.label}</LabelCell>
              {columns.map(({ entry, project }) => {
                const price = resolveCompareHeroTierPriceRub(project, tier.id);
                return (
                  <DataCell key={`tier-${tier.id}-${compareColumnKey(entry)}`} className="py-2 tabular-nums">
                    {price != null ? formatRub(price) : "—"}
                  </DataCell>
                );
              })}
              <EmptySlotCells count={slotsLeft} keyPrefix={`tier-slot-${tier.id}`} />
            </Fragment>
          ))}
        </>
      ) : null}

      {/* Параметры */}
      <LabelCell
        className="bg-[var(--bg-secondary)] font-semibold"
        onClick={() => setParamsOpen((v) => !v)}
      >
        Параметры
        {paramsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </LabelCell>
      {columns.map(({ entry }) => (
        <div key={`params-head-${compareColumnKey(entry)}`} className="border-b" style={{ borderColor: "var(--border)" }} />
      ))}
      <EmptySlotCells count={slotsLeft} keyPrefix="params-head-slot" />

      {paramsOpen ? (
        <>
          <SpecRow label="Этажность" columns={columns} slotsLeft={slotsLeft} render={(p) => formatProjectFloorsLabel(p.floors)} />
          <SpecRow label="Технологии" columns={columns} slotsLeft={slotsLeft} render={(p) => formatProjectMaterialsLabel(p.materials)} />
          <SpecRow label="Площадь" columns={columns} slotsLeft={slotsLeft} render={(p) => `${p.area} м²`} className="tabular-nums" />
          <SpecRow label="Спальни" columns={columns} slotsLeft={slotsLeft} render={(p) => String(p.rooms)} className="tabular-nums" />
          <SpecRow label="Санузлы" columns={columns} slotsLeft={slotsLeft} render={(p) => String(p.bathrooms)} className="tabular-nums" />
          <SpecRow
            label="Гарантия"
            columns={columns}
            slotsLeft={slotsLeft}
            render={(p) => `${resolveCompareWarrantyYears(p)} лет`}
          />
          <SpecRow
            label="Срок строительства"
            columns={columns}
            slotsLeft={slotsLeft}
            render={(p) => `от ${resolveCompareProductionMonths(p)} мес.`}
          />
          <SpecRow
            label="Построенный объект"
            columns={columns}
            slotsLeft={slotsLeft}
            render={(p) =>
              p.builtObjectSlug ? (
                <Link href={`/portfolio/${p.builtObjectSlug}`} className="text-[var(--accent)] hover:underline">
                  Смотреть
                </Link>
              ) : (
                "—"
              )
            }
          />
          <SpecRow
            label="Ипотека"
            columns={columns}
            slotsLeft={slotsLeft}
            render={(p) => formatCompareYesNo(p.mortgageEnabled)}
          />
          <SpecRow
            label="Акция"
            columns={columns}
            slotsLeft={slotsLeft}
            render={(p) => p.pricePromo?.trim() || "—"}
          />
        </>
      ) : null}

      {/* Комплектация */}
      {completionRows.length > 0 ? (
        <>
          <LabelCell
            className="bg-[var(--bg-secondary)] font-semibold"
            onClick={() => setCompletionOpen((v) => !v)}
          >
            Состав комплектации
            {completionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </LabelCell>
          {columns.map(({ entry }) => (
            <div key={`comp-head-${compareColumnKey(entry)}`} className="border-b" style={{ borderColor: "var(--border)" }} />
          ))}
          <EmptySlotCells count={slotsLeft} keyPrefix="comp-head-slot" />

          {completionOpen
            ? completionGroups.map((groupTitle) => (
                <CompletionGroupRows
                  key={groupTitle}
                  groupTitle={groupTitle}
                  rows={completionRows.filter((r) => r.groupTitle === groupTitle)}
                  columns={columns}
                  slotsLeft={slotsLeft}
                />
              ))
            : null}
        </>
      ) : null}

      {/* График */}
      {scheduleRows.length > 0 ? (
        <>
          <LabelCell
            className="bg-[var(--bg-secondary)] font-semibold"
            onClick={() => setScheduleOpen((v) => !v)}
          >
            График строительства
            {scheduleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </LabelCell>
          {columns.map(({ entry }) => (
            <div key={`sched-head-${compareColumnKey(entry)}`} className="border-b" style={{ borderColor: "var(--border)" }} />
          ))}
          <EmptySlotCells count={slotsLeft} keyPrefix="sched-head-slot" />

          {scheduleOpen
            ? scheduleRows.map((row) => (
                <Fragment key={`sched-${row.key}`}>
                  <LabelCell className="pl-6 text-[var(--text-muted)]">{row.title}</LabelCell>
                  {columns.map(({ entry, project }) => (
                    <DataCell key={`sched-${row.key}-${compareColumnKey(entry)}`} className="py-2">
                      {resolveCompareScheduleTerm(project, row.title) ?? "—"}
                    </DataCell>
                  ))}
                  <EmptySlotCells count={slotsLeft} keyPrefix={`sched-slot-${row.key}`} />
                </Fragment>
              ))
            : null}
        </>
      ) : null}

      {/* Планировки */}
      <LabelCell
        className="bg-[var(--bg-secondary)] font-semibold"
        onClick={() => setPlansOpen((v) => !v)}
      >
        Планировки
        {plansOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </LabelCell>
      {columns.map(({ entry }) => (
        <div key={`plans-head-${compareColumnKey(entry)}`} className="border-b" style={{ borderColor: "var(--border)" }} />
      ))}
      <EmptySlotCells count={slotsLeft} keyPrefix="plans-head-slot" />

      {plansOpen && planCount > 0
        ? Array.from({ length: planCount }).map((_, planIndex) => (
            <Fragment key={`plan-row-${planIndex}`}>
              <LabelCell className="text-[var(--text-muted)]">План {planIndex + 1}</LabelCell>
              {columns.map(({ entry, project }) => {
                const catalog = catalogForKind(entry.catalogKind);
                const plans = getProjectPlans(project);
                const plan = plans[planIndex];
                return (
                  <DataCell key={`plan-${planIndex}-${compareColumnKey(entry)}`}>
                    {plan ? (
                      <Link
                        href={houseProjectDetailPath(catalog, project.slug)}
                        className="group block"
                        title={`Планировка ${planIndex + 1} — ${project.title}`}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--stone)]">
                          <CmsImage
                            src={plan.url}
                            alt={plan.alt || `План ${planIndex + 1} ${project.title}`}
                            fill
                            className="object-contain p-1 transition group-hover:scale-[1.02]"
                            sizes="180px"
                          />
                        </div>
                      </Link>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </DataCell>
                );
              })}
              <EmptySlotCells count={slotsLeft} keyPrefix={`plan-slot-${planIndex}`} />
            </Fragment>
          ))
        : plansOpen ? (
            <>
              <LabelCell className="text-[var(--text-muted)]">—</LabelCell>
              {columns.map(({ entry }) => (
                <DataCell key={`no-plan-${compareColumnKey(entry)}`}>
                  <span className="text-[var(--text-muted)]">—</span>
                </DataCell>
              ))}
              <EmptySlotCells count={slotsLeft} keyPrefix="no-plan-slot" />
            </>
          )
        : null}
    </CompareGrid>
  );
}

function SpecRow({
  label,
  columns,
  slotsLeft,
  render,
  className,
}: {
  label: string;
  columns: CompareColumn[];
  slotsLeft: number;
  render: (project: HouseProjectItem, entry: ProjectCompareEntry) => ReactNode;
  className?: string;
}) {
  return (
    <>
      <LabelCell className="pl-6 text-[var(--text-muted)]">{label}</LabelCell>
      {columns.map(({ entry, project }) => (
        <DataCell key={`${label}-${compareColumnKey(entry)}`} className={cn("py-2", className)}>
          {render(project, entry)}
        </DataCell>
      ))}
      <EmptySlotCells count={slotsLeft} keyPrefix={`${label}-slot`} />
    </>
  );
}

function PriceBreakdownRow({
  label,
  columns,
  slotsLeft,
  quotes,
  quotesLoading,
  pick,
}: {
  label: string;
  columns: CompareColumn[];
  slotsLeft: number;
  quotes: Map<string, CompareQuoteCell>;
  quotesLoading: boolean;
  pick: (cell: CompareQuoteCell) => number;
}) {
  return (
    <>
      <LabelCell className="pl-6 text-[var(--text-muted)]">{label}</LabelCell>
      {columns.map(({ entry }) => {
        const cell = quotes.get(compareColumnKey(entry));
        return (
          <DataCell key={`${label}-${compareColumnKey(entry)}`} className="py-2 tabular-nums">
            {cell && !cell.error ? (
              <QuoteAmountCell amountRub={pick(cell)} loading={quotesLoading} hasCell={Boolean(cell)} />
            ) : (
              <span className="text-[var(--text-muted)]">—</span>
            )}
          </DataCell>
        );
      })}
      <EmptySlotCells count={slotsLeft} keyPrefix={`${label}-slot`} />
    </>
  );
}

function CompletionGroupRows({
  groupTitle,
  rows,
  columns,
  slotsLeft,
}: {
  groupTitle: string;
  rows: ReturnType<typeof buildCompareCompletionRows>;
  columns: CompareColumn[];
  slotsLeft: number;
}) {
  return (
    <>
      <LabelCell className="bg-[color-mix(in_srgb,var(--bg-secondary)_80%,var(--bg))] pl-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
        {groupTitle}
      </LabelCell>
      {columns.map(({ entry }) => (
        <div key={`comp-grp-${groupTitle}-${compareColumnKey(entry)}`} className="border-b" style={{ borderColor: "var(--border)" }} />
      ))}
      <EmptySlotCells count={slotsLeft} keyPrefix={`comp-grp-${groupTitle}`} />

      {rows.map((row) => (
        <Fragment key={`comp-${row.key}`}>
          <LabelCell className="pl-8 text-[var(--text-muted)]">{row.item}</LabelCell>
          {columns.map(({ entry, project }) => {
            const has = projectHasCompletionItem(project, row.groupTitle, row.item);
            return (
              <DataCell key={`comp-${row.key}-${compareColumnKey(entry)}`} className="py-2">
                {has ? (
                  <Check className="h-4 w-4 text-[#0f3d2e]" aria-label="Включено" />
                ) : (
                  <span className="text-[var(--text-muted)]">—</span>
                )}
              </DataCell>
            );
          })}
          <EmptySlotCells count={slotsLeft} keyPrefix={`comp-slot-${row.key}`} />
        </Fragment>
      ))}
    </>
  );
}
