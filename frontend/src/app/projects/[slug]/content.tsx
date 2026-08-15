"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Bath,
  Bed,
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  Maximize2,
  Send,
  ZoomIn,
} from "lucide-react";
import {
  formatRub,
  getEffectiveCalculatorUi,
  getProjectPlans,
  getProjectRenders,
  resolveProjectHeroPricing,
  type HeroPricingTier,
  type HouseProjectItem,
} from "@/lib/construction-data";
import { resolveProjectCategory } from "@/lib/house-project-calculator-quote";
import {
  getHouseCalculatorCategoryParams,
  isHouseCalculatorCategoryId,
  type HouseCalculatorCategoryId,
} from "@/lib/house-project-calculator-engine";
import { resolveSelectedHeroTierPriceOffer } from "@/lib/project-price-offer";
import {
  heroTierIndexForMaterialFilter,
  resolveProjectListingPriceRub,
} from "@/lib/project-listing-price";
import { parseMaterialParam, type MaterialFilterId } from "@/lib/project-filters";
import { HouseProjectCompletionSection } from "@/components/construction/house-project-completion-section";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { CmsImage } from "@/components/ui/cms-image";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { useContactConfig } from "@/lib/contact-config-context";
import { useModal } from "@/lib/modal-context";
import { projectPageEstimateLeadMeta } from "@/lib/project-page-estimate-lead";
import { MESSENGER_CHAT_PHONE_RAW } from "@/lib/constants";
import { maxMessengerChatUrl, telegramChatUrlFromRawPhone } from "@/lib/messenger-links";
import {
  inferPartOfSoulFloors,
  resolveProjectRoofPitch,
  type PartOfSoulRoofPitch,
} from "@/lib/part-of-soul-pricing";
import { formatHouseProjectFloorsLabel } from "@/lib/house-project-floors";
import { cn } from "@/lib/utils";
import { ProjectEngagementBadges } from "@/components/projects/project-engagement-badges";
import { ProjectCompareButton } from "@/components/projects/project-compare-button";
import {
  AUTHOR_HOUSE_PROJECT_CATALOG,
  houseProjectDetailPath,
  type HouseProjectCatalogConfig,
} from "@/lib/house-project-catalog";
import { PAGE_INTRO_PROSE_CLASS } from "@/lib/html-content";
import {
  houseProjectDescriptionHtml,
  houseProjectHeroTeaser,
} from "@/lib/house-project-teaser";

const heroSoftRing = "ring-1 ring-[color-mix(in_srgb,var(--text)_6%,transparent)]";
const carouselArrowClass =
  "absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center p-1 text-white transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/90";

const carouselArrowGlow = {
  filter:
    "drop-shadow(0 0 10px rgba(0,0,0,0.9)) drop-shadow(0 0 4px rgba(255,255,255,0.45)) drop-shadow(0 2px 8px rgba(0,0,0,0.75))",
} as const;

