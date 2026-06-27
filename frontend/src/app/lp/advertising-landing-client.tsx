"use client";

import { useMemo, useState } from "react";
import { MapPin, ShieldCheck } from "lucide-react";

import type { BuiltObjectItem, HouseProjectItem } from "@/lib/construction-data";
import {
  pickAdvertisingLandingHeroImage,
  type AdvertisingLandingConfig,
} from "@/lib/advertising-landing";
import type { PublicReviewItem } from "@/lib/get-public-reviews";
import { resolveLpSectionOrder, resolveLpThemeSpec, type LpSectionId } from "@/lib/lp-themes";
import { PHONE_RAW } from "@/lib/constants";
import {
  AdvertisingLandingQuiz,
  AdvertisingLandingQuizSuccess,
} from "./advertising-landing-quiz";
import { AdvertisingLandingHero } from "./advertising-landing-hero";
import {
  LpExcursionSection,
  LpFaqSection,
  LpFinalContactsSection,
  LpIncludesSection,
  LpMaterialComparisonSection,
  LpMortgageSection,
  LpPortfolioSection,
  LpFactsSection,
  LpProjectsSection,
  LpReviewsSection,
  LpStepsSection,
} from "./advertising-landing-sections";

function LpQuizSection({
  config,
  submittedName,
  onSuccess,
}: {
  config: AdvertisingLandingConfig;
  submittedName: string | null;
  onSuccess: (name: string) => void;
}) {
  return (
    <section id="lead-form" className="scroll-mt-24 py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
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
            {config.lead}
          </p>
          <div className="mt-6 space-y-4 text-sm" style={{ color: "var(--text-muted)" }}>
            <p className="flex gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
              6 шагов: материал, площадь, этажность, бюджет, ипотека и контакты.
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
            onSuccess={onSuccess}
          />
        )}
      </div>
    </section>
  );
}

export function AdvertisingLandingClient({
  config,
  projects,
  portfolio,
  reviews,
}: {
  config: AdvertisingLandingConfig;
  projects: HouseProjectItem[];
  portfolio: BuiltObjectItem[];
  reviews: PublicReviewItem[];
}) {
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const heroImage = pickAdvertisingLandingHeroImage(config, projects, portfolio);
  const theme = resolveLpThemeSpec(config);
  const sectionOrder = resolveLpSectionOrder(config);

  const sections = useMemo(() => {
    const registry: Record<
      LpSectionId,
      () => React.ReactNode
    > = {
      facts: () => <LpFactsSection config={config} theme={theme} />,
      projects: () => (
        <LpProjectsSection config={config} projects={projects} primaryCta={config.primaryCta} theme={theme} />
      ),
      includes: () => <LpIncludesSection items={config.includes} />,
      comparison: () => (
        <LpMaterialComparisonSection highlightMaterial={config.highlightMaterial} theme={theme} />
      ),
      portfolio: () => <LpPortfolioSection objects={portfolio} />,
      steps: () => <LpStepsSection config={config} />,
      quiz: () => (
        <LpQuizSection config={config} submittedName={submittedName} onSuccess={setSubmittedName} />
      ),
      mortgage: () => <LpMortgageSection />,
      excursion: () => <LpExcursionSection title={config.excursionTitle} lead={config.excursionLead} />,
      reviews: () => <LpReviewsSection config={config} reviews={reviews} />,
      faq: () => <LpFaqSection faq={config.faq} />,
    };

    return sectionOrder.map((id) => ({ id, node: registry[id]?.() ?? null }));
  }, [config, portfolio, projects, reviews, sectionOrder, submittedName, theme]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <AdvertisingLandingHero config={config} heroImage={heroImage} />

      <main>
        {sections.map(({ id, node }) => (
          <div key={id}>{node}</div>
        ))}
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
