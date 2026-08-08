"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Clock3,
  FileCheck2,
  Landmark,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  ShieldCheck,
  Star,
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
import { cn } from "@/lib/utils";

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

export function LpFactsSection({ config, theme }: { config: AdvertisingLandingConfig; theme?: LpThemeSpec }) {
  const intro = advertisingLandingFactsIntro(config);
  const spec = theme ?? resolveLpThemeSpec(config);

  return (
    <section className="py-14 md:py-20" style={{ backgroundColor: spec.sectionAltBg }}>
      <div className="container mx-auto max-w-4xl px-5 text-center">
        <SectionEyebrow>Факты о компании</SectionEyebrow>
        <h2 className="mx-auto mt-3 max-w-3xl text-balance font-heading text-xl font-bold leading-snug tracking-tight md:text-2xl">
          {config.h1}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed md:text-[15px]" style={{ color: "var(--text-muted)" }}>
          {intro}
        </p>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {ADVERTISING_LP_FACT_STATS.map((stat) => (
            <article key={stat.label} className="flex flex-col items-center text-center">
              <p className="font-heading text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-none tracking-tight text-[var(--text)] whitespace-nowrap">
                {stat.value}
              </p>
              <p
                className="mt-3 max-w-[12rem] text-[11px] font-semibold uppercase leading-snug tracking-[0.08em]"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-12 flex flex-wrap items-center justify-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <MapPin className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
          <span>
            {ADVERTISING_OFFICE_GEO.city}, {ADVERTISING_OFFICE_GEO.regions} · {ADVERTISING_OFFICE_GEO.address}
          </span>
        </p>
      </div>
    </section>
  );
}

const LP_GUARANTEE_ITEMS = [
  {
    Icon: ShieldCheck,
    title: "Гарантия от 5 лет на конструктив",
    text: "Фиксируем сроки и условия в договоре — вы понимаете, за что отвечаем после сдачи дома.",
  },
  {
    Icon: FileCheck2,
    title: "Смета до договора",
    text: "Состав работ и комплектацию согласовываем заранее — без скрытых доплат «по ходу».",
  },
  {
    Icon: Clock3,
    title: "Понятные сроки и этапы",
    text: "График работ и поэтапная приёмка: видно, что сделано и что идёт дальше.",
  },
] as const;

export function LpGuaranteesSection() {
  return (
    <section id="guarantees" className="scroll-mt-24 py-14 md:py-20" style={{ backgroundColor: "var(--bg)" }}>
      <div className="container mx-auto px-5">
        <div className="max-w-3xl">
          <SectionEyebrow>Гарантии и сроки</SectionEyebrow>
          <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Спокойствие на всём пути строительства
          </h2>
          <p className="mt-4 text-sm leading-relaxed md:text-[15px]" style={{ color: "var(--text-muted)" }}>
            Дом под ключ — это не только стены, а понятные обязательства: смета, график и гарантия на конструктив.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {LP_GUARANTEE_ITEMS.map(({ Icon, title, text }) => (
            <article
              key={title}
              className="rounded-[1.5rem] border p-5 md:p-6"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {text}
              </p>
            </article>
          ))}
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
      <div className="container mx-auto px-5">
        <div className="max-w-3xl">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-[0.06em] md:text-3xl">
            Каталог проектов
          </h2>
          <p className="mt-5 text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
            {catalogIntro}
          </p>
          {catalogNote ? (
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {catalogNote}
            </p>
          ) : null}
        </div>

        <div
          className={
            isCarousel
              ? "mt-10 flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : "mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          }
        >
          {projects.map((project) => (
            <article
              key={project.slug}
              className={cn(
                "group overflow-hidden rounded-[1.75rem] border bg-[var(--bg)] shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5",
                isCarousel && "min-w-[min(85vw,320px)] shrink-0 snap-start md:min-w-[360px]",
              )}
              style={{ borderColor: "var(--border)" }}
            >
              <Link href={`/projects/${project.slug}`} className="block">
                <div className="relative min-h-56 overflow-hidden">
                  <CmsImage
                    src={projectCover(project)}
                    alt={project.title}
                    fill
                    sizes={isCarousel ? "360px" : "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"}
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
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
                <p className="mt-4 text-lg font-bold text-[var(--accent)]">от {formatRub(project.price)}</p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border px-4 text-sm font-bold transition hover:border-[var(--accent)]"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    Подробнее
                  </Link>
                  <a
                    href="#lead-form"
                    className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-bold transition hover:opacity-95"
                    style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                  >
                    {primaryCta}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LpIncludesSection({ items }: { items: string[] }) {
  return (
    <section id="includes" className="scroll-mt-24 py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto grid gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <SectionEyebrow>Что входит в стоимость</SectionEyebrow>
          <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Прозрачная смета до договора
          </h2>
          <p className="mt-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Показываем состав работ и комплектацию заранее — без «сюрпризов» на этапе стройки.
          </p>
        </div>
        <div className="grid gap-3">
          {items.map((item, index) => (
            <div
              key={item}
              className="flex gap-4 rounded-2xl border p-4 md:p-5"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
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
  const useColumns = spec.comparisonLayout === "columns";

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: useColumns ? "var(--bg)" : undefined }}>
      <div className="container mx-auto px-5">
        <div className="max-w-3xl">
          <SectionEyebrow>Сравнение материалов</SectionEyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-5xl">
            Газобетон, кирpич и керамоблок
          </h2>
          <p className="mt-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Сравним по бюджету, скорости строительства, долговечности и комфорту — и подберём оптимальный вариант под ваш участок.
          </p>
        </div>

        {useColumns ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {MATERIAL_COMPARISON_ROWS.map((row) => {
              const highlighted = highlightMaterial === row.id;
              return (
                <article
                  key={row.id}
                  className={cn(
                    "rounded-[1.75rem] border p-6 transition",
                    highlighted && "ring-2 ring-[var(--accent)]",
                  )}
                  style={{
                    borderColor: highlighted ? "var(--accent)" : "var(--border)",
                    backgroundColor: highlighted
                      ? "color-mix(in srgb, var(--accent) 8%, var(--bg))"
                      : "var(--bg-secondary)",
                  }}
                >
                  <p className="font-heading text-xl font-bold">
                    {row.label}
                    {highlighted ? (
                      <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--accent-contrast)]" style={{ backgroundColor: "var(--accent)" }}>
                        ваш запрос
                      </span>
                    ) : null}
                  </p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="font-semibold">Бюджет</dt>
                      <dd style={{ color: "var(--text-muted)" }}>{row.priceLevel}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Скорость</dt>
                      <dd style={{ color: "var(--text-muted)" }}>{row.buildSpeed}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Долговечность</dt>
                      <dd style={{ color: "var(--text-muted)" }}>{row.durability}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold">Тепло</dt>
                      <dd style={{ color: "var(--text-muted)" }}>{row.thermal}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {row.bestFor}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-[1.75rem] border" style={{ borderColor: "var(--border)" }}>
            <table className="min-w-[760px] w-full border-collapse text-left text-sm">
              <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
                <tr>
                  <th className="px-5 py-4 font-semibold">Материал</th>
                  <th className="px-5 py-4 font-semibold">Бюджет</th>
                  <th className="px-5 py-4 font-semibold">Скорость</th>
                  <th className="px-5 py-4 font-semibold">Долговечность</th>
                  <th className="px-5 py-4 font-semibold">Тепло</th>
                  <th className="px-5 py-4 font-semibold">Когда выбирают</th>
                </tr>
              </thead>
              <tbody>
                {MATERIAL_COMPARISON_ROWS.map((row) => {
                  const highlighted = highlightMaterial === row.id;
                  return (
                    <tr
                      key={row.id}
                      style={{
                        backgroundColor: highlighted
                          ? "color-mix(in srgb, var(--accent) 8%, var(--bg))"
                          : "var(--bg)",
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <td className="px-5 py-4 font-bold">
                        {row.label}
                        {highlighted && (
                          <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--accent-contrast)]" style={{ backgroundColor: "var(--accent)" }}>
                            ваш запрос
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">{row.priceLevel}</td>
                      <td className="px-5 py-4">{row.buildSpeed}</td>
                      <td className="px-5 py-4">{row.durability}</td>
                      <td className="px-5 py-4">{row.thermal}</td>
                      <td className="px-5 py-4" style={{ color: "var(--text-muted)" }}>
                        {row.bestFor}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
      <div className="container mx-auto px-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <SectionEyebrow>Портфолио</SectionEyebrow>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-5xl">
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

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {objects.map((object) => (
            <Link
              key={object.slug}
              href={`/portfolio/${object.slug}`}
              className="group overflow-hidden rounded-[1.5rem] border bg-[var(--bg)] transition hover:-translate-y-0.5"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="relative min-h-44 overflow-hidden">
                <CmsImage
                  src={getBuiltObjectCover(object)?.url ?? null}
                  alt={object.title}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
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

export function LpMortgageSection() {
  return (
    <section id="mortgage" className="scroll-mt-24 py-16 md:py-24">
      <div className="container mx-auto px-5">
        <div
          className="grid gap-8 overflow-hidden rounded-[2rem] border p-8 md:grid-cols-[1fr_0.9fr] md:p-10"
          style={{
            borderColor: "var(--border)",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, var(--bg)) 0%, var(--bg-secondary) 55%, var(--bg) 100%)",
          }}
        >
          <div>
            <SectionEyebrow>Ипотека на строительство</SectionEyebrow>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">
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
              <a
                href="#lead-form"
                className="inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-bold"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                Консультация по ипотеке
              </a>
            </div>
          </div>
          <div
            className="flex flex-col justify-center rounded-[1.5rem] border p-6"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
          >
            <Star className="h-8 w-8 text-[var(--accent)]" aria-hidden />
            <p className="mt-4 font-heading text-2xl font-bold">Сначала расчёт — потом банк</p>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              В квизе можно отметить интерес к ипотеке. Менеджер уточнит бюджет, комплектацию и подскажет реалистичный маршрут.
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
    <section className="py-16 md:py-24" style={{ backgroundColor: "var(--bg)" }}>
      <div className="container mx-auto px-5">
        <div className="max-w-3xl">
          <SectionEyebrow>Как мы работаем</SectionEyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-5xl">
            4 этапа до готового дома
          </h2>
          <p className="mt-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {intro}
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {LP_WORK_STEPS.map((step) => (
            <article
              key={step.step}
              className="rounded-[1.5rem] border p-5 md:p-6"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
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
    <section className="py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto px-5">
        <div className="max-w-3xl">
          <SectionEyebrow>Отзывы клиентов</SectionEyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-5xl">
            Что говорят заказчики
          </h2>
          <p className="mt-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {intro}
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((review) => {
            const initial = review.authorName.trim().charAt(0).toUpperCase();
            const meta = [review.objectName, review.serviceLabel].filter(Boolean).join(" · ");
            return (
              <article
                key={review.id}
                className="flex h-full flex-col rounded-[1.5rem] border p-5 md:p-6"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
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
}: {
  title: string;
  lead: string;
}) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto px-5">
        <div
          className="grid gap-8 rounded-[2rem] border p-8 md:grid-cols-[1.05fr_0.95fr] md:p-10"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
        >
          <div>
            <SectionEyebrow>Экскурсия на объект</SectionEyebrow>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
            <p className="mt-4 max-w-2xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {lead}
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <div className="flex items-start gap-3 rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Экскурсии проводим по записи после короткого созвона — подберём объект близкий к вашему запросу по материалу и площади.
              </p>
            </div>
            <a
              href="#lead-form"
              className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              Записаться на экскурсию
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LpFaqSection({ faq }: { faq: AdvertisingLandingConfig["faq"] }) {
  return (
    <section id="faq" className="scroll-mt-24 py-16 md:py-24">
      <div className="container mx-auto grid gap-8 px-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-5xl">
            Ответы перед расчётом
          </h2>
        </div>
        <div className="space-y-3">
          {faq.map((item) => (
            <details
              key={item.question}
              className="rounded-2xl border p-5"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
            >
              <summary className="cursor-pointer font-semibold">{item.question}</summary>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LpFinalContactsSection() {
  return (
    <section className="border-t py-16 md:py-20" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto px-5">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>Связаться с нами</SectionEyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Остались вопросы? Напишите или позвоните
          </h2>
          <p className="mt-4 text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
            Ответим по смете, срокам, материалам и ипотеке — удобным для вас способом.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={`tel:${PHONE_RAW}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              <Phone className="h-4 w-4" aria-hidden />
              {PHONE}
            </a>
            <a
              href={SOCIAL_LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-bold"
              style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Telegram
            </a>
            <a
              href={SOCIAL_LINKS.maxChat}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-bold"
              style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
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
