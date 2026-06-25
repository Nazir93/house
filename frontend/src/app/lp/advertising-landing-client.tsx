"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Home, MapPin, Phone, ShieldCheck } from "lucide-react";

import { HouseConstructionCalculatorForm } from "@/components/construction/house-construction-calculator-form";
import { CmsImage } from "@/components/ui/cms-image";
import { formatRub } from "@/lib/construction-shared";
import type { HouseProjectItem } from "@/lib/construction-data";
import type { AdvertisingLandingConfig } from "@/lib/advertising-landing";
import { PHONE, PHONE_RAW } from "@/lib/constants";

function projectCover(project: HouseProjectItem): string | null {
  return project.media.find((item) => item.type === "RENDER")?.url ?? project.media[0]?.url ?? null;
}

export function AdvertisingLandingClient({
  config,
  projects,
}: {
  config: AdvertisingLandingConfig;
  projects: HouseProjectItem[];
}) {
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-40 border-b bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-xl" style={{ borderColor: "var(--border)" }}>
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
          <div className="container mx-auto grid gap-10 px-5 py-14 md:grid-cols-[1.05fr_0.95fr] md:py-20">
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
                {config.eyebrow}
              </p>
              <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                {config.h1}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "var(--text-muted)" }}>
                {config.lead}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#lead-form"
                  className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-bold uppercase tracking-[0.08em]"
                  style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                >
                  {config.primaryCta}
                </a>
                <a
                  href="#projects"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-sm font-bold uppercase tracking-[0.08em]"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  {config.secondaryCta}
                </a>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {config.trust.map((item) => (
                  <div key={item} className="rounded-2xl border p-4 text-sm font-semibold" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
                    <CheckCircle2 className="mb-2 h-5 w-5 text-[var(--accent)]" aria-hidden />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border p-5 shadow-[0_20px_80px_rgba(0,0,0,0.08)]" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
              <div className="grid gap-4">
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
              <div className="mt-5 rounded-3xl p-5" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--bg))" }}>
                <p className="text-sm font-semibold">Что получите после заявки</p>
                <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  <li>Ориентир по стоимости и комплектации</li>
                  <li>Подбор проектов под площадь и бюджет</li>
                  <li>Рекомендацию по материалу стен</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="py-16 md:py-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
          <div className="container mx-auto px-5">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Проекты с ценой</p>
              <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">Подберите дом под бюджет и материал</h2>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {projects.map((project) => (
                <article key={project.slug} className="overflow-hidden rounded-[1.75rem] border bg-[var(--bg)]" style={{ borderColor: "var(--border)" }}>
                  <div className="relative min-h-56">
                    <CmsImage src={projectCover(project)} alt={project.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                  </div>
                  <div className="p-5">
                    <p className="font-heading text-xl font-bold">{project.title}</p>
                    <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                      {project.area} м² · {project.floors} этаж · {project.rooms} комнаты
                    </p>
                    <p className="mt-4 text-lg font-bold text-[var(--accent)]">от {formatRub(project.price)}</p>
                    <a href="#lead-form" className="mt-5 inline-flex rounded-full px-5 py-3 text-sm font-bold" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
                      Получить расчёт
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto grid gap-8 px-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Уже входит в смету</p>
              <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">Показываем состав работ до договора</h2>
              <p className="mt-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Рекламная заявка должна приходить не просто как телефон, а как понятный запрос: площадь, материал,
                бюджет, интерес к ипотеке и желаемая комплектация.
              </p>
            </div>
            <div className="grid gap-3">
              {config.includes.map((item, index) => (
                <div key={item} className="flex gap-4 rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-[var(--accent-contrast)]">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="lead-form" className="py-16 md:py-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
          <div className="container mx-auto grid gap-8 px-5 md:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border p-6 md:p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Квиз и заявка</p>
              <h2 className="mt-3 font-heading text-3xl font-bold">Получите расчёт под ваш дом</h2>
              <div className="mt-6 space-y-4 text-sm" style={{ color: "var(--text-muted)" }}>
                <p className="flex gap-3"><Home className="h-5 w-5 shrink-0 text-[var(--accent)]" /> Выберите площадь, этажность, материал и инженерию.</p>
                <p className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-[var(--accent)]" /> Мы увидим расчёт в заявке и подготовим следующий шаг.</p>
                <p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-[var(--accent)]" /> Работаем по СПб и Ленинградской области.</p>
                <p className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-[var(--accent)]" /> Можно сразу позвонить: {PHONE}.</p>
              </div>
            </div>
            <div className="rounded-[2rem] border bg-[var(--bg)] p-4 md:p-6" style={{ borderColor: "var(--border)" }}>
              {submittedName ? (
                <div className="rounded-[1.5rem] p-6 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--accent)]" aria-hidden />
                  <h3 className="mt-4 font-heading text-2xl font-bold">Заявка отправлена</h3>
                  <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
                    {submittedName}, мы получили параметры и свяжемся с вами для уточнения расчёта.
                  </p>
                  <a href={`tel:${PHONE_RAW}`} className="mt-6 inline-flex rounded-full px-5 py-3 text-sm font-bold" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
                    Позвонить сейчас
                  </a>
                </div>
              ) : (
                <HouseConstructionCalculatorForm
                  onSuccess={(_token, name) => setSubmittedName(name)}
                  leadSourceOverride={config.source}
                  leadServiceLabelOverride={config.quizDefaults?.serviceLabel}
                  initialWallMaterial={config.quizDefaults?.wallMaterial}
                  submitButtonLabel="Получить расчёт"
                  heading="Параметры будущего дома"
                  headingEyebrow="Заполните 5 шагов"
                  compactLayout
                />
              )}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto grid gap-8 px-5 md:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Вопросы перед расчётом</p>
              <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">Ответы, которые снижают риск заявки</h2>
            </div>
            <div className="space-y-3">
              {config.faq.map((item) => (
                <details key={item.question} className="rounded-2xl border p-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
                  <summary className="cursor-pointer font-semibold">{item.question}</summary>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

