"use client";

import { useMemo, useState } from "react";
import { MapPin, ShieldCheck } from "lucide-react";

import type { BuiltObjectItem, HouseProjectItem } from "@/lib/construction-data";
import {
  advertisingLandingMinProjectPrice,
  pickAdvertisingLandingHeroImage,
  type AdvertisingLandingConfig,
} from "@/lib/advertising-landing";
import type { PublicReviewItem } from "@/lib/get-public-reviews";
import { resolveLpSectionOrder, resolveLpThemeSpec, type LpSectionId } from "@/lib/lp-themes";
import { PHONE_RAW, SOCIAL_LINKS } from "@/lib/constants";
import {
  lpQuizStepsBlurb,
  resolveLpQuizSteps,
} from "@/lib/advertising-landing-quiz-steps";
import {
  AdvertisingLandingQuiz,
  AdvertisingLandingQuizSuccess,
} from "./advertising-landing-quiz";
import { AdvertisingLandingHero } from "./advertising-landing-hero";
import { LpContactCta, lpServiceLabel } from "./lp-contact-cta";
import {
  LpExcursionSection,
  LpFaqSection,
  LpFinalContactsSection,
  LpGuaranteesSection,
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
    <section id="lead-form" className="scroll-mt-24 py-12 sm:py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="container mx-auto grid gap-6 px-4 sm:gap-8 sm:px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start" data-reveal="section">
        <div className="rounded-[1.5rem] bg-[var(--bg)] p-5 shadow-[0_18px_48px_rgba(15,61,46,0.07)] sm:rounded-[2rem] sm:p-6 md:p-8 lg:sticky lg:top-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
            Квиз и заявка
          </p>
          <h2 className="mt-3 w-full font-heading text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Получите расчёт под ваш дом
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {config.lead}
          </p>
          <div className="mt-6 space-y-4 text-sm" style={{ color: "var(--text-muted)" }}>
            <p className="flex gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--accent)]" aria-hidden />
              {lpQuizStepsBlurb(
                resolveLpQuizSteps({
                  wallMaterialPreset: config.quizDefaults?.wallMaterial,
                  floorsPreset: config.quizDefaults?.floors,
                }),
              )}
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
            initialFloors={config.quizDefaults?.floors}
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
  const priceFromRub = advertisingLandingMinProjectPrice(projects);
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
      guarantees: () => <LpGuaranteesSection />,
      comparison: () => (
        <LpMaterialComparisonSection highlightMaterial={config.highlightMaterial} theme={theme} />
      ),
      portfolio: () => <LpPortfolioSection objects={portfolio} />,
      steps: () => <LpStepsSection config={config} />,
      quiz: () => (
        <LpQuizSection config={config} submittedName={submittedName} onSuccess={setSubmittedName} />
      ),
      mortgage: () => <LpMortgageSection config={config} />,
      excursion: () => (
        <LpExcursionSection title={config.excursionTitle} lead={config.excursionLead} config={config} />
      ),
      reviews: () => <LpReviewsSection config={config} reviews={reviews} />,
      faq: () => <LpFaqSection faq={config.faq} />,
    };

    return sectionOrder.map((id) => ({ id, node: registry[id]?.() ?? null }));
  }, [config, portfolio, projects, reviews, sectionOrder, submittedName, theme]);

  return (
    <div className="lp-page min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <AdvertisingLandingHero config={config} heroImage={heroImage} priceFromRub={priceFromRub} />

      <main>
        {sections.map(({ id, node }) => (
          <div key={id}>{node}</div>
        ))}
        <LpFinalContactsSection />
      </main>

      <div
        className="fixed inset-x-0 bottom-0 z-40 p-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg) 88%, transparent) 28%, color-mix(in srgb, var(--bg) 96%, transparent) 100%)",
        }}
      >
        <div className="mx-auto flex max-w-lg gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--bg)_96%,transparent)] p-2 shadow-[0_-8px_36px_rgba(15,61,46,0.14)]">
          <a
            href={`tel:${PHONE_RAW}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-sm font-bold"
            style={{ color: "var(--text)" }}
          >
            Звонок
          </a>
          <a
            href={SOCIAL_LINKS.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-sm font-bold"
            style={{ color: "var(--text)" }}
          >
            Telegram
          </a>
          <LpContactCta
            source={`lp-${config.slug}-mobile-bar`}
            service={lpServiceLabel(config)}
            className="inline-flex min-h-11 flex-[1.35] items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            Расчёт
          </LpContactCta>
        </div>
      </div>
    </div>
  );
}
