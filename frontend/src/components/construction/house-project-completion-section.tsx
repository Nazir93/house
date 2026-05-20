"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppWindow,
  BrickWall,
  Check,
  ChevronDown,
  DoorOpen,
  Hammer,
  Home,
  LayoutGrid,
  Layers,
  Minus,
  Plus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { CompletionGroup } from "@/lib/construction-shared";
import {
  formatRub,
  type HeroPricingTier,
  type HouseProjectItem,
} from "@/lib/construction-data";
import type { CalculatorAddonItem, CalculatorStageId, CalculatorStageTable, ProjectCalculatorUi } from "@/lib/project-calculator-types";
import { useModal } from "@/lib/modal-context";
import { CmsImage } from "@/components/ui/cms-image";
import {
  computePartOfSoulAddonRub,
  partOfSoulRoofLabels,
  type PartOfSoulPricingFloors,
  type PartOfSoulRoofPitch,
} from "@/lib/part-of-soul-pricing";
import { cn } from "@/lib/utils";

/** Граница без яркой белой обводки в тёмной теме */
const softBorder = "border border-[color-mix(in_srgb,var(--text)_7%,transparent)]";
const softDivide = "border-[color-mix(in_srgb,var(--text)_7%,transparent)]";

type Tier = { id: string; label: string; multiplier: number };

const DEFAULT_TIERS: Tier[] = [
  { id: "gas", label: "Газоблок", multiplier: 1 },
  { id: "keramzit", label: "Керамзитоблок", multiplier: 1.034 },
  { id: "ceramic", label: "Керамический блок", multiplier: 1.034 },
  { id: "brick", label: "Кирпич", multiplier: 1.086 },
];

function tiersFromMaterials(materials: string[]): Tier[] {
  const lower = materials.map((m) => m.toLowerCase());
  const picked: Tier[] = [];
  const push = (t: Tier) => {
    if (!picked.some((p) => p.id === t.id)) picked.push(t);
  };
  for (const m of lower) {
    if (/газ|газобетон|газоблок/.test(m)) push(DEFAULT_TIERS[0]);
    else if (/керамзит/.test(m)) push(DEFAULT_TIERS[1]);
    else if (/керамич/.test(m)) push(DEFAULT_TIERS[2]);
    else if (/кирпич/.test(m)) push(DEFAULT_TIERS[3]);
  }
  if (picked.length === 0) return DEFAULT_TIERS.slice(0, 3);
  return picked;
}

function flattenCompletion(completion: CompletionGroup[]): string[] {
  return completion.flatMap((g) => g.items.map((item) => item.trim()).filter(Boolean));
}

const STAGES: Array<{
  id: CalculatorStageId;
  label: string;
  Icon: LucideIcon;
  keywords: string[];
  fallback: string;
}> = [
  { id: "prep", label: "Подготовка", Icon: Hammer, keywords: ["подготов", "разметк", "участ", "проект", "бти", "документ"], fallback: "Организация подготовки стройплощадки по проекту." },
  { id: "foundation", label: "Фундамент", Icon: Layers, keywords: ["фундамент", "плит", "лент"], fallback: "Устройство основания согласно геологии участка." },
  { id: "walls", label: "Стены", Icon: BrickWall, keywords: ["стен", "коробк", "газобетон", "блок", "кирпич"], fallback: "Возведение несущих и ненесущих стен по проекту." },
  { id: "belt", label: "Пояс", Icon: Minus, keywords: ["пояс", "монолит", "армопояс"], fallback: "Монолитный пояс для распределения нагрузки." },
  { id: "floors", label: "Перекрытия", Icon: LayoutGrid, keywords: ["перекрыт", "плит перек"], fallback: "Перекрытия по несущей схеме дома." },
  { id: "roof", label: "Кровля", Icon: Home, keywords: ["кровл", "стропил"], fallback: "Стропильная система и кровельное покрытие." },
  { id: "windows", label: "Окна", Icon: AppWindow, keywords: ["окн"], fallback: "Остекление по спецификации проекта." },
  { id: "doors", label: "Двери", Icon: DoorOpen, keywords: ["двер"], fallback: "Входная группа и технические проёмы по комплектации." },
];

