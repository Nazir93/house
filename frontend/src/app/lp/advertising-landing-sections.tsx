"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileCheck2,
  Landmark,
  MapPin,
  MessageCircle,
  MonitorSmartphone,
  Phone,
  Scale,
  ShieldCheck,
  Star,
  type LucideIcon,
} from "lucide-react";

import { CmsImage } from "@/components/ui/cms-image";
import {
  ADVERTISING_LP_FACT_STATS,
  ADVERTISING_OFFICE_GEO,
  MATERIAL_COMPARISON_ROWS,
  advertisingLandingCatalogIntro,
  advertisingLandingCatalogNote,
  advertisingLandingFactsIntro,
  type AdvertisingLandingConfig,
} from "@/lib/advertising-landing";
import { LP_WORK_STEPS, resolveLpThemeSpec, type LpThemeSpec } from "@/lib/lp-themes";
import type { PublicReviewItem } from "@/lib/get-public-reviews";
import {
  builtObjectMaterialLabel,
  formatRub,
  getBuiltObjectCover,
  type BuiltObjectItem,
} from "@/lib/construction-shared";
import type { HouseProjectItem } from "@/lib/construction-data";
import { METRIKA_GOALS, trackMetrikaGoal } from "@/lib/analytics-goals";
import { PHONE, PHONE_RAW, SOCIAL_LINKS } from "@/lib/constants";
import { LP_GUARANTEE_ITEMS, LP_GUARANTEES_INTRO, type LpGuaranteeItem } from "@/lib/lp-guarantees";
import { LpContactCta, lpProjectCardLeadMeta, lpServiceLabel } from "./lp-contact-cta";
import { resolveProjectListingPriceRub } from "@/lib/project-listing-price";
import { revealDelayStyle } from "@/lib/reveal-animation";
import { cn } from "@/lib/utils";

const LP_GUARANTEE_ICONS: Record<LpGuaranteeItem["icon"], LucideIcon> = {
  shield: ShieldCheck,
  estimate: FileCheck2,
  quality: ClipboardCheck,
  cabinet: MonitorSmartphone,
};

/** Премиальная карточка без обводки — только мягкая тень и фон. */
const lpSoftCard =
  "rounded-[1.6rem] bg-[var(--bg)] shadow-[0_18px_48px_rgba(15,61,46,0.07)]";
const lpSoftCardAlt =
  "rounded-[1.6rem] bg-[color-mix(in_srgb,var(--bg-secondary)_92%,var(--accent)_4%)] shadow-[0_16px_44px_rgba(15,61,46,0.06)]";

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
      {children}
    </p>
  );
}

function projectCover(project: HouseProjectItem): string | null {
  return project.media.find((item) => item.type === "RENDER")?.url ?? project.media[0]?.url ?? null;
}

function LpFactStatCard({
  stat,
  index,
}: {
  stat: (typeof ADVERTISING_LP_FACT_STATS)[number];
  index: number;
}) {
  const body = (
    <>
      <p className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-bold leading-none tracking-tight text-[var(--text)] whitespace-nowrap">
        {stat.value}
      </p>
      <p
        className="mt-2.5 flex min-h-[2.5rem] max-w-[11.5rem] items-start justify-center text-[11px] font-semibold uppercase leading-snug tracking-[0.08em]"
        style={{ color: "var(--text-muted)" }}
      >
        {stat.label}
      </p>
    </>
  );

  const shellClass = cn(
    "flex h-full flex-col items-center justify-start text-center transition",
    stat.href && "rounded-xl hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]",
  );

  if (stat.href && stat.external) {
    return (
      <a
        href={stat.href}
        target="_blank"
        rel="noopener noreferrer"
        data-reveal="card"
        style={revealDelayStyle(index)}
        className={shellClass}
      >
        {body}
      </a>
    );
  }

  if (stat.href) {
    return (
      <Link href={stat.href} data-reveal="card" style={revealDelayStyle(index)} className={shellClass}>
        {body}
      </Link>
    );
  }

  return (
    <article data-reveal="card" style={revealDelayStyle(index)} className={shellClass}>
      {body}
    </article>
  );
}

