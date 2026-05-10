"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  AppWindow,
  BrickWall,
  ChevronDown,
  DoorOpen,
  Hammer,
  Home,
  LayoutGrid,
  Layers,
  Minus,
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

const ACCENT = "var(--accent)";
const GRAPHITE = "var(--graphite)";

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
  { id: "prep", label: "Подготовительные работы", Icon: Hammer, keywords: ["подготов", "разметк", "участ", "проект", "бти", "документ"], fallback: "Организация подготовки стройплощадки по проекту." },
  { id: "foundation", label: "Фундамент", Icon: Layers, keywords: ["фундамент", "плит", "лент"], fallback: "Устройство основания согласно геологии участка." },
  { id: "walls", label: "Стены", Icon: BrickWall, keywords: ["стен", "коробк", "газобетон", "блок", "кирпич"], fallback: "Возведение несущих и ненесущих стен по проекту." },
  { id: "belt", label: "Монолитный пояс", Icon: Minus, keywords: ["пояс", "монолит", "армопояс"], fallback: "Монолитный пояс для распределения нагрузки." },
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

  return (
    <div className="lg:grid lg:gap-10 lg:[grid-template-columns:minmax(0,1fr)_minmax(280px,360px)]">
      <div className="min-w-0 space-y-8">
        {calculatorUi.partOfSoul?.enabled ? (
          <p className="max-w-3xl text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
            Ориентир стоимости коробки и опций по матрице из проектной документации: ставка за м² зависит от расчётной этажности, типа кровли и
            материала стен. При площади менее {calculatorUi.partOfSoul.smallHouseThresholdSqm} м² к цене коробки добавляется{" "}
            {Math.round(calculatorUi.partOfSoul.shellSurchargeUnderThreshold * 100)}%, к сумме выбранных дополнительных опций — ещё{" "}
            {Math.round(calculatorUi.partOfSoul.addonsSurchargeUnderThreshold * 100)}
            %. Террасы и крыльца в строительной площади часто считаются с коэффициентом 0,5 — уточняем при замере.
          </p>
        ) : (
          <p className="max-w-3xl text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
            Комплектация и ориентир стоимости по выбранному материалу стен; детальный состав — по смете и договору.
          </p>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {tabSpecs.map((t, i) => {
            const active = i === tierIdx;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => onTierIndexChange(i)}
                className={`rounded-2xl border-2 px-4 py-4 text-left text-sm font-bold transition`}
                style={
                  active
                    ? { borderColor: ACCENT, backgroundColor: ACCENT, color: "#fff" }
                    : { borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }
                }
              >
                <span className="block leading-snug">{t.label}</span>
                <span className={`mt-2 block tabular-nums text-xs font-semibold ${active ? "text-white/90" : ""}`}>{formatRub(t.price)}</span>
              </button>
            );
          })}
        </div>

        <div id="project-calculator" className="scroll-mt-[8.5rem] md:scroll-mt-[9rem]">
          <h3 className="font-heading text-xl md:text-2xl" style={{ color: GRAPHITE }}>
            Входит в стоимость:
          </h3>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {STAGES.map((s, i) => {
              const Icon = s.Icon;
              const active = i === stageIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStageIndex(i)}
                  className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-center text-[11px] font-semibold transition md:text-xs`}
                  style={
                    active ?
                      {
                        backgroundColor: ACCENT,
                        color: "#fff",
                        border: `2px solid ${ACCENT}`,
                      }
                    : {
                        border: `2px solid var(--border)`,
                        backgroundColor: "var(--bg)",
                        color: "var(--text)",
                      }
                  }
                >
                  <Icon className={`h-6 w-6 shrink-0 ${active ? "text-white" : ""}`} strokeWidth={1.75} aria-hidden />
                  <span className="leading-tight">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-[var(--bg)] shadow-sm" style={{ borderColor: "var(--border)" }}>
          <div className="grid gap-0 md:grid-cols-2 md:divide-x md:[&>*]:divide-[var(--border)]" style={{ borderColor: "var(--border)" } as CSSProperties}>
            <div className="relative min-h-[200px] w-full bg-[var(--stone)] md:min-h-[280px] md:max-h-[400px] md:h-[min(400px,50vh)]">
              <CmsImage src={imgSrc} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 45vw" />
              <button
                type="button"
                onClick={() => window.open(imgSrc, "_blank")}
                className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                aria-label="Открыть изображение в новой вкладке"
              />
            </div>
            <div className="flex flex-col justify-center p-5 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: ACCENT }}>
                {tier.label} · {stage.label}
              </p>
              <div className="mt-5 space-y-4 text-sm">
                {table.rows.map((row) => (
                  <div key={`${row.label}-${row.value.slice(0, 24)}`} className="border-b pb-4 last:border-0" style={{ borderColor: "var(--border)" }}>
                    <p className="font-bold text-[var(--text)]">{row.label}</p>
                    <p className="mt-1 whitespace-pre-line leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {row.value}
                    </p>
                    <button
                      type="button"
                      className="mt-3 text-xs font-bold uppercase tracking-wider"
                      style={{ color: ACCENT }}
                      onClick={() => openModalToEstimate()}
                    >
                      Подробнее
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            className="rounded-2xl px-4 py-4 text-center text-sm font-bold leading-snug text-white shadow-sm transition hover:opacity-[0.93]"
            style={{ backgroundColor: ACCENT }}
            onClick={scrollAddons}
          >
            Показать расчёт с инженерными сетями (ипотечный вариант)
          </button>
          <button
            type="button"
            className="rounded-2xl px-4 py-4 text-center text-sm font-bold leading-snug text-white shadow-sm transition hover:opacity-[0.93]"
            style={{ backgroundColor: ACCENT }}
            onClick={() => openModalToEstimate()}
          >
            Показать расчёт White Box
          </button>
        </div>

        <div id="completion-addons">
          <div
            className="flex items-center justify-between rounded-t-2xl px-5 py-4 text-[var(--on-accent)]"
            style={{ backgroundColor: ACCENT }}
          >
            <h3 className="font-heading text-lg md:text-xl">Дополнительные опции</h3>
          </div>
          <div className="divide-y rounded-b-2xl border border-t-0 bg-[var(--bg)] shadow-sm" style={{ borderColor: "var(--border)" }}>
            {addonGroups.map((group, gi) => {
              const open = accordionOpen === gi;
              const hasRows = group.items.length > 0;
              return (
                <div key={group.title}>
                  <button
                    type="button"
                    onClick={() => setAccordionOpen((v) => (v === gi ? null : gi))}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-bold sm:px-6 md:text-base"
                  >
                    <span style={{ borderLeft: `4px solid ${ACCENT}`, paddingLeft: 12 }}>{group.title}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {open ? (
                    <div className="border-t px-4 py-4 sm:px-6 sm:py-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
                      {!hasRows ?
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                          Наполнение этой группы согласуется индивидуально и выгружается в смету.
                        </p>
                      : (
                        <ul className="flex flex-col gap-4">
                          {group.items.map((item) => {
                            const sel = !!selectedAddons[item.id];
                            const linePrice = resolveAddonRub(item);
                            return (
                              <li key={item.id}>
                                <article
                                  className={`flex flex-col gap-4 rounded-2xl p-4 sm:p-5 md:flex-row md:items-stretch md:gap-6 ${sel ? "shadow-md ring-2 ring-[var(--sale)]" : "ring-1 ring-[var(--border)]/50"}`}
                                  style={{ backgroundColor: "var(--bg)" }}
                                >
                                  <div className="flex gap-3 md:min-w-[200px] md:max-w-[220px] md:flex-col md:gap-2">
                                    {item.imageUrl ? (
                                      <CmsImage
                                        src={item.imageUrl}
                                        alt=""
                                        width={64}
                                        height={64}
                                        className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16"
                                        sizes="64px"
                                      />
                                    ) : (
                                      <div className="h-14 w-14 shrink-0 rounded-xl bg-[var(--stone)] sm:h-16 sm:w-16" />
                                    )}
                                    <p className="min-w-0 font-bold leading-snug text-[var(--text)]">{item.name}</p>
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    {item.description ?
                                      <p className="text-sm leading-relaxed text-[var(--text-muted)]">{item.description}</p>
                                    : null}
                                    <button
                                      type="button"
                                      className="mt-3 text-xs font-bold uppercase tracking-wide"
                                      style={{ color: ACCENT }}
                                      onClick={() => openModalToEstimate()}
                                    >
                                      Подробнее
                                    </button>
                                  </div>

                                  <div className="flex flex-col gap-3 border-t border-[var(--border)]/40 pt-4 md:w-[min(100%,200px)] md:shrink-0 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                                    <p className="text-lg font-bold tabular-nums text-[var(--text)] md:text-right">{formatRub(linePrice)}</p>
                                    <button
                                      type="button"
                                      aria-pressed={sel}
                                      className={`min-h-[48px] w-full rounded-xl px-4 py-3 text-sm font-bold transition md:min-h-0 md:py-2.5 ${
                                        sel
                                          ? "bg-[var(--sale)] uppercase tracking-[0.06em] text-[var(--on-sale)] shadow-[0_4px_20px_rgb(var(--sale-rgb)/0.42)] ring-2 ring-[rgb(var(--sale-rgb)/0.35)] hover:bg-[var(--sale-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sale)]"
                                          : "bg-[var(--accent)] text-white hover:opacity-[0.93] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                                      }`}
                                      onClick={() => toggleAddon(item.id)}
                                    >
                                      {sel ? "Добавлено в расчёт" : "Добавить"}
                                    </button>
                                  </div>
                                </article>
                              </li>
                            );
                          })}
                        </ul>
                      )
                      }
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="mt-12 lg:mt-0 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-3xl border bg-[var(--bg)] p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-heading text-lg" style={{ color: GRAPHITE }}>
            {project.title}
          </h3>
          <p className="mt-1 text-xs leading-snug" style={{ color: "var(--text-muted)" }}>
            Строительная площадь в расчёте:{" "}
            <span className="font-semibold tabular-nums text-[var(--text)]">{project.area} м²</span>
            {partOfSoulContext ?
              <>
                {" "}
                · кровля:{" "}
                <span className="font-semibold text-[var(--text)]">{partOfSoulRoofLabels(partOfSoulContext.roofPitch)}</span>
              </>
            : null}
          </p>
          <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
            Комплектация: <span className="font-semibold text-[var(--text)]">{tier.label}</span>
          </p>

          <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--border)" }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
              Из чего складывается сумма
            </p>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex justify-between gap-3">
                <span style={{ color: "var(--text-muted)" }}>Коробка и базовое наполнение</span>
                <span className="shrink-0 tabular-nums font-semibold text-[var(--text)]">{formatRub(priced)}</span>
              </li>

              <li className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-semibold text-[var(--text)]">Дополнительные опции</p>
                {selectedAddonBreakdown.length === 0 ?
                  <p className="mt-1 text-xs leading-snug" style={{ color: "var(--text-muted)" }}>
                    Ничего не отмечено — при необходимости добавьте строки в таблице ниже.
                  </p>
                : (
                  <ul className="mt-2 space-y-1.5">
                    {selectedAddonBreakdown.map((row) => (
                      <li key={row.id} className="flex justify-between gap-2 text-xs">
                        <span className="min-w-0 leading-snug" style={{ color: "var(--text-muted)" }}>
                          + {row.name}
                        </span>
                        <span className="shrink-0 tabular-nums font-medium text-[var(--text)]">{formatRub(row.amount)}</span>
                      </li>
                    ))}
                    <li className="flex justify-between gap-2 border-t pt-2 text-xs" style={{ borderColor: "var(--border)" }}>
                      <span style={{ color: "var(--text-muted)" }}>Подытог по опциям</span>
                      <span className="tabular-nums font-semibold text-[var(--text)]">{formatRub(addonsSumRaw)}</span>
                    </li>
                    {addonsSmallHouseMult > 1 && calculatorUi.partOfSoul ?
                      <li className="flex flex-col gap-0.5 text-[11px] leading-snug" style={{ color: "var(--text-muted)" }}>
                        <span>
                          Площадь менее {calculatorUi.partOfSoul.smallHouseThresholdSqm} м²: к сумме опций применяется ×
                          {String(addonsSmallHouseMult.toFixed(2)).replace(".", ",")}{" "}
                          (+{Math.round(calculatorUi.partOfSoul.addonsSurchargeUnderThreshold * 100)}% по методике)
                        </span>
                        <span className="flex justify-between gap-2 font-semibold text-[var(--text)]">
                          <span>Итого по опциям с учётом коэфф.</span>
                          <span className="tabular-nums">{formatRub(addonsSum)}</span>
                        </span>
                      </li>
                    : addonsSumRaw > 0 ?
                      <li className="flex justify-between gap-2 pt-0.5 text-xs font-semibold text-[var(--text)]">
                        <span>Итого по опциям</span>
                        <span className="tabular-nums">{formatRub(addonsSum)}</span>
                      </li>
                    : null}
                  </ul>
                )}
              </li>

              <li className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
                  Место строительства (влияет на транспортные накладные)
                </p>
                <div className="space-y-2 text-sm">
                  {transportBands.map((b) => (
                    <label key={b.id} className="flex cursor-pointer items-start gap-2">
                      <input
                        type="radio"
                        className="mt-1 shrink-0 accent-[var(--accent)]"
                        name={`transport-${project.slug}`}
                        checked={transportId === b.id}
                        onChange={() => setTransportId(b.id)}
                      />
                      <span>{b.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex justify-between gap-3 text-sm">
                  <span style={{ color: "var(--text-muted)" }}>Транспорт.—наклад. расходы (без доставки)</span>
                  <span className="shrink-0 tabular-nums font-semibold text-[var(--text)]">{formatRub(surcharge)}</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--border)" }}>
            <p className="flex flex-wrap items-baseline justify-between gap-2 font-heading text-xl font-bold tabular-nums sm:text-2xl" style={{ color: ACCENT }}>
              <span>Итого</span>
              <span>{formatRub(grandTotal)}</span>
            </p>
            <p className="mt-2 text-[11px] leading-snug" style={{ color: "var(--text-muted)" }}>
              Сложение: коробка {formatRub(priced)} · опции {formatRub(addonsSum)} · транспорт.—наклад.{" "}
              {formatRub(surcharge)}
            </p>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:opacity-[0.95]"
            style={{ backgroundColor: ACCENT }}
            onClick={() =>
              openModalToEstimate()
            }
          >
            Получить смету
          </button>
        </div>
      </aside>
    </div>
  );
}
