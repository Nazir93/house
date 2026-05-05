"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bath,
  Bed,
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  Layers2,
  Mail,
  Maximize2,
  Send,
  Share2,
} from "lucide-react";
import {
  derivePartOfSoulHeroTiers,
  formatRub,
  getEffectiveCalculatorUi,
  getProjectPlans,
  getProjectRenders,
  resolveProjectHeroPricing,
  type HouseProjectItem,
} from "@/lib/construction-data";
import { CompareButton } from "@/components/construction/compare-button";
import { HouseProjectCompletionSection } from "@/components/construction/house-project-completion-section";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { SITE_URL } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";
import { useModal } from "@/lib/modal-context";
import { inferPartOfSoulFloors, partOfSoulRoofOptions, type PartOfSoulRoofPitch } from "@/lib/part-of-soul-pricing";

export function HouseProjectDetailContent({
  project,
  similarProjects,
}: {
  project: HouseProjectItem;
  similarProjects: HouseProjectItem[];
}) {
  const contact = useContactConfig();
  const { openModalToEstimate } = useModal();
  const renders = getProjectRenders(project);
  const plans = getProjectPlans(project);
  const calculatorUi = useMemo(() => getEffectiveCalculatorUi(project), [project]);
  const posCfg = calculatorUi.partOfSoul;
  const pricingFloors = useMemo(
    () => inferPartOfSoulFloors(project.floors, posCfg?.pricingFloors),
    [project.floors, posCfg?.pricingFloors]
  );
  const roofChoices = useMemo(
    () => (posCfg?.enabled ? partOfSoulRoofOptions(pricingFloors) : []),
    [posCfg?.enabled, pricingFloors]
  );
  const [roofPitch, setRoofPitch] = useState<PartOfSoulRoofPitch>("dual");

  useEffect(() => {
    if (!posCfg?.enabled || roofChoices.length === 0) return;
    const preferred = posCfg.defaultRoof && roofChoices.includes(posCfg.defaultRoof) ? posCfg.defaultRoof : roofChoices[0];
    if (!roofChoices.includes(roofPitch)) setRoofPitch(preferred ?? "dual");
  }, [posCfg?.defaultRoof, posCfg?.enabled, roofChoices, roofPitch]);

  const heroResolved = useMemo(() => resolveProjectHeroPricing(project), [project]);
  const effectiveHeroTiers = useMemo(() => {
    if (!posCfg?.enabled || typeof posCfg.smallHouseThresholdSqm !== "number") return heroResolved.tiers;
    return derivePartOfSoulHeroTiers(
      project.area,
      pricingFloors,
      roofPitch,
      heroResolved.tiers,
      posCfg.smallHouseThresholdSqm,
      typeof posCfg.shellSurchargeUnderThreshold === "number" ? posCfg.shellSurchargeUnderThreshold : 0.15
    );
  }, [heroResolved.tiers, posCfg, pricingFloors, project.area, roofPitch]);
  const [materialTierIndex, setMaterialTierIndex] = useState(0);

  useEffect(() => {
    setMaterialTierIndex((idx) => Math.min(idx, Math.max(0, effectiveHeroTiers.length - 1)));
  }, [effectiveHeroTiers.length]);
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

  const active = renders[activeRender] ?? renders[0];

  const telegramShareUrl = useMemo(() => {
    const pageUrl = `${SITE_URL.replace(/\/$/, "")}/projects/${project.slug}`;
    return `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(project.title)}`;
  }, [project.slug, project.title]);

  const mailtoProjectHref = useMemo(() => {
    const email = contact.email.trim();
    if (!email) return null;
    const subject = `Проект «${project.title}»`;
    const body = `Здравствуйте!\n\nИнтересует проект «${project.title}».\n\nСтраница проекта: ${SITE_URL.replace(/\/$/, "")}/projects/${project.slug}\n`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [contact.email, project.slug, project.title]);

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => (a.floor ?? 999) - (b.floor ?? 999)),
    [plans]
  );

  const visibleAnchors = useMemo(
    () => project.anchors.filter((a) => a.id !== "schedule" && a.id !== "mortgage"),
    [project.anchors]
  );

  function planSlideIndex(planId: string) {
    const idx = plans.findIndex((p) => p.id === planId);
    return idx >= 0 ? renders.length + idx : renders.length;
  }

  function scrollToCompletion() {
    document.getElementById("completion")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const accentColor = "var(--accent)";

  return (
    <>
      <ImageLightbox slides={slides} index={lightboxIndex} open={lightboxOpen} onClose={() => setLightboxOpen(false)} onIndexChange={setLightboxIndex} alt={project.title} />
      <article className="pt-24" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
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
                <Link href="/projects" className="transition hover:text-[var(--accent)]">
                  Проекты
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
          <h1 className="mt-3 font-heading text-4xl leading-tight md:text-5xl lg:text-6xl" style={{ color: "var(--graphite)" }}>
            {project.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--text-muted)" }}>
            {project.shortDescription}
          </p>
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

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] lg:items-start">
            <div className="relative min-h-0 overflow-hidden rounded-[32px] bg-[var(--stone)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
              {active ? (
                <button type="button" onClick={() => openMedia(activeRender)} className="relative block min-h-[320px] w-full cursor-zoom-in sm:min-h-[380px] lg:min-h-[420px]">
                  <img src={active.url} alt={active.alt || project.title} className="h-[58vw] max-h-[640px] min-h-[320px] w-full object-cover sm:h-[min(58vw,520px)]" />
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
                    className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white/95 text-[var(--accent)] shadow-md transition hover:bg-white"
                    style={{ borderColor: "var(--accent)" }}
                  >
                    <ChevronLeft size={22} strokeWidth={2.25} />
                  </button>
                  <button
                    type="button"
                    aria-label="Следующий рендер"
                    onClick={() => setActiveRender((value) => (value + 1) % renders.length)}
                    className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white/95 text-[var(--accent)] shadow-md transition hover:bg-white"
                    style={{ borderColor: "var(--accent)" }}
                  >
                    <ChevronRight size={22} strokeWidth={2.25} />
                  </button>
                  <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                    {renders.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Слайд ${i + 1}`}
                        aria-current={i === activeRender}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveRender(i);
                        }}
                        className="pointer-events-auto h-2.5 w-2.5 rounded-full transition-all"
                        style={{
                          backgroundColor: i === activeRender ? "var(--accent)" : "rgba(255,255,255,0.55)",
                          boxShadow: i === activeRender ? "0 0 0 2px rgba(255,255,255,0.9)" : "0 0 0 1px rgba(0,0,0,0.12)",
                        }}
                      />
                    ))}
                  </div>
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
            </div>

            <aside
              className="rounded-[28px] border bg-[var(--bg)] p-5 shadow-sm md:p-6 dark:bg-[var(--bg-secondary)]"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-sm font-semibold" style={{ color: accentColor }}>
                Характеристики
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Площадь",
                    value: `${project.area} м²`,
                    Icon: Maximize2,
                  },
                  {
                    label: "Этажность",
                    value: `${project.floors} эт.`,
                    Icon: Building2,
                  },
                  {
                    label: "Количество спален",
                    value: `${project.rooms} шт.`,
                    Icon: Bed,
                  },
                  {
                    label: "Количество санузлов",
                    value: `${project.bathrooms} шт.`,
                    Icon: Bath,
                  },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="flex gap-3 rounded-2xl border p-3 sm:p-4" style={{ borderColor: "var(--border)" }}>
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] dark:bg-white/[0.06]"
                      style={{ color: accentColor }}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.85} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium leading-snug sm:text-xs" style={{ color: "var(--text-muted)" }}>
                        {label}
                      </p>
                      <p className="truncate text-sm font-bold tabular-nums sm:text-base">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <div className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-white" style={{ backgroundColor: accentColor }}>
                  Гарантия {heroResolved.warrantyYears} лет
                </div>
                <div className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-white" style={{ backgroundColor: accentColor }}>
                  Срок изготовления от {heroResolved.productionMonthsMin} мес.
                </div>
              </div>

              <p className="mt-8 text-sm font-semibold" style={{ color: accentColor }}>
                Цена строительства
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {effectiveHeroTiers.map((t, i) => {
                  const activeTier = i === materialTierIndex;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={activeTier}
                      aria-label={`${t.label}, ${formatRub(t.price)}`}
                      onClick={() => setMaterialTierIndex(i)}
                      className={`flex flex-col rounded-2xl border-2 px-3 py-4 text-center transition ${
                        activeTier ? "text-white shadow-sm" : "bg-[var(--bg-secondary)] hover:opacity-95 dark:bg-[var(--bg)]"
                      }`}
                      style={
                        activeTier
                          ? { borderColor: accentColor, backgroundColor: accentColor }
                          : { borderColor: "var(--border)" }
                      }
                    >
                      <span className="mx-auto flex h-10 w-12 items-center justify-center rounded-lg bg-white/20">
                        <span className="block h-7 w-10 rounded-sm bg-white/90 shadow-inner" aria-hidden />
                      </span>
                      <span className="mt-2 text-xs font-bold leading-tight sm:text-[13px]">{t.label}</span>
                      <span className={`mt-2 text-[11px] font-semibold tabular-nums leading-tight sm:text-xs ${activeTier ? "text-white/95" : ""}`}>
                        {formatRub(t.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {project.pricePromo ? <p className="mt-4 text-sm font-medium leading-snug text-[var(--accent)]">{project.pricePromo}</p> : null}

              <button
                type="button"
                onClick={scrollToCompletion}
                className="mt-5 w-full rounded-2xl px-4 py-4 text-center text-sm font-bold uppercase tracking-[0.1em] text-white shadow-sm transition hover:opacity-[0.94]"
                style={{ backgroundColor: accentColor }}
              >
                Получить смету
              </button>
              <button
                type="button"
                onClick={openModalToEstimate}
                className="mt-2 w-full rounded-2xl border-2 py-3 text-center text-xs font-semibold transition hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
                style={{ borderColor: accentColor, color: accentColor }}
              >
                Ориентировочный расчёт в один клик
              </button>

              <div className="mt-5 text-sm" style={{ color: "var(--text-muted)" }}>
                <p>
                  Материал стен (по желанию):{" "}
                  <Link href="/technology/materials" className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline">
                    {project.materials.join(", ") || "на выбор"}
                  </Link>
                </p>
              </div>
            </aside>
          </div>

          <div
            className="mt-10 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex flex-wrap gap-2">
              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-[0.96] min-[480px]:flex-none"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <Send size={18} strokeWidth={2} aria-hidden />
                В Telegram
                <Share2 size={16} className="opacity-90" aria-hidden />
              </a>
              {mailtoProjectHref ? (
                <a
                  href={mailtoProjectHref}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition hover:bg-black/[0.03] min-[480px]:flex-none dark:hover:bg-white/[0.06]"
                  style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                >
                  <Mail size={18} strokeWidth={2} aria-hidden />
                  На почту
                  <Layers2 size={16} className="opacity-80" aria-hidden />
                </a>
              ) : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <CompareButton projectId={project.id} className="w-full justify-center sm:w-auto sm:min-w-[10rem]" />
              <Link
                href="/individual-design"
                className="inline-flex w-full justify-center rounded-full border px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] sm:w-auto"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                Создать свой проект
              </Link>
              <Link href="/technology/house-area" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[var(--accent)] sm:justify-start">
                Как считается площадь дома <ArrowRight size={15} />
              </Link>
            </div>
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

        <section id="plans" className="scroll-mt-[8.5rem] md:scroll-mt-[9rem]">
          <div className="container mx-auto px-5 py-14">
            <h2 className="font-heading text-3xl text-[#1d3557] md:text-4xl dark:text-[var(--text)]">Планировки и фасады</h2>
            <p className="mt-3 max-w-3xl text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
              План этажа и виды дома снаружи. Нажмите изображение, чтобы открыть полноразмерный просмотр.
              {sortedPlans.length >= 2 ? " На широком экране несколько планов показываются рядом." : ""}
            </p>
            <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-14">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                  Планировки
                </p>
                {sortedPlans.length === 0 ? (
                  <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
                    Планировки появятся после загрузки в карточке проекта.
                  </p>
                ) : (
                  <div className={`mt-4 grid gap-4 ${sortedPlans.length >= 2 ? "sm:grid-cols-2" : ""}`}>
                    {sortedPlans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => openMedia(planSlideIndex(plan.id))}
                        className="group overflow-hidden rounded-[24px] border bg-[var(--bg)] text-left shadow-sm transition hover:border-[#778da9]"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <div className="relative flex max-h-[min(70vh,560px)] min-h-[220px] items-center justify-center bg-[var(--stone)] p-3 sm:min-h-[260px]">
                          <img
                            src={plan.url}
                            alt={plan.alt || plan.label || project.title}
                            className="max-h-[min(68vh,520px)] w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="border-t p-4 font-semibold" style={{ borderColor: "var(--border)" }}>
                          {plan.label || (plan.floor != null ? `${plan.floor} этаж` : "Планировка")}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                  Фасады
                </p>
                {renders.length === 0 ? (
                  <p className="mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
                    Визуализации появятся после загрузки рендеров в карточке проекта.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {renders.map((r, i) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => openMedia(i)}
                        className="group overflow-hidden rounded-2xl border bg-[var(--stone)] shadow-sm transition hover:border-[#778da9]"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <img
                          src={r.url}
                          alt={r.alt || `${project.title}, фасад ${i + 1}`}
                          className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="completion" className="scroll-mt-[8.5rem] md:scroll-mt-[9rem] py-16" style={{ backgroundColor: "var(--bg-secondary)" }}>
          <div className="container mx-auto px-5">
            <h2 className="font-heading text-3xl md:text-4xl">Комплектация</h2>
            <div className="mt-8">
              <HouseProjectCompletionSection
                project={project}
                calculatorUi={calculatorUi}
                heroTiers={effectiveHeroTiers}
                tierIndex={materialTierIndex}
                onTierIndexChange={setMaterialTierIndex}
                coverImageUrl={renders[0]?.url}
                partOfSoulContext={
                  posCfg?.enabled
                    ? {
                        pricingFloors,
                        roofPitch,
                        roofChoices,
                        setRoofPitch,
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-5 py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl">Похожие проекты</h2>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--text-muted)" }}>
                Подбираем по площади и цене. Если по проекту уже есть готовый объект — ссылка на него вверху страницы и ниже.
              </p>
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
            {similarProjects.map((item) => (
              <Link key={item.id} href={`/projects/${item.slug}`} className="rounded-[24px] border p-5 transition-colors hover:bg-[var(--bg-secondary)]" style={{ borderColor: "var(--border)" }}>
                <Home className="mb-4 text-[var(--accent)]" />
                <h3 className="font-heading text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{item.area} м² - {formatRub(item.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