export function LpFactsSection({ config, theme }: { config: AdvertisingLandingConfig; theme?: LpThemeSpec }) {
  const intro = advertisingLandingFactsIntro(config);
  const spec = theme ?? resolveLpThemeSpec(config);

  return (
    <section className="py-10 md:py-14" style={{ backgroundColor: spec.sectionAltBg }}>
      <div className="container mx-auto max-w-4xl px-5 text-center" data-reveal="section">
        <SectionEyebrow>Факты о компании</SectionEyebrow>
        <h2 className="mx-auto mt-3 max-w-3xl text-balance font-heading text-xl font-bold leading-snug tracking-tight md:text-2xl">
          {config.h1}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed md:text-[15px]" style={{ color: "var(--text-muted)" }}>
          {intro}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {ADVERTISING_LP_FACT_STATS.map((stat, index) => (
            <LpFactStatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        <p className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <MapPin className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
          <span>
            {ADVERTISING_OFFICE_GEO.city}, {ADVERTISING_OFFICE_GEO.regions} · {ADVERTISING_OFFICE_GEO.address}
          </span>
        </p>
      </div>
    </section>
  );
}

export function LpGuaranteesSection() {
  return (
    <section id="guarantees" className="scroll-mt-24 py-10 sm:py-12 md:py-14" style={{ backgroundColor: "var(--bg)" }}>
      <div className="container mx-auto px-4 sm:px-5" data-reveal="section">
        <div className="w-full">
          <SectionEyebrow>Гарантии и сроки</SectionEyebrow>
          <h2 className="mt-3 w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Спокойствие на всём пути строительства
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed md:text-[15px]" style={{ color: "var(--text-muted)" }}>
            {LP_GUARANTEES_INTRO}
          </p>
        </div>
        <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {LP_GUARANTEE_ITEMS.map(({ icon, title, text }, index) => {
            const Icon = LP_GUARANTEE_ICONS[icon];
            return (
              <article
                key={title}
                data-reveal="card"
                style={revealDelayStyle(index)}
                className={cn(lpSoftCardAlt, "flex h-full flex-col p-4 sm:p-5")}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
                </span>
                <h3 className="mt-3 min-h-[2.75rem] font-heading text-base font-bold leading-snug tracking-tight sm:text-lg">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LpProjectsSection({
  config,
  projects,
  primaryCta,
  theme,
}: {
  config: AdvertisingLandingConfig;
  projects: HouseProjectItem[];
  primaryCta: string;
  theme?: LpThemeSpec;
}) {
  const catalogIntro = advertisingLandingCatalogIntro(config);
  const catalogNote = advertisingLandingCatalogNote(config);
  const spec = theme ?? resolveLpThemeSpec(config);
  const isCarousel = spec.projectsLayout === "carousel";

  return (
    <section id="projects" className="scroll-mt-24 py-14 md:py-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto px-4 sm:px-5" data-reveal="section">
        <div className="w-full">
          <h2 className="w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Каталог проектов
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-relaxed md:mt-5 md:text-base" style={{ color: "var(--text-muted)" }}>
            {catalogIntro}
          </p>
          {catalogNote ? (
            <p className="mt-3 max-w-4xl text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {catalogNote}
            </p>
          ) : null}
        </div>

        <div
          className={
            isCarousel
              ? "mt-8 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-10 sm:gap-5 [&::-webkit-scrollbar]:hidden"
              : "mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2 xl:grid-cols-3"
          }
        >
          {projects.map((project, index) => {
            const listingPrice = resolveProjectListingPriceRub(project, "all");
            return (
            <article
              key={project.slug}
              data-reveal="card"
              style={revealDelayStyle(index)}
              className={cn(
                "group overflow-hidden transition hover:-translate-y-1",
                lpSoftCard,
                isCarousel && "min-w-[min(88vw,300px)] shrink-0 snap-start sm:min-w-[320px] md:min-w-[360px]",
              )}
            >
              <Link href={`/projects/${project.slug}`} className="block">
                <div className="relative min-h-48 overflow-hidden sm:min-h-56">
                  <CmsImage
                    src={projectCover(project)}
                    alt={project.title}
                    fill
                    sizes={isCarousel ? "360px" : "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"}
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              </Link>
              <div className="p-5">
                <Link href={`/projects/${project.slug}`} className="font-heading text-xl font-bold hover:text-[var(--accent)]">
                  {project.title}
                </Link>
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  {project.area} м² · {project.floors} этаж · {project.rooms} комн.
                </p>
                <p className="mt-4 text-lg font-bold text-[var(--accent)]">
                  {listingPrice > 0 ? `от ${formatRub(listingPrice)}` : "Цена по запросу"}
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--bg-secondary)_80%,transparent)] px-4 text-sm font-bold transition hover:bg-[color-mix(in_srgb,var(--accent)_12%,var(--bg-secondary))]"
                    style={{ color: "var(--text)" }}
                  >
                    Подробнее
                  </Link>
                  <LpContactCta
                    {...lpProjectCardLeadMeta(config, project)}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-bold transition hover:opacity-95"
                    style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                  >
                    {primaryCta}
                  </LpContactCta>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LpIncludesSection({ items }: { items: string[] }) {
  return (
    <section id="includes" className="scroll-mt-24 py-12 sm:py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto px-4 sm:px-5" data-reveal="section">
        <div className="w-full max-w-3xl">
          <SectionEyebrow>Что входит в стоимость</SectionEyebrow>
          <h2 className="mt-3 w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Прозрачная смета до договора
          </h2>
          <p className="mt-4 text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
            Показываем состав работ и комплектацию заранее — без «сюрпризов» на этапе стройки.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-2 xl:gap-4">
          {items.map((item, index) => (
            <div
              key={item}
              data-reveal="card"
              style={revealDelayStyle(index, 50, 350)}
              className={cn(lpSoftCard, "flex gap-3 p-4 sm:gap-4 md:p-5")}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
              >
                {index + 1}
              </span>
              <p className="text-sm font-semibold leading-relaxed md:text-base">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LpMaterialComparisonSection({
  highlightMaterial,
  theme,
}: {
  highlightMaterial?: AdvertisingLandingConfig["highlightMaterial"];
  theme?: LpThemeSpec;
}) {
  const spec = theme ?? resolveLpThemeSpec({ slug: "kirpich" });

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: spec.sectionAltBg ?? "var(--bg)" }}>
      <div className="container mx-auto px-4 sm:px-5" data-reveal="section">
        <div className="w-full">
          <SectionEyebrow>Один дом — три технологии</SectionEyebrow>
          <h2 className="mt-3 w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Газобетон, кирпич и керамоблок
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed md:text-[15px]" style={{ color: "var(--text-muted)" }}>
            Сравним по бюджету, скорости, нагрузке на фундамент и тепловой инерции — и подберём оптимальный вариант под ваш участок.
          </p>
        </div>

        <div className="mt-8 grid items-stretch gap-5 md:mt-10 md:grid-cols-3">
          {MATERIAL_COMPARISON_ROWS.map((row) => {
            const highlighted = highlightMaterial === row.id;
            return (
              <div key={row.id} className="flex h-full flex-col" data-reveal="card">
                <div className="mb-2 flex min-h-[1.75rem] items-center justify-center">
                  {row.badgeAbove ? (
                    <span
                      className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent-contrast)]"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      {row.badgeAbove}
                    </span>
                  ) : (
                    <span className="invisible text-[10px]" aria-hidden>
                      —
                    </span>
                  )}
                </div>
                <article
                  className={cn(
                    "flex h-full flex-col p-5 sm:p-6",
                    highlighted ? lpSoftCard : lpSoftCardAlt,
                    highlighted && "ring-2 ring-[var(--accent)]/35",
                  )}
                >
                  <h3 className="min-h-[3.25rem] font-heading text-lg font-bold leading-snug tracking-tight sm:text-xl">
                    {row.label}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--accent)" }}>
                    {row.thicknessNote}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {row.lead}
                  </p>
                  <ul className="mt-4 flex-1 space-y-2 text-sm leading-snug">
                    {row.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                        <span style={{ color: "var(--text-muted)" }}>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t pt-3 text-sm font-medium leading-relaxed" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                    {row.suitsIf}
                  </p>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LpPortfolioSection({ objects }: { objects: BuiltObjectItem[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || tracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          tracked.current = true;
          trackMetrikaGoal(METRIKA_GOALS.portfolioView);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!objects.length) return null;

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="scroll-mt-24 py-16 md:py-24"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="container mx-auto px-4 sm:px-5" data-reveal="section">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-none md:flex-1">
            <SectionEyebrow>Портфолио</SectionEyebrow>
            <h2 className="mt-3 w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Построенные дома
            </h2>
            <p className="mt-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Реальные объекты компании — материалы, планировки и качество исполнения, которое можно увидеть на экскурсии.
            </p>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:text-[var(--accent)] hover:underline"
          >
            Все объекты
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {objects.map((object, index) => (
            <Link
              key={object.slug}
              href={`/portfolio/${object.slug}`}
              data-reveal="card"
              style={revealDelayStyle(index)}
              className={cn(lpSoftCard, "group overflow-hidden transition hover:-translate-y-1")}
            >
              <div className="relative min-h-44 overflow-hidden">
                <CmsImage
                  src={getBuiltObjectCover(object)?.url ?? null}
                  alt={object.title}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-4">
                <p className="font-heading text-lg font-bold">{object.title}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  {builtObjectMaterialLabel(object.material)}
                  {object.area ? ` · ${object.area} м²` : ""}
                  {object.location ? ` · ${object.location}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LpMortgageSection({ config }: { config?: AdvertisingLandingConfig }) {
  const slug = config?.slug ?? "lp";
  const service = config ? lpServiceLabel(config) : undefined;
  return (
    <section id="mortgage" className="scroll-mt-24 py-12 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-5" data-reveal="section">
        <div
          className="grid gap-6 overflow-hidden rounded-[1.5rem] p-5 shadow-[0_22px_60px_rgba(15,61,46,0.08)] sm:gap-8 sm:rounded-[2rem] sm:p-8 md:grid-cols-[1fr_0.9fr] md:p-10"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, var(--bg)) 0%, var(--bg-secondary) 55%, var(--bg) 100%)",
          }}
        >
          <div>
            <SectionEyebrow>Ипотека на строительство</SectionEyebrow>
            <h2 className="mt-3 w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Можно строить дом с ипотекой
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Подскажем по программам на ИЖС, поможем собрать документы и согласуем этапы финансирования со стройкой.
            </p>
            <ul className="mt-6 space-y-3 text-sm font-semibold">
              <li className="flex gap-3">
                <Landmark className="h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
                Семейная ипотека и программы на строительство
              </li>
              <li className="flex gap-3">
                <Scale className="h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
                Ориентир по платежу до одобрения банка
              </li>
              <li className="flex gap-3">
                <Building2 className="h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
                Поэтапная оплата работ по договору
              </li>
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/mortgage"
                className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
              >
                Калькулятор и программы
              </Link>
              <LpContactCta
                source={`lp-${slug}-mortgage`}
                service={service}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-6 text-sm font-bold shadow-sm transition hover:bg-[var(--bg)]"
                style={{ color: "var(--text)" }}
              >
                Консультация по ипотеке
              </LpContactCta>
            </div>
          </div>
          <div className={cn(lpSoftCard, "flex flex-col justify-center p-6")} data-reveal="card">
            <Star className="h-8 w-8 text-[var(--accent)]" aria-hidden />
            <p className="mt-4 font-heading text-2xl font-bold">Сначала расчёт — потом банк</p>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Оставьте контакты — менеджер уточнит бюджет, комплектацию и подскажет реалистичный маршрут по ипотеке и стройке.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LpStepsSection({ config }: { config: AdvertisingLandingConfig }) {
  const intro =
    config.stepsIntro ??
    "От первой заявки до ключей — с фиксированной сметой, понятным графиком и сопровождением на каждом этапе.";

  return (
    <section className="py-12 sm:py-16 md:py-24" style={{ backgroundColor: "var(--bg)" }}>
      <div className="container mx-auto px-4 sm:px-5" data-reveal="section">
        <div className="w-full">
          <SectionEyebrow>Как мы работаем</SectionEyebrow>
          <h2 className="mt-3 w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            4 этапа до готового дома
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
            {intro}
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
          {LP_WORK_STEPS.map((step, index) => (
            <article
              key={step.step}
              data-reveal="card"
              style={revealDelayStyle(index)}
              className={cn(lpSoftCardAlt, "p-5 md:p-6")}
            >
              <p className="font-heading text-3xl font-bold text-[var(--accent)]">{step.step}</p>
              <h3 className="mt-3 font-heading text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LpReviewStars({ rating }: { rating: number }) {
  const n = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <div className="flex gap-0.5 text-[var(--accent)]" aria-label={`Оценка ${n} из 5`}>
      {Array.from({ length: n }, (_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} aria-hidden />
      ))}
    </div>
  );
}

export function LpReviewsSection({
  config,
  reviews,
}: {
  config: AdvertisingLandingConfig;
  reviews: PublicReviewItem[];
}) {
  const intro =
    config.reviewsIntro ??
    "Клиенты отмечают прозрачную смету, внимание к деталям и возможность посмотреть дом на объекте до принятия решения.";
  const items = reviews.slice(0, 3);
  if (!items.length) return null;

  return (
    <section className="py-12 sm:py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto px-4 sm:px-5" data-reveal="section">
        <div className="w-full">
          <SectionEyebrow>Отзывы клиентов</SectionEyebrow>
          <h2 className="mt-3 w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Что говорят заказчики
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
            {intro}
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3">
          {items.map((review, index) => {
            const initial = review.authorName.trim().charAt(0).toUpperCase();
            const meta = [review.objectName, review.serviceLabel].filter(Boolean).join(" · ");
            return (
              <article
                key={review.id}
                data-reveal="card"
                style={revealDelayStyle(index)}
                className={cn(lpSoftCard, "flex h-full flex-col p-5 md:p-6")}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-heading text-lg font-bold"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--accent) 15%, var(--bg))",
                      color: "var(--accent)",
                    }}
                    aria-hidden
                  >
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <LpReviewStars rating={review.rating} />
                    <p className="mt-1.5 font-semibold">{review.authorName}</p>
                    {meta ? (
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                        {meta}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {review.text}
                </p>
              </article>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:text-[var(--accent)] hover:underline"
          >
            Все отзывы
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LpExcursionSection({
  title,
  lead,
  config,
}: {
  title: string;
  lead: string;
  config?: AdvertisingLandingConfig;
}) {
  const slug = config?.slug ?? "lp";
  const service = config ? lpServiceLabel(config) : undefined;

  return (
    <section className="py-12 sm:py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto px-4 sm:px-5" data-reveal="section">
        <div className={cn(lpSoftCard, "grid gap-6 p-5 sm:gap-8 sm:p-8 md:grid-cols-[1.05fr_0.95fr] md:p-10")}>
          <div>
            <SectionEyebrow>Экскурсия на объект</SectionEyebrow>
            <h2 className="mt-3 w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{title}</h2>
            <p className="mt-4 max-w-2xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {lead}
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <div className={cn(lpSoftCardAlt, "flex items-start gap-3 p-4")} data-reveal="card">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Экскурсии проводим по записи после короткого созвона — подберём объект близкий к вашему запросу по материалу и площади.
              </p>
            </div>
            <LpContactCta
              source={`lp-${slug}-excursion`}
              service={service}
              className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              Записаться на экскурсию
            </LpContactCta>
          </div>
        </div>
      </div>
    </section>
  );
}

function LpFaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  return (
    <details
      data-reveal="card"
      style={revealDelayStyle(index, 50, 350)}
      className={cn(lpSoftCardAlt, "group p-4 sm:p-5")}
      onToggle={(e) => {
        const el = e.currentTarget;
        if (!el.open) return;
        window.setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 80);
      }}
    >
      <summary className="cursor-pointer list-none text-sm font-semibold leading-snug marker:content-none sm:text-base [&::-webkit-details-marker]:hidden">
        <span className="flex items-start gap-3">
          <span
            className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition group-open:rotate-90"
            style={{ backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}
            aria-hidden
          >
            ›
          </span>
          <span className="flex-1">{question}</span>
        </span>
      </summary>
      <p className="mt-3 pl-9 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {answer}
      </p>
    </details>
  );
}

export function LpFaqSection({ faq }: { faq: AdvertisingLandingConfig["faq"] }) {
  return (
    <section id="faq" className="scroll-mt-28 py-12 sm:scroll-mt-32 sm:py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-5" data-reveal="section">
        <div className="w-full">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 className="mt-3 w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Ответы перед расчётом
          </h2>
        </div>
        <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:mt-10">
          {faq.map((item, index) => (
            <LpFaqItem key={item.question} question={item.question} answer={item.answer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function LpFinalContactsSection() {
  return (
    <section className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-12 sm:py-16 md:pb-20 md:pt-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto px-4 sm:px-5" data-reveal="section">
        <div className="w-full">
          <SectionEyebrow>Связаться с нами</SectionEyebrow>
          <h2 className="mt-3 w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Остались вопросы? Напишите или позвоните
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
            Ответим по смете, срокам, материалам и ипотеке — удобным для вас способом.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={`tel:${PHONE_RAW}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold shadow-[0_12px_28px_rgba(15,61,46,0.18)]"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              <Phone className="h-4 w-4" aria-hidden />
              {PHONE}
            </a>
            <a
              href={SOCIAL_LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--bg)] px-6 text-sm font-bold shadow-[0_10px_28px_rgba(15,61,46,0.06)]"
              style={{ color: "var(--text)" }}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Telegram
            </a>
            <a
              href={SOCIAL_LINKS.maxChat}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--bg)] px-6 text-sm font-bold shadow-[0_10px_28px_rgba(15,61,46,0.06)]"
              style={{ color: "var(--text)" }}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Max
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