function stageDetails(stage: (typeof STAGES)[0], flat: string[]): string[] {
  const hits = flat.filter((item) => stage.keywords.some((k) => item.toLowerCase().includes(k)));
  if (hits.length) return hits;
  return [stage.fallback];
}

function resolveStageTable(
  ui: ProjectCalculatorUi,
  tierKey: string,
  stageId: CalculatorStageId,
  fallbackLines: string[]
): CalculatorStageTable {
  const fromTier = ui.stagesByTier?.[tierKey]?.[stageId];
  const shared = ui.stages?.[stageId];
  const block = fromTier ?? shared;
  const rows =
    block?.rows?.length ?
      block.rows
    : [{ label: "Состав работ", value: fallbackLines.join("\n\n") }];
  return {
    imageUrl: block?.imageUrl ?? shared?.imageUrl,
    rows,
  };
}

export function HouseProjectCompletionSection({
  project,
  heroTiers,
  tierIndex,
  onTierIndexChange,
  calculatorUi,
  coverImageUrl,
  partOfSoulContext,
}: {
  project: HouseProjectItem;
  heroTiers: HeroPricingTier[];
  tierIndex: number;
  onTierIndexChange: (index: number) => void;
  calculatorUi: ProjectCalculatorUi;
  coverImageUrl?: string | null;
  partOfSoulContext?: {
    pricingFloors: PartOfSoulPricingFloors;
    roofPitch: PartOfSoulRoofPitch;
  };
}) {
  const { openModalToEstimate } = useModal();

  const defaultTierDefs = useMemo(
    () => tiersFromMaterials(project.materials.length ? project.materials : DEFAULT_TIERS.map((t) => t.label)),
    [project.materials]
  );

  const tabSpecs = useMemo(() => {
    if (heroTiers.length) {
      return heroTiers.map((t, i) => ({
        id: t.id || `tier-${i}`,
        label: t.label,
        price: Math.round(t.price),
      }));
    }
    return defaultTierDefs.map((t) => ({
      id: t.id,
      label: t.label,
      price: Math.round(project.price * t.multiplier),
    }));
  }, [defaultTierDefs, heroTiers, project.price]);

  const tierIdx = Math.min(tierIndex, Math.max(0, tabSpecs.length - 1));
  const tier = tabSpecs[tierIdx] ?? tabSpecs[0];
  const priced = tier?.price ?? project.price;
  const tierKey = tier?.id ?? "gas";

  const [stageIndex, setStageIndex] = useState(0);
  const flat = useMemo(() => flattenCompletion(project.completion), [project.completion]);
  const stage = STAGES[stageIndex] ?? STAGES[0];
  const fallbackLines = useMemo(() => stageDetails(stage, flat), [flat, stage]);

  const table = useMemo(
    () => resolveStageTable(calculatorUi, tierKey, stage.id, fallbackLines),
    [calculatorUi, fallbackLines, stage.id, tierKey]
  );

  const imgSrc = table.imageUrl || coverImageUrl || "/images/banner/banner-hero-01.png";

  const transportBands = useMemo(() => {
    return calculatorUi.transportBands?.length ?
        calculatorUi.transportBands
      : [{ id: "unk", label: "Неизвестно", surcharge: 0 }];
  }, [calculatorUi.transportBands]);

  const [transportId, setTransportId] = useState(transportBands[0]?.id ?? "unk");
  useEffect(() => {
    const ids = new Set(transportBands.map((b) => b.id));
    if (!ids.has(transportId)) setTransportId(transportBands[0]?.id ?? "unk");
  }, [transportBands, transportId]);

  const surcharge = transportBands.find((b) => b.id === transportId)?.surcharge ?? 0;

  const addonGroups = useMemo(() => calculatorUi.addons ?? [], [calculatorUi.addons]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const toggleAddon = useCallback((id: string) => {
    setSelectedAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const resolveAddonRub = useCallback(
    (item: CalculatorAddonItem) => {
      if (calculatorUi.partOfSoul?.enabled && item.partOfSoulAddon && partOfSoulContext) {
        return computePartOfSoulAddonRub(item.partOfSoulAddon, {
          areaSqm: project.area,
          pf: partOfSoulContext.pricingFloors,
          roof: partOfSoulContext.roofPitch,
        });
      }
      return item.price;
    },
    [calculatorUi.partOfSoul?.enabled, partOfSoulContext, project.area]
  );

  const addonsSumRaw = useMemo(() => {
    let s = 0;
    for (const g of addonGroups) {
      for (const it of g.items) {
        if (selectedAddons[it.id]) s += resolveAddonRub(it);
      }
    }
    return s;
  }, [addonGroups, resolveAddonRub, selectedAddons]);

  const addonsSmallHouseMult =
    calculatorUi.partOfSoul?.enabled &&
    !!partOfSoulContext &&
    project.area < calculatorUi.partOfSoul.smallHouseThresholdSqm ?
      1 + calculatorUi.partOfSoul.addonsSurchargeUnderThreshold
    : 1;

  const addonsSum = addonsSumRaw * addonsSmallHouseMult;

  const grandTotal = priced + surcharge + addonsSum;

  const selectedAddonBreakdown = useMemo(() => {
    const lines: { id: string; name: string; amount: number }[] = [];
    for (const g of addonGroups) {
      for (const it of g.items) {
        if (!selectedAddons[it.id]) continue;
        lines.push({ id: it.id, name: it.name, amount: resolveAddonRub(it) });
      }
    }
    return lines;
  }, [addonGroups, resolveAddonRub, selectedAddons]);

  const [accordionOpen, setAccordionOpen] = useState<number | null>(0);

  function scrollAddons() {
    document.getElementById("completion-addons")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const StageIcon = stage.Icon;

  return (
    <div className="lg:grid lg:gap-10 xl:gap-12 lg:[grid-template-columns:minmax(0,1fr)_minmax(300px,380px)]">
      <div className="min-w-0 space-y-10">
        {/* Вводный блок */}
        <div
          className={cn(
            "rounded-[28px] bg-[var(--bg)] p-6 md:p-8 shadow-[0_12px_40px_rgb(var(--accent-rgb)/0.06)]",
            softBorder
          )}
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Калькулятор комплектации
            </span>
          </div>
          {calculatorUi.partOfSoul?.enabled ? (
            <p className="max-w-3xl text-sm md:text-[15px] leading-relaxed text-[var(--text-muted)]">
              Ориентир стоимости коробки и опций по проектной матрице: ставка за м² зависит от этажности, кровли и материала стен.
              При площади менее {calculatorUi.partOfSoul.smallHouseThresholdSqm} м² к коробке +{Math.round(calculatorUi.partOfSoul.shellSurchargeUnderThreshold * 100)}%, к опциям +{Math.round(calculatorUi.partOfSoul.addonsSurchargeUnderThreshold * 100)}%.
            </p>
          ) : (
            <p className="max-w-3xl text-sm md:text-[15px] leading-relaxed text-[var(--text-muted)]">
              Выберите материал стен, изучите состав работ по этапам и соберите ориентир бюджета с дополнительными опциями.
            </p>
          )}

          {/* Материал стен — сегментированный переключатель */}
          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] mb-3">
              Материал стен
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[color-mix(in_srgb,var(--stone)_35%,var(--bg-secondary))]">
              {tabSpecs.map((t, i) => {
                const active = i === tierIdx;
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onTierIndexChange(i)}
                    className={cn(
                      "rounded-xl px-3 py-3.5 text-left transition-all duration-200",
                      active
                        ? "bg-[var(--bg)] shadow-[0_4px_20px_rgb(0_0_0/0.08)] ring-1 ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]"
                        : "hover:bg-[var(--bg)]/60 opacity-90 hover:opacity-100"
                    )}
                  >
                    <span className={cn("block text-sm font-semibold leading-snug", active && "text-[var(--accent)]")}>
                      {t.label}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 block tabular-nums text-xs font-medium",
                        active ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                      )}
                    >
                      {formatRub(t.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Этапы — сетка, все пункты видны без горизонтального скролла */}
        <div id="project-calculator" className="scroll-mt-[8.5rem] md:scroll-mt-[9rem]">
          <h3 className="font-heading text-xl md:text-2xl text-[var(--graphite)]">Состав работ по этапам</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)] max-w-2xl">
            Выберите этап — ниже откроется описание и фото для выбранной комплектации.
          </p>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2 sm:gap-2.5">
            {STAGES.map((s, i) => {
              const Icon = s.Icon;
              const active = i === stageIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStageIndex(i)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-2xl px-2 py-3 sm:py-3.5 text-center transition-all duration-200 min-h-[4.5rem] sm:min-h-[5rem]",
                    active
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_6px_20px_rgb(var(--accent-rgb)/0.32)]"
                      : cn(
                          "bg-[color-mix(in_srgb,var(--bg-secondary)_55%,var(--bg))] text-[var(--text)]",
                          "ring-1 ring-[color-mix(in_srgb,var(--text)_6%,transparent)]",
                          "hover:ring-[color-mix(in_srgb,var(--accent)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_6%,var(--bg))]"
                        )
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5 sm:h-6 sm:w-6 shrink-0", active ? "opacity-95" : "opacity-80")}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="text-[10px] sm:text-[11px] font-semibold leading-tight px-0.5">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Карточка этапа */}
        <article
          className={cn(
            "overflow-hidden rounded-[28px] bg-[var(--bg)] shadow-[0_16px_48px_rgb(0_0_0/0.06)]",
            softBorder
          )}
        >
          <div className="grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px] bg-[var(--stone)]">
              <CmsImage src={imgSrc} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              <button
                type="button"
                onClick={() => window.open(imgSrc, "_blank")}
                className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                aria-label="Открыть изображение в новой вкладке"
              />
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                <StageIcon className="h-3.5 w-3.5" aria-hidden />
                {stage.label}
              </div>
            </div>
            <div
              className={cn(
                "flex flex-col p-6 md:p-8 lg:p-9 border-t md:border-t-0 md:border-l",
                softDivide
              )}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">
                {tier.label}
              </p>
              <h4 className="mt-2 font-heading text-2xl md:text-[1.65rem] leading-tight text-[var(--graphite)]">
                {stage.label}
              </h4>
              <div className="mt-6 space-y-5 flex-1">
                {table.rows.map((row) => (
                  <div
                    key={`${row.label}-${row.value.slice(0, 24)}`}
                    className="rounded-2xl bg-[color-mix(in_srgb,var(--bg-secondary)_70%,var(--bg))] p-4"
                  >
                    <p className="text-sm font-semibold text-[var(--text)]">{row.label}</p>
                    <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-[var(--text-muted)]">
                      {row.value}
                    </p>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline"
                      onClick={() => openModalToEstimate()}
                    >
                      Уточнить в смете
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Быстрые сценарии */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="flex-1 rounded-2xl border-2 border-[var(--accent)] bg-transparent px-5 py-4 text-sm font-semibold text-[var(--accent)] transition hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
            onClick={scrollAddons}
          >
            + Инженерные сети и опции
          </button>
          <button
            type="button"
            className="flex-1 rounded-2xl bg-[var(--accent)] px-5 py-4 text-sm font-semibold text-[var(--accent-contrast)] shadow-[0_8px_28px_rgb(var(--accent-rgb)/0.28)] transition hover:bg-[var(--accent-hover)]"
            onClick={() => openModalToEstimate()}
          >
            Расчёт White Box
          </button>
        </div>

        {/* Доп. опции */}
        <div id="completion-addons" className="scroll-mt-28">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h3 className="font-heading text-xl md:text-2xl text-[var(--graphite)]">Дополнительные опции</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Отметьте нужные позиции — сумма обновится в блоке справа.</p>
            </div>
          </div>

          <div className="space-y-3">
            {addonGroups.map((group, gi) => {
              const open = accordionOpen === gi;
              const hasRows = group.items.length > 0;
              const selectedInGroup = group.items.filter((it) => selectedAddons[it.id]).length;
              return (
                <div
                  key={group.title}
                  className={cn(
                    "rounded-2xl overflow-hidden transition-shadow duration-200 bg-[var(--bg)]",
                    softBorder,
                    open && "ring-1 ring-[color-mix(in_srgb,var(--accent)_30%,transparent)] shadow-[0_8px_32px_rgb(var(--accent-rgb)/0.08)]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setAccordionOpen((v) => (v === gi ? null : gi))}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left bg-[var(--bg)] hover:bg-[color-mix(in_srgb,var(--bg-secondary)_50%,var(--bg))] transition"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-[var(--text)] md:text-base">{group.title}</span>
                      {selectedInGroup > 0 ? (
                        <span className="mt-1 block text-xs text-[var(--accent)] font-medium">
                          Выбрано: {selectedInGroup}
                        </span>
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-[color-mix(in_srgb,var(--text)_8%,transparent)] transition",
                        open && "rotate-180 bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]"
                      )}
                    >
                      <ChevronDown className="h-5 w-5 text-[var(--text-muted)]" aria-hidden />
                    </span>
                  </button>
                  {open ? (
                    <div
                      className={cn(
                        "border-t bg-[color-mix(in_srgb,var(--bg-secondary)_40%,var(--bg))] px-4 py-5 sm:px-6",
                        softDivide
                      )}
                    >
                      {!hasRows ? (
                        <p className="text-sm text-[var(--text-muted)]">
                          Наполнение этой группы согласуется индивидуально и выгружается в смету.
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-3">
                          {group.items.map((item) => {
                            const sel = !!selectedAddons[item.id];
                            const linePrice = resolveAddonRub(item);
                            return (
                              <li key={item.id}>
                                <article
                                  className={cn(
                                    "flex flex-col gap-4 rounded-2xl p-4 sm:p-5 md:flex-row md:items-center md:gap-6 transition-all",
                                    sel
                                      ? "bg-[var(--bg)] ring-2 ring-[var(--sale)] shadow-[0_8px_24px_rgb(var(--sale-rgb)/0.12)]"
                                      : "bg-[var(--bg)] ring-1 ring-[color-mix(in_srgb,var(--text)_6%,transparent)] hover:ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]"
                                  )}
                                >
                                  <div className="flex gap-4 min-w-0 flex-1 md:items-center">
                                    {item.imageUrl ? (
                                      <CmsImage
                                        src={item.imageUrl}
                                        alt=""
                                        width={72}
                                        height={72}
                                        className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover"
                                        sizes="72px"
                                      />
                                    ) : (
                                      <div className="h-[72px] w-[72px] shrink-0 rounded-xl bg-[var(--stone)]" />
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-semibold leading-snug text-[var(--text)]">{item.name}</p>
                                      {item.description ? (
                                        <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)] line-clamp-3">
                                          {item.description}
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:shrink-0 md:min-w-[140px]">
                                    <p className="text-lg font-bold tabular-nums text-[var(--text)]">{formatRub(linePrice)}</p>
                                    <button
                                      type="button"
                                      aria-pressed={sel}
                                      className={cn(
                                        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition min-w-[130px]",
                                        sel
                                          ? "bg-[var(--sale)] text-[var(--on-sale)]"
                                          : "bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)]"
                                      )}
                                      onClick={() => toggleAddon(item.id)}
                                    >
                                      {sel ? (
                                        <>
                                          <Check className="h-4 w-4" aria-hidden />
                                          В расчёте
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="h-4 w-4" aria-hidden />
                                          Добавить
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </article>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Сайдбар итога */}
      <aside className="mt-10 lg:mt-0 lg:sticky lg:top-28 lg:self-start">
        <div
          className={cn(
            "rounded-[28px] bg-[var(--bg)] overflow-hidden shadow-[0_20px_50px_rgb(0_0_0/0.08)]",
            softBorder
          )}
        >
          <div className={cn("p-6 border-b", softDivide)}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Проект</p>
            <h3 className="mt-1 font-heading text-xl text-[var(--graphite)]">{project.title}</h3>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-[color-mix(in_srgb,var(--bg-secondary)_80%,var(--bg))] px-3 py-2.5">
                <dt className="text-[var(--text-muted)]">Площадь</dt>
                <dd className="mt-0.5 font-bold tabular-nums text-[var(--text)]">{project.area} м²</dd>
              </div>
              {partOfSoulContext ? (
                <div className="rounded-xl bg-[color-mix(in_srgb,var(--bg-secondary)_80%,var(--bg))] px-3 py-2.5">
                  <dt className="text-[var(--text-muted)]">Кровля</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--text)] leading-snug">
                    {partOfSoulRoofLabels(partOfSoulContext.roofPitch)}
                  </dd>
                </div>
              ) : (
                <div className="rounded-xl bg-[color-mix(in_srgb,var(--bg-secondary)_80%,var(--bg))] px-3 py-2.5">
                  <dt className="text-[var(--text-muted)]">Комплектация</dt>
                  <dd className="mt-0.5 font-semibold text-[var(--text)] leading-snug">{tier.label}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="px-6 py-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Смета ориентир</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between gap-3">
                <span className="text-[var(--text-muted)]">Коробка</span>
                <span className="shrink-0 tabular-nums font-semibold text-[var(--text)]">{formatRub(priced)}</span>
              </li>
              <li className={cn("pt-2 border-t", softDivide)}>
                <p className="text-xs font-semibold text-[var(--text)] mb-2">Доп. опции</p>
                {selectedAddonBreakdown.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)]">Не выбраны</p>
                ) : (
                  <ul className="space-y-1.5">
                    {selectedAddonBreakdown.map((row) => (
                      <li key={row.id} className="flex justify-between gap-2 text-xs">
                        <span className="min-w-0 text-[var(--text-muted)] truncate">+ {row.name}</span>
                        <span className="tabular-nums font-medium text-[var(--text)]">{formatRub(row.amount)}</span>
                      </li>
                    ))}
                    <li className={cn("flex justify-between gap-2 pt-2 border-t font-semibold text-xs", softDivide)}>
                      <span className="text-[var(--text-muted)]">Итого опции</span>
                      <span className="tabular-nums text-[var(--text)]">{formatRub(addonsSum)}</span>
                    </li>
                  </ul>
                )}
              </li>
              <li className={cn("pt-3 border-t", softDivide)}>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-3">
                  Расстояние до объекта
                </p>
                <div className="space-y-2" role="radiogroup" aria-label="Расстояние до объекта">
                  {transportBands.map((b) => {
                    const selected = transportId === b.id;
                    return (
                      <label
                        key={b.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition",
                          selected
                            ? "bg-[color-mix(in_srgb,var(--accent)_12%,var(--bg))] ring-1 ring-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
                            : "bg-[color-mix(in_srgb,var(--bg-secondary)_45%,var(--bg))] ring-1 ring-[color-mix(in_srgb,var(--text)_5%,transparent)] hover:ring-[color-mix(in_srgb,var(--accent)_22%,transparent)]"
                        )}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name={`transport-${project.slug}`}
                          checked={selected}
                          onChange={() => setTransportId(b.id)}
                        />
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-2 transition",
                            selected
                              ? "ring-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_15%,transparent)]"
                              : "ring-[color-mix(in_srgb,var(--text)_18%,transparent)] bg-transparent"
                          )}
                          aria-hidden
                        >
                          {selected ? (
                            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            "text-sm leading-snug",
                            selected ? "font-medium text-[var(--text)]" : "text-[var(--text-muted)]"
                          )}
                        >
                          {b.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-3 flex justify-between gap-3 text-sm">
                  <span className="text-[var(--text-muted)]">Транспорт</span>
                  <span className="tabular-nums font-semibold text-[var(--text)]">{formatRub(surcharge)}</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="mx-6 mb-6 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_75%,#1a5c45)] p-5 text-[var(--accent-contrast)] shadow-[0_12px_36px_rgb(var(--accent-rgb)/0.35)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">Ориентир итого</p>
            <p className="mt-2 font-heading text-3xl md:text-[2rem] font-bold tabular-nums tracking-tight">
              {formatRub(grandTotal)}
            </p>
            <p className="mt-2 text-[11px] leading-snug text-white/75">
              {formatRub(priced)} + {formatRub(addonsSum)} опции + {formatRub(surcharge)} транспорт
            </p>
          </div>

          <div className="px-6 pb-6">
            <button
              type="button"
              className="w-full rounded-2xl bg-[var(--graphite)] py-4 text-sm font-bold text-[var(--bg)] transition hover:opacity-90 dark:bg-[var(--accent-contrast)] dark:text-[var(--graphite)]"
              onClick={() => openModalToEstimate()}
            >
              Получить детальную смету
            </button>
            <p className="mt-3 text-center text-[11px] text-[var(--text-muted)] leading-snug">
              Точная стоимость — после замера участка и согласования комплектации.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
