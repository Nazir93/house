"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Landmark,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  Star,
} from "lucide-react";

import { CmsImage } from "@/components/ui/cms-image";
import {
  ADVERTISING_OFFICE_GEO,
  ADVERTISING_TRUST_STATS,
  MATERIAL_COMPARISON_ROWS,
  type AdvertisingLandingConfig,
} from "@/lib/advertising-landing";
import {
  builtObjectMaterialLabel,
  formatRub,
  getBuiltObjectCover,
  type BuiltObjectItem,
} from "@/lib/construction-shared";
import type { HouseProjectItem } from "@/lib/construction-data";
import { METRIKA_GOALS, trackMetrikaGoal } from "@/lib/analytics-goals";
import { PHONE, PHONE_RAW, SOCIAL_LINKS } from "@/lib/constants";

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

export function LpTrustSection() {
  return (
    <section className="border-y py-10 md:py-12" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto px-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ADVERTISING_TRUST_STATS.map((stat) => (
            <article
              key={stat.label}
              className="rounded-[1.5rem] border p-5"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
            >
              <p className="font-heading text-3xl font-bold tracking-tight text-[var(--accent)] md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-semibold">{stat.label}</p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {stat.detail}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <MapPin className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
          <span>
            {ADVERTISING_OFFICE_GEO.city}, {ADVERTISING_OFFICE_GEO.regions} · {ADVERTISING_OFFICE_GEO.address}
          </span>
        </p>
      </div>
    </section>
  );
}

export function LpProjectsSection({
  projects,
  primaryCta,
}: {
  projects: HouseProjectItem[];
  primaryCta: string;
}) {
  return (
    <section id="projects" className="py-16 md:py-24">
      <div className="container mx-auto px-5">
        <div className="max-w-3xl">
          <SectionEyebrow>Проекты с ценой</SectionEyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-5xl">
            Подберите дом под бюджет и материал
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Типовые проекты с понятной комплектацией — можно адаптировать под участок, семью и выбранный материал стен.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.slug}
              className="group overflow-hidden rounded-[1.75rem] border bg-[var(--bg)] shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="relative min-h-56 overflow-hidden">
                <CmsImage
                  src={projectCover(project)}
                  alt={project.title}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-5">
                <p className="font-heading text-xl font-bold">{project.title}</p>
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  {project.area} м² · {project.floors} этаж · {project.rooms} комн.
                </p>
                <p className="mt-4 text-lg font-bold text-[var(--accent)]">от {formatRub(project.price)}</p>
                <a
                  href="#lead-form"
                  className="mt-5 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-bold"
                  style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                >
                  {primaryCta}
                </a>
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
    <section className="py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto grid gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <SectionEyebrow>Что входит в стоимость</SectionEyebrow>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-5xl">
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
}: {
  highlightMaterial?: AdvertisingLandingConfig["highlightMaterial"];
}) {
  return (
    <section className="py-16 md:py-24">
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
      className="py-16 md:py-24"
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
    <section className="py-16 md:py-24">
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
    <section className="py-16 md:py-24">
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
