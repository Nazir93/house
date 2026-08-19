"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AppWindow,
  BrickWall,
  DoorOpen,
  Hammer,
  Home,
  LayoutGrid,
  Layers,
  Minus,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { CompletionGroup } from "@/lib/construction-shared";
import {
  formatRub,
  type HeroPricingTier,
  type HouseProjectItem,
} from "@/lib/construction-data";
import type { CalculatorStageId, CalculatorStageTable, ProjectCalculatorUi } from "@/lib/project-calculator-types";
import { useModal } from "@/lib/modal-context";
import { CmsImage } from "@/components/ui/cms-image";
import { type PartOfSoulPricingFloors, type PartOfSoulRoofPitch, tierIdToWallMaterial } from "@/lib/part-of-soul-pricing";
import {
  normalizeTransportBands,
} from "@/lib/project-transport-surcharge";
import { ProjectCalculatorCatalogOptions } from "@/components/construction/project-calculator-catalog-options";
import { ProjectCalculatorEstimateMobile } from "@/components/construction/project-calculator-estimate-mobile";
import type { PublicCalculatorCatalog } from "@/lib/calculator-catalog";
import type { HouseCalculatorCategoryId } from "@/lib/house-project-calculator-engine";
import { buildProjectCalculatorLeadPayload } from "@/lib/project-calculator-lead";
import { projectPageEstimateLeadMeta } from "@/lib/project-page-estimate-lead";
import {
  isCalculatorStageDiagramUrl,
  isCalculatorStageTextOnly,
  resolveStageDisplayImageUrl,
} from "@/lib/project-calculator-stage-images";
import { resolveFloorsStageTable } from "@/lib/project-calculator-floors-stage";
import {
  applyEngineeringNetworksOnlyPreset,
  applyPrefinishFinishPreset,
} from "@/lib/project-calculator-engineering-preset";
import {
  sanitizeConstructionOptionSelection,
  toggleConstructionOptionSelection,
} from "@/lib/project-calculator-option-selection";
import { useProjectCalculatorQuote } from "@/lib/use-project-calculator-quote";
import { ConstructionStageButtonIcon } from "@/components/construction/construction-stage-button-icon";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { cn } from "@/lib/utils";

const softDivide = "border-[color-mix(in_srgb,var(--text)_8%,transparent)]";

type Tier = { id: string; label: string };

