"use client";

import { useMemo, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

import { CmsImage } from "@/components/ui/cms-image";
import { formatRub } from "@/lib/construction-data";
import { calculatorAddonGroupSum } from "@/lib/calculator-addon-group-sum";

type Props = {
  groups: CalculatorAddonGroup[];
  selectedAddons: Record<string, boolean>;
  onToggle: (id: string) => void;
  resolvePrice: (item: CalculatorAddonItem) => number;
};

export function CalculatorAddonGroups({ groups, selectedAddons, onToggle, resolvePrice }: Props) {
  const [accordionOpen, setAccordionOpen] = useState<number | null>(0);
  const [detailId, setDetailId] = useState<string | null>(null);

  const groupsWithMeta = useMemo(
    () =>
      groups.map((group) => ({
        group,
        sum: calculatorAddonGroupSum(group, selectedAddons, resolvePrice),
        selectedCount: group.items.filter((it) => selectedAddons[it.id]).length,
      })),
    [groups, resolvePrice, selectedAddons],
  );

  return (
    <div id="completion-addons" className="scroll-mt-28">
      <div className="mb-6">
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] md:text-xs">
          Дополнительные опции
        </h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Отметьте нужные позиции — сумма обновится в блоке справа.
        </p>
      </div>

      <div className="space-y-2">
        {groupsWithMeta.map(({ group, sum, selectedCount }, gi) => {
          const open = accordionOpen === gi;
          const hasRows = group.items.length > 0;

          return (
            <section
              key={group.title}
              className={cn(
                "overflow-hidden rounded-2xl border bg-[var(--bg)] transition-shadow",
                rowDivide,
                open && "shadow-[0_12px_40px_rgb(0_0_0/0.06)]",
              )}
            >
              <button
                type="button"
                onClick={() => setAccordionOpen((v) => (v === gi ? null : gi))}
                className="flex w-full items-center justify-between gap-4 border-b px-4 py-3.5 text-left transition hover:bg-[color-mix(in_srgb,var(--bg-secondary)_35%,var(--bg))] sm:px-5 sm:py-4"
                style={{ borderColor: "color-mix(in srgb, var(--text) 7%, transparent)" }}
              >
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-[var(--text)] md:text-[15px]">{group.title}</span>
                  {selectedCount > 0 ? (
                    <span className="mt-0.5 block text-[11px] font-medium text-[var(--accent)]">
                      Выбрано: {selectedCount}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-bold tabular-nums text-[var(--text)]">{formatRub(sum)}</span>
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition",
                      open && "rotate-180 bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]",
                    )}
                  >
                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" aria-hidden />
                  </span>
                </div>
              </button>

              {open ? (
                <div className="px-0 pb-1">
                  {!hasRows ? (
                    <p className="px-4 py-5 text-sm text-[var(--text-muted)] sm:px-5">
                      Наполнение этой группы согласуется индивидуально и выгружается в смету.
                    </p>
                  ) : (
                    <ul>
                      {group.items.map((item) => {
                        const selected = !!selectedAddons[item.id];
                        const linePrice = resolvePrice(item);
                        const detailOpen = detailId === item.id;
                        const hasDetail = Boolean(item.description?.trim() || item.imageUrl);

                        return (
                          <li key={item.id} className={cn("border-b last:border-b-0", rowDivide)}>
                            <div
                              className={cn(
                                "flex items-start gap-3 px-4 py-3.5 transition-colors sm:gap-4 sm:px-5 sm:py-4",
                                selected &&
                                  "bg-[color-mix(in_srgb,var(--accent)_9%,var(--bg))]",
                              )}
                            >
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={selected}
                                aria-label={`${selected ? "Убрать" : "Добавить"}: ${item.name}`}
                                onClick={() => onToggle(item.id)}
                                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition"
                                style={{
                                  borderColor: selected
                                    ? "var(--accent)"
                                    : "color-mix(in srgb, var(--text) 22%, transparent)",
                                }}
                              >
                                {selected ? (
                                  <span
                                    className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]"
                                    aria-hidden
                                  />
                                ) : null}
                              </button>

                              <button
                                type="button"
                                onClick={() => onToggle(item.id)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <p className="text-sm font-semibold leading-snug text-[var(--text)]">{item.name}</p>
                                {item.description ? (
                                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[var(--text-muted)]">
                                    {item.description}
                                  </p>
                                ) : null}
                              </button>

                              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                                <span className="text-sm font-bold tabular-nums text-[var(--text)] sm:text-[15px]">
                                  {formatRub(linePrice)}
                                </span>
                                {hasDetail ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDetailId((id) => (id === item.id ? null : item.id));
                                    }}
                                    className={cn(
                                      "flex h-8 w-8 items-center justify-center rounded-full border text-[var(--text-muted)] transition hover:text-[var(--text)]",
                                      detailOpen &&
                                        "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]",
                                    )}
                                    style={{
                                      borderColor: detailOpen
                                        ? undefined
                                        : "color-mix(in srgb, var(--text) 14%, transparent)",
                                    }}
                                    aria-expanded={detailOpen}
                                    aria-label={`Подробнее: ${item.name}`}
                                  >
                                    <HelpCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                                  </button>
                                ) : (
                                  <span className="h-8 w-8 shrink-0" aria-hidden />
                                )}
                              </div>
                            </div>

                            {detailOpen && hasDetail ? (
                              <div
                                className="border-t bg-[color-mix(in_srgb,var(--bg-secondary)_50%,var(--bg))] px-4 py-4 sm:px-5 sm:py-5"
                                style={{ borderColor: "color-mix(in srgb, var(--text) 7%, transparent)" }}
                              >
                                <div className="grid gap-4 sm:grid-cols-[minmax(140px,200px)_minmax(0,1fr)] sm:items-start">
                                  {item.imageUrl ? (
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--stone)]">
                                      <CmsImage
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 100vw, 200px"
                                      />
                                    </div>
                                  ) : null}
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                      Состав работ
                                    </p>
                                    <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-[var(--text-muted)]">
                                      {item.description?.trim() ||
                                        "Детали позиции уточняются при составлении сметы."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
