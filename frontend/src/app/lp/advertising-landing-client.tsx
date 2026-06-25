"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, MapPin, ShieldCheck } from "lucide-react";

import type { BuiltObjectItem, HouseProjectItem } from "@/lib/construction-data";
import type { AdvertisingLandingConfig } from "@/lib/advertising-landing";
import { formatRub } from "@/lib/construction-shared";
import { PHONE, PHONE_RAW } from "@/lib/constants";
import { CmsImage } from "@/components/ui/cms-image";
import {
  AdvertisingLandingQuiz,
  AdvertisingLandingQuizSuccess,
} from "./advertising-landing-quiz";
import {
  LpExcursionSection,
  LpFaqSection,
  LpFinalContactsSection,
  LpIncludesSection,
  LpMaterialComparisonSection,
  LpMortgageSection,
  LpPortfolioSection,
  LpProjectsSection,
  LpTrustSection,
} from "./advertising-landing-sections";

function projectCover(project: HouseProjectItem): string | null {
  return project.media.find((item) => item.type === "RENDER")?.url ?? project.media[0]?.url ?? null;
}

export function AdvertisingLandingClient({
  config,
  projects,
  portfolio,
}: {
  config: AdvertisingLandingConfig;
  projects: HouseProjectItem[];
  portfolio: BuiltObjectItem[];
}) {
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "color-mix(in srgb, var(--bg) 90%, transparent)",
        }}
      >
        <div className="container mx-auto flex min-h-16 items-center justify-between gap-4 px-5">
          <Link href="/" className="font-heading text-lg font-bold tracking-tight">
            Часть души
          </Link>
          <div className="flex items-center gap-3">
            <a href={`tel:${PHONE_RAW}`} className="hidden text-sm font-semibold sm:inline-flex">
              {PHONE}
            </a>
            <a
              href="#lead-form"
              className="rounded-full px-4 py-2 text-sm font-bold"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              Получить расчёт
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-80"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="container relative mx-auto grid gap-10 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:py-20 lg:py-24">
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
                {config.eyebrow}
              </p>
              <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.04] tracking-tight md:text-6xl lg:text-[4rem]">
                {config.h1}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "var(--text-muted)" }}>
                {config.lead}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#lead-form"
                  className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold uppercase tracking-[0.08em] shadow-[0_12px_40px_color-mix(in_srgb,var(--accent)_35%,transparent)]"
                  style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                >
                  {config.primaryCta}
                </a>
                <a
                  href="#projects"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-bold uppercase tracking-[0.08em]"
                  style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
                >
                  {config.secondaryCta}
                </a>
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <MapPin className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                Санкт-Петербург и Ленинградская область
              </p>
            </div>

            <div
              className="rounded-[2rem] border p-5 shadow-[0_24px_80px_rgba(0,0,0,0.08)] md:p-6"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--accent)" }}>
                Популярные проекты
              </p>
              <div className="mt-4 grid gap-4">
                {projects.slice(0, 2).map((project) => (
                  <article key={project.slug} className="grid grid-cols-[104px_1fr] gap-4 rounded-3xl bg-[var(--bg)] p-3">
                    <div className="relative min-h-24 overflow-hidden rounded-2xl">
                      <CmsImage src={projectCover(project)} alt={project.title} fill sizes="104px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-heading text-lg font-bold">{project.title}</p>
                      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                        {project.area} м² · {project.floors} эт. · {project.rooms} комн.
                      </p>
                      <p className="mt-2 text-sm font-bold text-[var(--accent)]">от {formatRub(project.price)}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div
                className="mt-5 rounded-3xl p-5"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--bg))" }}
              >
                <p className="text-sm font-semibold">После квиза вы получите</p>
                <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    Ориентир по стоимости и комплектации
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    Подбор проектов под площадь и бюджет
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                    Рекомендацию по материалу и ипотеке
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <LpTrustSection />
        <LpProjectsSection projects={projects} primaryCta={config.primaryCta} />
        <LpIncludesSection items={config.includes} />
        <LpMaterialComparisonSection highlightMaterial={config.highlightMaterial} />
        <LpPortfolioSection objects={portfolio} />

        <section id="lead-form" className="py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
          <div className="container mx-auto grid gap-8 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div
              className="rounded-[2rem] border p-6 md:p-8 lg:sticky lg:top-24"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
                Квиз и заявка
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">Получите расчёт под ваш дом</h2>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                6 шагов: материал, площадь, этажность, бюджет, ипотека и контакты. Менеджер увидит параметры в заявке.
              </p>
              <div className="mt-6 space-y-4 text-sm" style={{ color: "var(--text-muted)" }}>
                <p className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
                  Без спама — только уточнение расчёта и следующий шаг.
                </p>
                <p className="flex gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
                  Работаем по СПб и Ленинградской области.
                </p>
              </div>
            </div>

            {submittedName ? (
              <AdvertisingLandingQuizSuccess name={submittedName} />
            ) : (
              <AdvertisingLandingQuiz
                leadSource={config.source}
                serviceLabel={config.quizDefaults?.serviceLabel ?? `LP: ${config.slug}`}
                initialWallMaterial={config.quizDefaults?.wallMaterial}
                onSuccess={setSubmittedName}
              />
            )}
          </div>
        </section>

        <LpMortgageSection />
        <LpExcursionSection title={config.excursionTitle} lead={config.excursionLead} />
        <LpFaqSection faq={config.faq} />
        <LpFinalContactsSection />
      </main>

      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t p-3 backdrop-blur-xl md:hidden"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "color-mix(in srgb, var(--bg) 92%, transparent)",
        }}
      >
        <div className="container mx-auto flex gap-2">
          <a
            href={`tel:${PHONE_RAW}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border text-sm font-bold"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Позвонить
          </a>
          <a
            href="#lead-form"
            className="inline-flex min-h-11 flex-[1.4] items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            Расчёт
          </a>
        </div>
      </div>
    </div>
  );
}