const DEFAULT_TIERS: Tier[] = [
  { id: "gas", label: "Газоблок" },
  { id: "keramzit", label: "Керамзитоблок" },
  { id: "ceramic", label: "Керамический блок" },
  { id: "brick", label: "Кирпич" },
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
  iconKey?: string;
  keywords: string[];
  fallback: string;
}> = [
  { id: "prep", label: "Подготовка", Icon: Hammer, iconKey: "prep", keywords: ["подготов", "разметк", "участ", "проект", "бти", "документ"], fallback: "Организация подготовки стройплощадки по проекту." },
  { id: "foundation", label: "Фундамент", Icon: Layers, iconKey: "foundation", keywords: ["фундамент", "плит", "лент"], fallback: "Устройство основания согласно геологии участка." },
  { id: "walls", label: "Стены", Icon: BrickWall, iconKey: "walls", keywords: ["стен", "коробк", "газобетон", "блок", "кирпич"], fallback: "Возведение несущих и ненесущих стен по проекту." },
  { id: "belt", label: "Пояс", Icon: Minus, iconKey: "belt", keywords: ["пояс", "монолит", "армопояс"], fallback: "Монолитный пояс для распределения нагрузки." },
  { id: "floors", label: "Перекрытия", Icon: LayoutGrid, iconKey: "floors", keywords: ["перекрыт", "плит перек"], fallback: "Перекрытия по несущей схеме дома." },
  { id: "roof", label: "Кровля", Icon: Home, iconKey: "roof", keywords: ["кровл", "стропил"], fallback: "Стропильная система и кровельное покрытие." },
  { id: "windows", label: "Окна", Icon: AppWindow, iconKey: "windows", keywords: ["окн"], fallback: "Остекление по спецификации проекта." },
  { id: "doors", label: "Двери", Icon: DoorOpen, iconKey: "doors", keywords: ["двер"], fallback: "Входная группа и технические проёмы по комплектации." },
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
  fallbackLines: string[],
  floors: PartOfSoulPricingFloors,
): CalculatorStageTable {
  if (stageId === "floors") {
    return resolveFloorsStageTable(ui, floors, tierKey, fallbackLines);
  }
  const fromTier = ui.stagesByTier?.[tierKey]?.[stageId];
  const shared = ui.stages?.[stageId];
  const block = fromTier ?? shared;
  const rows =
    block?.rows?.length ?
      block.rows
    : [{ label: "Состав работ", value: fallbackLines.join("\n\n") }];
  return {
    imageUrl: block?.imageUrl ?? shared?.imageUrl,
    secondaryImageUrl: block?.secondaryImageUrl ?? shared?.secondaryImageUrl,
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
  categoryId,
  partOfSoulContext,
}: {
  project: HouseProjectItem;
  heroTiers: HeroPricingTier[];
  tierIndex: number;
  onTierIndexChange: (index: number) => void;
  calculatorUi: ProjectCalculatorUi;
  coverImageUrl?: string | null;
  categoryId: HouseCalculatorCategoryId | null;
  partOfSoulContext: {
    pricingFloors: PartOfSoulPricingFloors;
    roofPitch: PartOfSoulRoofPitch;
  };
}) {
  const { openModalToEstimate } = useModal();
  const [stageLightboxOpen, setStageLightboxOpen] = useState(false);
  const [stageLightboxIndex, setStageLightboxIndex] = useState(0);
  const calculatorRootRef = useRef<HTMLDivElement>(null);
  const [calculatorRootEl, setCalculatorRootEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setCalculatorRootEl(calculatorRootRef.current);
  }, []);

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
      price: 0,
    }));
  }, [defaultTierDefs, heroTiers]);

  const tierIdx = Math.min(tierIndex, Math.max(0, tabSpecs.length - 1));
  const tier = tabSpecs[tierIdx] ?? tabSpecs[0];
  const priced = tier?.price ?? project.price;
  const tierKey = tier?.id ?? "gas";
  const wallMaterial = tierIdToWallMaterial(tier?.id ?? "gas", tier?.label ?? "");

  const [stageIndex, setStageIndex] = useState(0);
  const flat = useMemo(() => flattenCompletion(project.completion), [project.completion]);
  const stage = STAGES[stageIndex] ?? STAGES[0];
  const fallbackLines = useMemo(() => stageDetails(stage, flat), [flat, stage]);

  const table = useMemo(
    () => resolveStageTable(calculatorUi, tierKey, stage.id, fallbackLines, partOfSoulContext.pricingFloors),
    [calculatorUi, fallbackLines, partOfSoulContext.pricingFloors, stage.id, tierKey]
  );

  const imgSrc = useMemo(
    () =>
      resolveStageDisplayImageUrl({
        stageId: stage.id,
        floors: partOfSoulContext.pricingFloors,
        tierKey,
        tableImageUrl: table.imageUrl,
        coverImageUrl,
      }),
    [coverImageUrl, partOfSoulContext.pricingFloors, stage.id, table.imageUrl, tierKey],
  );

  const isStageDiagram = isCalculatorStageDiagramUrl(imgSrc);
  const secondaryImgSrc = table.secondaryImageUrl?.trim() || null;
  const showSecondaryDiagram =
    Boolean(secondaryImgSrc) && isCalculatorStageDiagramUrl(secondaryImgSrc);
  const isTextOnlyStage = isCalculatorStageTextOnly(stage.id);
  const isCompactList = isStageDiagram || isTextOnlyStage;

  const stageLightboxSlides = useMemo(() => {
    const slides = [{ type: "image" as const, url: imgSrc }];
    if (showSecondaryDiagram && secondaryImgSrc) {
      slides.push({ type: "image" as const, url: secondaryImgSrc });
    }
    return slides;
  }, [imgSrc, secondaryImgSrc, showSecondaryDiagram]);

  const openStageLightbox = (index: number) => {
    setStageLightboxIndex(index);
    setStageLightboxOpen(true);
  };

  const transportBands = useMemo(
    () => normalizeTransportBands(calculatorUi.transportBands),
    [calculatorUi.transportBands],
  );

  const [transportId, setTransportId] = useState(transportBands[0]?.id ?? "unk");
  useEffect(() => {
    const ids = new Set(transportBands.map((b) => b.id));
    if (!ids.has(transportId)) setTransportId(transportBands[0]?.id ?? "unk");
  }, [transportBands, transportId]);

  const selectedTransportBand = transportBands.find((b) => b.id === transportId);

  const catalogMode = Boolean(categoryId);
  const [catalog, setCatalog] = useState<PublicCalculatorCatalog | null>(null);
  const [facadeSlug, setFacadeSlug] = useState<string | null>(null);
  const [engineeringSlugs, setEngineeringSlugs] = useState<Set<string>>(() => new Set());
  const [constructionSlugs, setConstructionSlugs] = useState<Set<string>>(() => new Set());
  const [constructionSummaryOpen, setConstructionSummaryOpen] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;
    const qs = new URLSearchParams({ category: categoryId, wall: wallMaterial });
    void fetch(`/api/calculator-catalog?${qs.toString()}`)
      .then((r) => r.json())
      .then((data: PublicCalculatorCatalog) => {
        if (!cancelled) setCatalog(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [categoryId, wallMaterial]);

  const engineeringList = useMemo(() => [...engineeringSlugs], [engineeringSlugs]);
  const constructionList = useMemo(() => [...constructionSlugs], [constructionSlugs]);

  const { data: quoteData, loading: quoteLoading } = useProjectCalculatorQuote({
    projectSlug: project.slug,
    tierId: tier?.id ?? "gas",
    tierLabel: tier?.label ?? "",
    facadeSlug,
    engineeringSlugs: engineeringList,
    constructionSlugs: constructionList,
    transportBandId: transportId,
    enabled: catalogMode,
  });

  const quoteLineAmounts = useMemo(() => {
    const map = new Map<string, number>();
    const q = quoteData?.quote;
    if (!q) return map;
    for (const line of [...q.engineeringLines, ...q.constructionLines]) {
      map.set(line.id, line.amountRub);
    }
    if (q.facadeTotalRub > 0 && facadeSlug) {
      map.set(`facade:${facadeSlug}`, q.facadeTotalRub);
    }
    return map;
  }, [quoteData?.quote, facadeSlug]);

  const shellPrice = catalogMode && quoteData?.quote ? quoteData.quote.shellTotalRub : priced;
  const facadeTotal = catalogMode && quoteData?.quote ? quoteData.quote.facadeTotalRub : 0;
  const engTotal = catalogMode && quoteData?.quote ? quoteData.quote.engineeringTotalRub : 0;
  const conTotal = catalogMode && quoteData?.quote ? quoteData.quote.constructionTotalRub : 0;
  const surcharge = catalogMode && quoteData?.quote ? quoteData.quote.transportSurchargeRub : 0;

  const catalogQuote = quoteData?.quote;

  const grandTotal = catalogMode && catalogQuote ? catalogQuote.grandTotalRub : 0;

  const leadCalcData = useMemo(() => {
    if (!catalogMode || !catalogQuote || !categoryId) return undefined;
    return buildProjectCalculatorLeadPayload({
      project,
      tierId: tier?.id ?? "gas",
      tierLabel: tier?.label ?? "",
      categoryId,
      quote: catalogQuote,
      facadeSlug,
      engineeringSlugs: engineeringList,
      constructionSlugs: constructionList,
      pricingFloors: partOfSoulContext.pricingFloors,
      roofPitch: partOfSoulContext.roofPitch,
    });
  }, [
    catalogMode,
    catalogQuote,
    categoryId,
    constructionList,
    engineeringList,
    facadeSlug,
    partOfSoulContext.pricingFloors,
    partOfSoulContext.roofPitch,
    project,
    tier?.label,
  ]);

  function toggleEngineering(slug: string) {
    setEngineeringSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleConstruction(slug: string) {
    setConstructionSlugs((prev) => {
      return toggleConstructionOptionSelection(prev, slug);
    });
  }

  function selectEngineeringNetworksAndScroll() {
    const preset = applyEngineeringNetworksOnlyPreset();
    setEngineeringSlugs(preset.engineering);
    setConstructionSlugs(new Set(sanitizeConstructionOptionSelection(preset.construction)));
    document.getElementById("completion-addons")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectPrefinishFinishAndScroll() {
    const preset = applyPrefinishFinishPreset();
    setEngineeringSlugs(preset.engineering);
    setConstructionSlugs(new Set(sanitizeConstructionOptionSelection(preset.construction)));
    document.getElementById("completion-addons")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollDetailLeadForm() {
    openModalToEstimate({
      source: "project-calculator",
      service: `Проект: ${project.title}`,
      calcData: leadCalcData,
    });
  }

  return (
    <>
      <ImageLightbox
        slides={stageLightboxSlides}
        index={stageLightboxIndex}
        open={stageLightboxOpen}
        onClose={() => setStageLightboxOpen(false)}
        onIndexChange={setStageLightboxIndex}
        alt={stage.label}
      />
      <div ref={calculatorRootRef} className="min-w-0">
      <div className="min-w-0 space-y-10">
        {/* Вводный блок */}
        <div className="rounded-[1.75rem] bg-[color-mix(in_srgb,var(--bg-secondary)_50%,var(--bg))] p-6 shadow-[0_16px_44px_rgb(var(--accent-rgb)/0.06)] md:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Калькулятор комплектации
            </span>
          </div>
          {/* Материал стен — сегментированный переключатель */}
          <div className="mt-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Материал стен
            </p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
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
                        ? "bg-[color-mix(in_srgb,var(--accent)_12%,var(--bg))] shadow-[0_4px_18px_rgb(var(--accent-rgb)/0.12)]"
                        : "hover:bg-[color-mix(in_srgb,var(--text)_4%,transparent)] opacity-90 hover:opacity-100",
                    )}
                  >
                    <span className={cn("block text-sm font-semibold leading-snug", active && "text-[var(--accent)]")}>
                      {t.label}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 block tabular-nums text-xs font-medium",
                        active ? "text-[var(--text)]" : "text-[var(--text-muted)]",
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
              const active = i === stageIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStageIndex(i)}
                  aria-pressed={active}
                  className={cn(
                    "flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-2xl px-2 py-3 text-center transition-all duration-200 sm:min-h-[5rem] sm:py-3.5",
                    active
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_6px_20px_rgb(var(--accent-rgb)/0.32)]"
                      : "bg-[color-mix(in_srgb,var(--bg-secondary)_55%,var(--bg))] text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,var(--bg))]",
                  )}
                >
                  <ConstructionStageButtonIcon
                    iconKey={s.iconKey}
                    Lucide={s.Icon}
                    active={active}
                  />
                  <span className="text-[10px] sm:text-[11px] font-semibold leading-tight px-0.5">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Карточка этапа */}
        <article className="overflow-hidden rounded-[1.75rem] bg-[color-mix(in_srgb,var(--bg-secondary)_45%,var(--bg))] shadow-[0_16px_48px_rgb(0_0_0/0.06)]">
          <div
            className={cn(
              isTextOnlyStage || isStageDiagram
                ? "flex flex-col"
                : "grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]",
            )}
          >
            {!isTextOnlyStage ? (
              <div className={cn("w-full", showSecondaryDiagram && "flex flex-col gap-2 bg-[var(--bg)] p-2 sm:gap-3 sm:p-3")}>
                <div
                  className={cn(
                    "relative w-full",
                    isStageDiagram
                      ? showSecondaryDiagram
                        ? "aspect-[16/10] bg-[var(--bg)] sm:aspect-[16/9]"
                        : "aspect-[16/10] bg-[var(--bg)] p-3 sm:aspect-[16/9] sm:p-4 md:aspect-[2/1]"
                      : "aspect-[4/3] bg-[var(--stone)] md:aspect-auto md:min-h-[320px]",
                  )}
                >
                  <CmsImage
                    src={imgSrc}
                    alt=""
                    fill
                    unoptimized={isStageDiagram}
                    className={cn(
                      isStageDiagram
                        ? "bg-[var(--bg)] object-contain object-center"
                        : "object-cover",
                    )}
                    style={isStageDiagram ? { backgroundColor: "var(--bg)" } : undefined}
                    sizes={isStageDiagram ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                  />
                  <button
                    type="button"
                    onClick={() => openStageLightbox(0)}
                    className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                    aria-label="Открыть изображение"
                  />
                  <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md sm:bottom-4 sm:left-4 sm:px-3 sm:py-1.5 sm:text-xs">
                    <ConstructionStageButtonIcon
                      iconKey={stage.iconKey}
                      Lucide={stage.Icon}
                      active
                      size="sm"
                    />
                    {stage.label}
                  </div>
                </div>
                {showSecondaryDiagram && secondaryImgSrc ? (
                  <div className="relative w-full aspect-[16/10] bg-[var(--bg)] sm:aspect-[16/9]">
                    <CmsImage
                      src={secondaryImgSrc}
                      alt=""
                      fill
                      unoptimized
                      className="bg-[var(--bg)] object-contain object-center"
                      style={{ backgroundColor: "var(--bg)" }}
                      sizes="100vw"
                    />
                    <button
                      type="button"
                      onClick={() => openStageLightbox(1)}
                      className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                      aria-label="Открыть второе изображение"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
            <div
              className={cn(
                "flex min-w-0 flex-col",
                isTextOnlyStage
                  ? "p-4 sm:p-5 md:p-6 lg:p-8"
                  : isStageDiagram
                    ? "border-t p-4 sm:p-5 md:p-6"
                    : "border-t p-6 md:border-t-0 md:border-l md:p-8 lg:p-9",
                !isTextOnlyStage && softDivide,
              )}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:text-[11px]">
                  {tier.label}
                </p>
                <h4
                  className={cn(
                    "font-heading leading-tight text-[var(--graphite)]",
                    isCompactList ? "text-lg sm:text-xl" : "text-2xl md:text-[1.65rem]",
                  )}
                >
                  {stage.label}
                </h4>
              </div>
              <div
                className={cn(
                  "flex-1 divide-y divide-[color-mix(in_srgb,var(--text)_7%,transparent)]",
                  isCompactList ? "mt-3 sm:mt-4" : "mt-6",
                )}
              >
                {table.rows.map((row) =>
                  row.section ? (
                    <div
                      key={`section-${row.label}`}
                      className={cn(isCompactList ? "py-2.5 first:pt-0" : "py-3.5 first:pt-0")}
                    >
                      <p
                        className={cn(
                          "font-heading font-semibold uppercase tracking-[0.06em] text-[var(--accent)]",
                          isCompactList ? "text-xs sm:text-[13px]" : "text-sm",
                        )}
                      >
                        {row.label}
                      </p>
                      {row.value ? (
                        <p
                          className={cn(
                            "mt-1 min-w-0 break-words text-[var(--text-muted)]",
                            isCompactList ? "text-[11px] sm:text-xs" : "text-sm",
                          )}
                        >
                          {row.value}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      key={`${row.label}-${row.value.slice(0, 24)}`}
                      className={cn(isCompactList ? "py-2.5" : "py-3.5")}
                    >
                      <p
                        className={cn(
                          "font-semibold text-[var(--text)]",
                          isCompactList ? "text-xs sm:text-[13px]" : "text-sm",
                        )}
                      >
                        {row.label}
                      </p>
                      <p
                        className={cn(
                          "min-w-0 break-words whitespace-pre-line text-[var(--text-muted)]",
                          isCompactList
                            ? "mt-1.5 text-[11px] leading-[1.55] sm:text-xs sm:leading-relaxed"
                            : "mt-2 text-sm leading-relaxed",
                        )}
                      >
                        {row.value}
                      </p>
                    </div>
                  ),
                )}
              </div>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 self-start text-[11px] font-bold text-[var(--accent)] hover:underline sm:mt-4 sm:text-xs"
                onClick={() =>
                  openModalToEstimate(
                    projectPageEstimateLeadMeta({
                      slug: project.slug,
                      title: project.title,
                      materialLabel: tier?.label,
                      clarificationTopic: stage.label,
                    }),
                  )
                }
              >
                Уточнить в смете
              </button>
            </div>
          </div>
        </article>

        {/* Быстрые сценарии */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="flex-1 rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-5 py-4 text-sm font-semibold text-[var(--accent)] transition hover:bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]"
            onClick={selectEngineeringNetworksAndScroll}
          >
            + Инженерные сети и опции
          </button>
          <button
            type="button"
            className="flex-1 rounded-2xl bg-[var(--accent)] px-5 py-4 text-sm font-semibold text-[var(--accent-contrast)] shadow-[0_8px_28px_rgb(var(--accent-rgb)/0.28)] transition hover:bg-[var(--accent-hover)]"
            onClick={selectPrefinishFinishAndScroll}
          >
            Предчистовая отделка
          </button>
        </div>

        {catalogMode && catalog ? (
          <ProjectCalculatorCatalogOptions
            catalog={catalog}
            facadeSlug={facadeSlug}
            onFacadeChange={setFacadeSlug}
            engineeringSlugs={engineeringSlugs}
            onToggleEngineering={toggleEngineering}
            constructionSlugs={constructionSlugs}
            onToggleConstruction={toggleConstruction}
            lineAmounts={quoteLineAmounts}
            quoteLoading={quoteLoading}
            wallMaterial={wallMaterial}
          />
        ) : null}

      </div>
      </div>
      {catalogMode ? (
        <ProjectCalculatorEstimateMobile
          observeRoot={calculatorRootEl}
          projectTitle={project.title}
          areaM2={project.area}
          roofPitch={partOfSoulContext.roofPitch}
          shellPrice={shellPrice}
          facadeTotal={facadeTotal}
          engTotal={engTotal}
          conTotal={conTotal}
          surcharge={surcharge}
          grandTotal={grandTotal}
          quoteLoading={quoteLoading}
          catalogMode={catalogMode}
          facadeSlug={facadeSlug}
          engineeringSlugs={engineeringSlugs}
          constructionSlugs={constructionSlugs}
          engineeringLines={quoteData?.quote.engineeringLines ?? []}
          constructionLines={quoteData?.quote.constructionLines ?? []}
          constructionSummaryOpen={constructionSummaryOpen}
          onConstructionSummaryToggle={() => setConstructionSummaryOpen((value) => !value)}
          transportBands={transportBands}
          transportId={transportId}
          onTransportIdChange={setTransportId}
          onRequestEstimate={scrollDetailLeadForm}
        />
      ) : null}
    </>
  );
}
