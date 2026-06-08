"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { partOfSoulRoofLabels, type PartOfSoulPricingFloors, type PartOfSoulRoofPitch } from "@/lib/part-of-soul-pricing";
import {
  normalizeTransportBands,
  transportBandIndex,
} from "@/lib/project-transport-surcharge";
import { TransportDistanceSlider } from "@/components/construction/transport-distance-slider";
import { ProjectCalculatorCatalogOptions } from "@/components/construction/project-calculator-catalog-options";
import type { PublicCalculatorCatalog } from "@/lib/calculator-catalog";
import type { HouseCalculatorCategoryId } from "@/lib/house-project-calculator-engine";
import { buildProjectCalculatorLeadPayload } from "@/lib/project-calculator-lead";
import {
  isCalculatorStageDiagramUrl,
  resolveStageDisplayImageUrl,
} from "@/lib/project-calculator-stage-images";
import { toggleConstructionOptionSelection } from "@/lib/project-calculator-option-selection";
import { useProjectCalculatorQuote } from "@/lib/use-project-calculator-quote";
import { cn } from "@/lib/utils";

/** Граница без яркой белой обводки в тёмной теме */
const softBorder = "border border-[var(--border)]";
const softDivide = "border-[var(--border)]";

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
  const summaryScrollRef = useRef<HTMLDivElement | null>(null);

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

  const [stageIndex, setStageIndex] = useState(0);
  const flat = useMemo(() => flattenCompletion(project.completion), [project.completion]);
  const stage = STAGES[stageIndex] ?? STAGES[0];
  const fallbackLines = useMemo(() => stageDetails(stage, flat), [flat, stage]);

  const table = useMemo(
    () => resolveStageTable(calculatorUi, tierKey, stage.id, fallbackLines),
    [calculatorUi, fallbackLines, stage.id, tierKey]
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
    void fetch(`/api/calculator-catalog?category=${categoryId}`)
      .then((r) => r.json())
      .then((data: PublicCalculatorCatalog) => {
        if (!cancelled) setCatalog(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

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

  function scrollAddons() {
    document.getElementById("completion-addons")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollDetailLeadForm() {
    openModalToEstimate({
      source: "project-calculator",
      service: `Проект: ${project.title}`,
      calcData: leadCalcData,
    });
  }

  function scrollSummaryFromCard(event: React.WheelEvent<HTMLElement>) {
    const scrollArea = summaryScrollRef.current;
    if (!scrollArea || event.deltaY === 0) return;

    const maxScrollTop = scrollArea.scrollHeight - scrollArea.clientHeight;
    if (maxScrollTop <= 0) return;

    const nextScrollTop = Math.min(Math.max(scrollArea.scrollTop + event.deltaY, 0), maxScrollTop);
    if (nextScrollTop === scrollArea.scrollTop) return;

    event.preventDefault();
    scrollArea.scrollTop = nextScrollTop;
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
          <div
            className={cn(
              isStageDiagram ? "flex flex-col" : "grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]",
            )}
          >
            <div
              className={cn(
                "relative w-full",
                isStageDiagram
                  ? "aspect-[16/10] bg-[#0a0a0a] p-3 sm:aspect-[16/9] sm:p-4 md:aspect-[2/1]"
                  : "aspect-[4/3] bg-[var(--stone)] md:aspect-auto md:min-h-[320px]",
              )}
            >
              <CmsImage
                src={imgSrc}
                alt=""
                fill
                className={cn(
                  isStageDiagram ? "object-contain object-center" : "object-cover",
                )}
                sizes={isStageDiagram ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
              />
              <button
                type="button"
                onClick={() => window.open(imgSrc, "_blank")}
                className="absolute inset-0 z-10 cursor-zoom-in bg-transparent"
                aria-label="Открыть изображение в новой вкладке"
              />
              <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md sm:bottom-4 sm:left-4 sm:px-3 sm:py-1.5 sm:text-xs">
                <StageIcon className="h-3.5 w-3.5" aria-hidden />
                {stage.label}
              </div>
            </div>
            <div
              className={cn(
                "flex flex-col",
                isStageDiagram ? "border-t p-4 sm:p-5 md:p-6" : "border-t p-6 md:border-t-0 md:border-l md:p-8 lg:p-9",
                softDivide
              )}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:text-[11px]">
                  {tier.label}
                </p>
                <h4
                  className={cn(
                    "font-heading leading-tight text-[var(--graphite)]",
                    isStageDiagram ? "text-lg sm:text-xl" : "text-2xl md:text-[1.65rem]",
                  )}
                >
                  {stage.label}
                </h4>
              </div>
              <div className={cn("flex-1", isStageDiagram ? "mt-3 space-y-2.5 sm:mt-4" : "mt-6 space-y-5")}>
                {table.rows.map((row) => (
                  <div
                    key={`${row.label}-${row.value.slice(0, 24)}`}
                    className={cn(
                      "rounded-xl bg-[color-mix(in_srgb,var(--bg-secondary)_70%,var(--bg))]",
                      isStageDiagram ? "p-3 sm:p-3.5" : "rounded-2xl p-4",
                    )}
                  >
                    <p
                      className={cn(
                        "font-semibold text-[var(--text)]",
                        isStageDiagram ? "text-xs sm:text-[13px]" : "text-sm",
                      )}
                    >
                      {row.label}
                    </p>
                    <p
                      className={cn(
                        "whitespace-pre-line text-[var(--text-muted)]",
                        isStageDiagram
                          ? "mt-1.5 text-[11px] leading-[1.55] sm:text-xs sm:leading-relaxed"
                          : "mt-2 text-sm leading-relaxed",
                      )}
                    >
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 self-start text-[11px] font-bold text-[var(--accent)] hover:underline sm:mt-4 sm:text-xs"
                onClick={() => openModalToEstimate()}
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
          />
        ) : null}

      </div>

      {/* Сайдбар итога */}
      <aside className="mt-10 lg:mt-0 lg:sticky lg:top-28 lg:self-start">
        <div
          onWheel={scrollSummaryFromCard}
          className={cn(
            "overflow-hidden rounded-[28px] bg-[var(--bg)] shadow-[0_20px_50px_rgb(0_0_0/0.08)] lg:flex lg:max-h-[calc(100dvh_-_8rem)] lg:flex-col",
            softBorder
          )}
        >
          <div className={cn("shrink-0 p-6 border-b", softDivide)}>
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

          <div
            ref={summaryScrollRef}
            className="min-h-0 px-6 py-5 lg:overflow-y-auto lg:overscroll-contain lg:[-webkit-overflow-scrolling:touch]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">Смета ориентир</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between gap-3">
                <span className="text-[var(--text-muted)]">Коробка</span>
                <span className="shrink-0 tabular-nums font-semibold text-[var(--text)]">
                  {quoteLoading && catalogMode ? "…" : formatRub(shellPrice)}
                </span>
              </li>
              {catalogMode && facadeTotal > 0 ? (
                <li className="flex justify-between gap-3">
                  <span className="text-[var(--text-muted)]">Фасад</span>
                  <span className="shrink-0 tabular-nums font-semibold text-[var(--text)]">{formatRub(facadeTotal)}</span>
                </li>
              ) : null}
              {catalogMode && engTotal > 0 ? (
                <li className={cn("pt-2 border-t", softDivide)}>
                  <p className="text-xs font-semibold text-[var(--text)] mb-2">Инженерия</p>
                  <ul className="space-y-1.5">
                    {quoteData?.quote.engineeringLines.map((row) => (
                      <li key={row.id} className="flex justify-between gap-2 text-xs">
                        <span className="min-w-0 text-[var(--text-muted)] truncate">{row.label}</span>
                        <span className="tabular-nums font-medium text-[var(--text)]">{formatRub(row.amountRub)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : null}
              {catalogMode && conTotal > 0 ? (
                <li className={cn("pt-2 border-t", softDivide)}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-left text-xs font-semibold text-[var(--text)] transition",
                      "hover:bg-[color-mix(in_srgb,var(--accent)_7%,transparent)]"
                    )}
                    onClick={() => setConstructionSummaryOpen((value) => !value)}
                    aria-expanded={constructionSummaryOpen}
                  >
                    <span className="min-w-0">
                      <span>
                        Доп. опции
                        <span className="ml-1 font-medium text-[var(--text-muted)]">
                          ({quoteData?.quote.constructionLines.length ?? 0})
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[11px] font-medium tabular-nums text-[var(--text-muted)]">
                        {formatRub(conTotal)}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform",
                        constructionSummaryOpen && "rotate-180"
                      )}
                      strokeWidth={2}
                      aria-hidden
                    />
                  </button>
                  {constructionSummaryOpen ? (
                    <ul className="mt-2 space-y-1.5">
                      {quoteData?.quote.constructionLines.map((row) => (
                        <li key={row.id} className="flex justify-between gap-2 text-xs">
                          <span className="min-w-0 text-[var(--text-muted)] truncate">{row.label}</span>
                          <span className="tabular-nums font-medium text-[var(--text)]">{formatRub(row.amountRub)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ) : catalogMode ? (
                <li className={cn("pt-2 border-t", softDivide)}>
                  <p className="text-xs text-[var(--text-muted)]">Доп. опции не выбраны</p>
                </li>
              ) : null}
              <li className={cn("pt-3 border-t", softDivide)}>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mb-3">
                  Расстояние до объекта
                </p>
                <TransportDistanceSlider
                  bands={transportBands}
                  valueIndex={transportBandIndex(transportBands, transportId)}
                  onChangeIndex={(index) => {
                    const band = transportBands[index];
                    if (band) setTransportId(band.id);
                  }}
                />
                <div className="mt-3 flex justify-between gap-3 text-sm">
                  <span className="text-[var(--text-muted)]">
                    Транспорт
                  </span>
                  <span className="tabular-nums font-semibold text-[var(--text)]">{formatRub(surcharge)}</span>
                </div>
              </li>
            </ul>
          </div>

          <div className={cn("shrink-0 border-t px-6 pb-6 pt-5", softDivide)}>
            <div className="rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_75%,#1a5c45)] p-5 text-[var(--accent-contrast)] shadow-[0_12px_36px_rgb(var(--accent-rgb)/0.35)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/80">Ориентир итого</p>
              <p className="mt-2 font-heading text-3xl md:text-[2rem] font-bold tabular-nums tracking-tight">
                {quoteLoading && catalogMode ? "…" : formatRub(grandTotal)}
              </p>
              <p className="mt-2 text-[11px] leading-snug text-white/75">
                {formatRub(shellPrice)} коробка
                {catalogMode ?
                  ` + ${formatRub(facadeTotal + engTotal + conTotal)} опции`
                : ""}
                {` + ${formatRub(surcharge)} транспорт`}
              </p>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-[var(--graphite)] py-4 text-sm font-bold text-[var(--bg)] transition hover:opacity-90 dark:bg-[var(--accent-contrast)] dark:text-[var(--graphite)]"
              onClick={scrollDetailLeadForm}
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