export function HouseProjectDetailContent({
  project,
  similarProjects,
  heroShellTiers,
  catalog = AUTHOR_HOUSE_PROJECT_CATALOG,
  initialMaterial = "all",
}: {
  project: HouseProjectItem;
  similarProjects: HouseProjectItem[];
  heroShellTiers: HeroPricingTier[];
  catalog?: HouseProjectCatalogConfig;
  /** Материал из URL каталога (?material=), если searchParams ещё не гидратировались. */
  initialMaterial?: MaterialFilterId;
}) {
  const searchParams = useSearchParams();
  const materialFromUrl = parseMaterialParam(searchParams.get("material") ?? initialMaterial);
  const renders = getProjectRenders(project);
  const plans = getProjectPlans(project);
  const calculatorUi = useMemo(() => getEffectiveCalculatorUi(project), [project]);
  const posCfg = calculatorUi.partOfSoul;
  const pricingFloors = useMemo(
    () => {
      if (
        project.calculatorCategory &&
        isHouseCalculatorCategoryId(project.calculatorCategory)
      ) {
        return getHouseCalculatorCategoryParams(project.calculatorCategory as HouseCalculatorCategoryId).floors;
      }
      return inferPartOfSoulFloors(project.floors, posCfg?.pricingFloors);
    },
    [project.calculatorCategory, project.floors, posCfg?.pricingFloors]
  );
  /** Явная категория калькулятора важнее старого calculatorJson.partOfSoul.defaultRoof. */
  const roofPitch = useMemo<PartOfSoulRoofPitch>(() => {
    if (
      project.calculatorCategory &&
      isHouseCalculatorCategoryId(project.calculatorCategory)
    ) {
      return getHouseCalculatorCategoryParams(project.calculatorCategory as HouseCalculatorCategoryId).roof;
    }
    if (!posCfg?.enabled) return "dual";
    return resolveProjectRoofPitch(pricingFloors, posCfg.defaultRoof);
  }, [posCfg, pricingFloors, project.calculatorCategory]);

  const effectiveHeroTiers = heroShellTiers;
  const heroResolved = useMemo(() => resolveProjectHeroPricing(project), [project]);

  const calculatorCategoryId = useMemo((): HouseCalculatorCategoryId | null => {
    const explicit =
      project.calculatorCategory &&
      isHouseCalculatorCategoryId(project.calculatorCategory) ?
        (project.calculatorCategory as HouseCalculatorCategoryId)
      : null;
    return resolveProjectCategory({
      calculatorCategory: explicit,
      pricingFloors,
      roofPitch,
    });
  }, [project.calculatorCategory, pricingFloors, roofPitch]);
  const [materialTierIndex, setMaterialTierIndex] = useState(() =>
    heroTierIndexForMaterialFilter(heroShellTiers, materialFromUrl),
  );
  const tierMax = Math.max(0, effectiveHeroTiers.length - 1);
  const tierIdx = Math.min(materialTierIndex, tierMax);

  useEffect(() => {
    setMaterialTierIndex(heroTierIndexForMaterialFilter(effectiveHeroTiers, materialFromUrl));
  }, [effectiveHeroTiers, materialFromUrl]);

  const selectedHeroTier = effectiveHeroTiers[tierIdx] ?? effectiveHeroTiers[0];
  const priceOffer = useMemo(() => {
    const selectedTierPrice =
      selectedHeroTier?.price ?? resolveProjectListingPriceRub(project);
    return resolveSelectedHeroTierPriceOffer(selectedTierPrice);
  }, [selectedHeroTier, project]);
  const [activeRender, setActiveRender] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const slides = useMemo(
    () => [...renders, ...plans].map((media) => ({ type: "image" as const, url: media.url })),
    [plans, renders]
  );

  function openMedia(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  const contact = useContactConfig();
  const { openModalToEstimate } = useModal();
  const active = renders[activeRender] ?? renders[0];

  const telegramHref = telegramChatUrlFromRawPhone(MESSENGER_CHAT_PHONE_RAW);
  const maxMessengerHref = maxMessengerChatUrl(contact.social.maxChat);

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => (a.floor ?? 999) - (b.floor ?? 999)),
    [plans]
  );

  const descriptionHtml = useMemo(
    () => houseProjectDescriptionHtml(project.description ?? ""),
    [project.description]
  );
  const heroTeaser = useMemo(
    () => houseProjectHeroTeaser(project.shortDescription, project.description ?? ""),
    [project.shortDescription, project.description]
  );

  const visibleAnchors = useMemo(() => {
    const base = project.anchors.filter((a) => a.id !== "schedule" && a.id !== "mortgage");
    if (!descriptionHtml) return base;
    if (base.some((a) => a.id === "about")) return base;
    return [{ id: "about", label: "О проекте" }, ...base];
  }, [project.anchors, descriptionHtml]);

  function planSlideIndex(planId: string) {
    const idx = plans.findIndex((p) => p.id === planId);
    return idx >= 0 ? renders.length + idx : renders.length;
  }

  function openEstimateLead() {
    openModalToEstimate(
      projectPageEstimateLeadMeta({
        slug: project.slug,
        title: project.title,
        materialLabel: selectedHeroTier?.label,
        priceRub: selectedHeroTier?.price,
      }),
    );
  }

  const accentColor = "var(--accent)";

  return (
    <>
      <ImageLightbox slides={slides} index={lightboxIndex} open={lightboxOpen} onClose={() => setLightboxOpen(false)} onIndexChange={setLightboxIndex} alt={project.title} />
      <article className="page-top-offset" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <section className="container mx-auto px-5 pb-10 md:pb-16">
          <nav className="text-sm" aria-label="Хлебные крошки" style={{ color: "var(--text-muted)" }}>
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href="/" className="transition hover:text-[var(--accent)]">
                  Главная
                </Link>
              </li>
              <li aria-hidden className="text-[var(--text-subtle)]">
                /
              </li>
              <li>
                <Link href={catalog.basePath} className="transition hover:text-[var(--accent)]">
                  {catalog.detailBreadcrumbLabel}
                </Link>
              </li>
              <li aria-hidden className="text-[var(--text-subtle)]">
                /
              </li>
              <li className="font-medium text-[var(--text)]">{project.title}</li>
            </ol>
          </nav>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.isNew ? (
              <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">Новый проект</span>
            ) : null}
          </div>
          <h1 className="mt-3 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl" style={{ color: "var(--graphite)" }}>
            {project.title}
          </h1>
          {heroTeaser ? (
            <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--text-muted)" }}>
              {heroTeaser}
            </p>
          ) : null}
          {project.builtObjectSlug ? (
            <p className="mt-4">
              <Link
                href={`/portfolio/${project.builtObjectSlug}`}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderColor: "var(--border)" }}
              >
                <Home size={18} className="text-[var(--accent)]" aria-hidden />
                Построенный дом по этому проекту
                <ArrowRight size={16} aria-hidden />
              </Link>
            </p>
          ) : null}

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)]">
            <div className="relative min-h-0 self-start overflow-hidden rounded-[32px] bg-[var(--stone)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
              <div className="absolute right-3 top-3 z-[16] flex flex-col items-end gap-2">
                <ProjectCompareButton
                  slug={project.slug}
                  catalogKind={catalog.kind}
                  variant="detail"
                />
                <ProjectEngagementBadges
                  slug={project.slug}
                  initialViewCount={project.viewCount}
                  initialLikeCount={project.likeCount}
                  recordView
                />
              </div>
              {active ? (
                <button
                  type="button"
                  onClick={() => openMedia(activeRender)}
                  className="relative block h-[58vw] max-h-[640px] min-h-[320px] w-full cursor-zoom-in sm:h-[min(58vw,520px)] sm:min-h-[380px] lg:min-h-[420px]"
                >
                  <CmsImage
                    src={active.url}
                    alt={active.alt || project.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 920px"
                  />
                </button>
              ) : (
                <div className="flex min-h-[420px] items-center justify-center text-[var(--text-subtle)]">Рендер проекта</div>
              )}
              {renders.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Предыдущий рендер"
                    onClick={() => setActiveRender((value) => (value - 1 + renders.length) % renders.length)}
                    className={cn(carouselArrowClass, "left-2 sm:left-4")}
                    style={carouselArrowGlow}
                  >
                    <ChevronLeft size={36} strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Следующий рендер"
                    onClick={() => setActiveRender((value) => (value + 1) % renders.length)}
                    className={cn(carouselArrowClass, "right-2 sm:right-4")}
                    style={carouselArrowGlow}
                  >
                    <ChevronRight size={36} strokeWidth={2} aria-hidden />
                  </button>
                </>
              ) : null}
              {renders.length > 0 ? (
                <div
                  className="pointer-events-none absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium tabular-nums text-white"
                  style={{ backgroundColor: "rgba(15, 20, 18, 0.55)" }}
                >
                  <span className="opacity-90">{renders.length} фото</span>
                </div>
              ) : null}
              {renders.length > 1 ? (
                <div className="grid grid-cols-4 gap-2 bg-[var(--bg)] p-2 sm:gap-3 sm:p-3">
                  {renders.map((render, i) => (
                    <button
                      key={render.id ?? `${render.url}-${i}`}
                      type="button"
                      aria-label={`Показать фото ${i + 1}`}
                      aria-current={i === activeRender}
                      onClick={() => setActiveRender(i)}
                      className={cn(
                        "relative aspect-[4/3] overflow-hidden rounded-2xl transition duration-200",
                        i === activeRender
                          ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
                          : "opacity-78 hover:opacity-100"
                      )}
                    >
                      <CmsImage
                        src={render.url}
                        alt={render.alt || `${project.title}, фото ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 25vw, 220px"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <aside
              className={cn(
                "self-start flex flex-col rounded-[28px] bg-[var(--bg)] p-5 md:p-6 shadow-[0_16px_48px_rgb(var(--accent-rgb)/0.08)]",
                heroSoftRing
              )}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                Параметры проекта
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: "Площадь", value: `${project.area} м²`, Icon: Maximize2 },
                  {
                    label: "Этажность",
                    value: `${formatHouseProjectFloorsLabel(project.floors)} эт.`,
                    Icon: Building2,
                  },
                  { label: "Спальни", value: `${project.rooms} шт.`, Icon: Bed },
                  { label: "Санузлы", value: `${project.bathrooms} шт.`, Icon: Bath },
                ].map(({ label, value, Icon }) => (
                  <div
                    key={label}
                    className="flex gap-2.5 rounded-xl bg-[color-mix(in_srgb,var(--bg-secondary)_55%,var(--bg))] p-3"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-[var(--accent)]"
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                        {label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-bold tabular-nums text-[var(--text)]">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)]">
                  Гарантия от {heroResolved.warrantyYears} лет
                </span>
                <span className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--text)_5%,transparent)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">
                  Срок от {heroResolved.productionMonthsMin} мес.
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-[color-mix(in_srgb,var(--text)_7%,transparent)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Цена строительства
                </p>
                <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
                  <p className="font-heading text-2xl font-bold tabular-nums text-[var(--sale)]">
                    {formatRub(priceOffer.currentRub)}
                  </p>
                  {priceOffer.hasDiscount && priceOffer.standardRub ? (
                    <>
                      <p className="text-sm font-semibold tabular-nums text-[var(--text-muted)] line-through">
                        {formatRub(priceOffer.standardRub)}
                      </p>
                      <p className="rounded-full bg-[color-mix(in_srgb,var(--sale)_12%,transparent)] px-2.5 py-1 text-xs font-semibold text-[var(--sale)]">
                        Выгода {formatRub(priceOffer.discountRub)}
                      </p>
                    </>
                  ) : null}
                </div>
                {project.pricePromo ? (
                  <p className="mt-2 inline-flex rounded-lg bg-[color-mix(in_srgb,var(--sale)_12%,transparent)] px-2.5 py-1 text-xs font-semibold text-[var(--sale)]">
                    {project.pricePromo}
                  </p>
                ) : null}

                <div
                  className="mt-3 space-y-1.5 rounded-2xl bg-[color-mix(in_srgb,var(--stone)_40%,var(--bg-secondary))] p-1.5"
                  role="radiogroup"
                  aria-label="Материал стен и цена"
                >
                  {effectiveHeroTiers.map((t, i) => {
                    const activeTier = i === tierIdx;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={activeTier}
                        onClick={() => setMaterialTierIndex(i)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition",
                          activeTier
                            ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_4px_16px_rgb(var(--accent-rgb)/0.28)]"
                            : "bg-[var(--bg)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,var(--bg))]"
                        )}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-2",
                              activeTier
                                ? "ring-[var(--accent-contrast)] bg-[var(--accent-contrast)]"
                                : "ring-[color-mix(in_srgb,var(--text)_15%,transparent)]"
                            )}
                            aria-hidden
                          >
                            {activeTier ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                            ) : null}
                          </span>
                          <span className={cn("text-sm font-semibold truncate", activeTier && "text-[var(--accent-contrast)]")}>
                            {t.label}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-sm font-bold tabular-nums",
                            activeTier ? "text-[var(--accent-contrast)]" : "text-[var(--text)]"
                          )}
                        >
                          {formatRub(t.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
                  Материал на выбор:{" "}
                  <Link
                    href="/technology/materials"
                    className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
                  >
                    {project.materials.join(", ") || "уточняем при замере"}
                  </Link>
                  . Выбранный вариант синхронизируется с калькулятором ниже.
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  type="button"
                  onClick={openEstimateLead}
                  className="w-full rounded-2xl bg-[var(--accent)] px-4 py-4 text-sm font-bold text-[var(--accent-contrast)] shadow-[0_8px_24px_rgb(var(--accent-rgb)/0.3)] transition hover:bg-[var(--accent-hover)]"
                >
                  Получить смету
                </button>
              </div>

              <div
                className="mt-6 border-t border-[color-mix(in_srgb,var(--text)_7%,transparent)] pt-5 space-y-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <a
                    href={telegramHref ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-[0.96]"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    <Send size={17} strokeWidth={2} aria-hidden />
                    В Telegram
                  </a>
                  {maxMessengerHref ? (
                    <a
                      href={maxMessengerHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-semibold transition hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
                      style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                    >
                      <MaxMessengerIcon className="h-4 w-4 opacity-95" aria-hidden />
                      Max
                    </a>
                  ) : null}
                </div>
                <Link
                  href="/individual-design"
                  className="flex w-full items-center justify-center rounded-full border px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  Создать свой проект
                </Link>
                <Link
                  href="/technology/house-area"
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold text-[var(--accent)] transition hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]"
                >
                  Как считается площадь дома
                  <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <nav
          className="border-y bg-[var(--bg)]"
          style={{ borderColor: "var(--border)" }}
          aria-label="Разделы проекта"
        >
          <div className="container mx-auto flex gap-2 overflow-x-auto px-5 py-3">
            {visibleAnchors.map((anchor) => (
              <a
                key={anchor.id}
                href={`#${anchor.id}`}
                className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                {anchor.label}
              </a>
            ))}
          </div>
        </nav>

        {descriptionHtml ? (
          <section
            id="about"
            className="scroll-mt-[8.5rem] border-b md:scroll-mt-[9rem]"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="container mx-auto max-w-6xl px-5 py-10 md:py-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">О проекте</p>
              <div
                className={cn("mt-4", PAGE_INTRO_PROSE_CLASS)}
                style={{ color: "var(--text-muted)" }}
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>
          </section>
        ) : null}

        <section id="plans" className="scroll-mt-[8.5rem] md:scroll-mt-[9rem]">
          <div className="container mx-auto max-w-6xl px-5 py-10 md:py-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Чертежи проекта</p>
            <h2 className="mt-2 font-heading text-2xl md:text-3xl lg:text-[2rem] text-[var(--graphite)]">
              Планировки и фасады
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)] leading-relaxed">
              План этажа и виды снаружи — нажмите для полноразмерного просмотра.
            </p>

            <div
              className={cn(
                "mt-6 md:mt-8 grid gap-5 lg:grid-cols-2 lg:gap-6",
                "rounded-[24px] bg-[color-mix(in_srgb,var(--bg-secondary)_50%,var(--bg))] p-4 md:p-5",
                heroSoftRing
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[var(--text)]">Планировки</h3>
                  {sortedPlans.length > 0 ? (
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--text)_6%,transparent)] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--text-muted)]">
                      {sortedPlans.length}
                    </span>
                  ) : null}
                </div>
                {sortedPlans.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">
                    Планировки появятся после загрузки в карточке проекта.
                  </p>
                ) : (
                  <div
                    className={cn(
                      "mt-3 grid gap-2.5",
                      sortedPlans.length >= 2 ? "sm:grid-cols-2" : "grid-cols-1"
                    )}
                  >
                    {sortedPlans.map((plan) => {
                      const planTitle =
                        plan.label || (plan.floor != null ? `${plan.floor} этаж` : "Планировка");
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => openMedia(planSlideIndex(plan.id))}
                          className={cn(
                            "group relative overflow-hidden rounded-2xl text-left transition",
                            "bg-[var(--stone)] ring-1 ring-[color-mix(in_srgb,var(--text)_5%,transparent)]",
                            "hover:ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]",
                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                          )}
                        >
                          <div className="relative aspect-[4/3] max-h-[280px] w-full sm:max-h-[240px]">
                            <CmsImage
                              src={plan.url}
                              alt={plan.alt || planTitle}
                              fill
                              className="object-contain p-2 transition duration-300 group-hover:scale-[1.03]"
                              sizes="(max-width: 1024px) 100vw, 360px"
                            />
                            <span
                              className={cn(
                                "pointer-events-none absolute inset-0 flex items-center justify-center",
                                "bg-[color-mix(in_srgb,var(--graphite)_18%,transparent)] opacity-0 transition",
                                "group-hover:opacity-100"
                              )}
                              aria-hidden
                            >
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg)]/95 text-[var(--accent)] shadow-lg">
                                <ZoomIn className="h-5 w-5" strokeWidth={2} />
                              </span>
                            </span>
                          </div>
                          <span className="absolute bottom-2 left-2 rounded-lg bg-[var(--bg)]/92 px-2.5 py-1 text-xs font-semibold text-[var(--text)] shadow-sm backdrop-blur-sm ring-1 ring-[color-mix(in_srgb,var(--text)_6%,transparent)]">
                            {planTitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="min-w-0 lg:border-l lg:border-[color-mix(in_srgb,var(--text)_7%,transparent)] lg:pl-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[var(--text)]">Фасады</h3>
                  {renders.length > 0 ? (
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--text)_6%,transparent)] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[var(--text-muted)]">
                      {renders.length}
                    </span>
                  ) : null}
                </div>
                {renders.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">
                    Визуализации появятся после загрузки рендеров в карточке проекта.
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {renders.map((r, i) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => openMedia(i)}
                        className={cn(
                          "group relative aspect-[5/4] overflow-hidden rounded-2xl",
                          "bg-[var(--stone)] ring-1 ring-[color-mix(in_srgb,var(--text)_5%,transparent)]",
                          "hover:ring-[color-mix(in_srgb,var(--accent)_25%,transparent)]",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                        )}
                      >
                        <CmsImage
                          src={r.url}
                          alt={r.alt || `${project.title}, фасад ${i + 1}`}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-[1.04]"
                          sizes="(max-width: 1024px) 45vw, 280px"
                        />
                        <span
                          className={cn(
                            "pointer-events-none absolute inset-0 flex items-center justify-center",
                            "bg-[color-mix(in_srgb,var(--graphite)_22%,transparent)] opacity-0 transition",
                            "group-hover:opacity-100"
                          )}
                          aria-hidden
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg)]/95 text-[var(--accent)] shadow-lg">
                            <ZoomIn className="h-4 w-4" strokeWidth={2} />
                          </span>
                        </span>
                        {renders.length > 1 ? (
                          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-[var(--bg)]/88 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] backdrop-blur-sm">
                            {i + 1}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section
          id="completion"
          className="scroll-mt-[8.5rem] md:scroll-mt-[9rem] py-16 md:py-20"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="container mx-auto px-5 max-w-6xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Интерактивный расчёт</p>
            <h2 className="mt-2 font-heading text-2xl font-bold leading-tight tracking-tight text-[var(--graphite)] sm:text-3xl md:text-4xl">
              Комплектация и бюджет
            </h2>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
              Соберите стоимость дома «{project.title}»: материал стен, этапы работ, дополнительные опции.
            </p>
            <div className="mt-10 md:mt-12">
              <HouseProjectCompletionSection
                project={project}
                calculatorUi={calculatorUi}
                heroTiers={effectiveHeroTiers}
                tierIndex={tierIdx}
                onTierIndexChange={setMaterialTierIndex}
                coverImageUrl={renders[0]?.url}
                categoryId={calculatorCategoryId}
                partOfSoulContext={{ pricingFloors, roofPitch }}
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-5 py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                Похожие проекты
              </h2>
            </div>
            {project.builtObjectSlug ? (
              <Link
                href={`/portfolio/${project.builtObjectSlug}`}
                className="inline-flex shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderColor: "var(--border)" }}
              >
                Построенный объект
              </Link>
            ) : null}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {similarProjects.map((item) => {
              const cover = getProjectRenders(item)[0];
              return (
                <Link
                  key={item.id}
                  href={houseProjectDetailPath(catalog, item.slug)}
                  className="group overflow-hidden rounded-[24px] border transition-colors hover:bg-[var(--bg-secondary)]"
                  style={{ borderColor: "var(--border)" }}
                >
                  {cover ? (
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--stone)]">
                      <CmsImage
                        src={cover.url}
                        alt={cover.alt || item.title}
                        fill
                        className="scale-[1.03] object-cover object-[center_38%] transition-transform duration-700 group-hover:scale-[1.08]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/10] items-center justify-center bg-[var(--stone)]">
                      <Home className="text-[var(--accent)]" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-heading text-2xl">{item.title}</h3>
                    <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{item.area} м² — от {formatRub(resolveProjectListingPriceRub(item))}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </article>
    </>
  );
}
