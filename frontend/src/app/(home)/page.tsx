import Link from "next/link";

import { getPageMeta } from "@/lib/get-page-meta";
import { getHouseProjects, getHomeBuiltPortfolio } from "@/lib/construction-data";
import { getHeroShellTiersForProject } from "@/lib/project-hero-shell-tiers";
import { getBankMarqueePartners, getHomePartners } from "@/lib/get-home-partners";
import { getHomeBlogPreview } from "@/lib/get-home-blog-preview";
import { getPublicFaqs } from "@/lib/get-public-faqs";
import { getCommercialPageSeo } from "@/lib/seo/commercial-page-seo";
import { JsonLdInline } from "@/components/seo/json-ld-inline";
import { BannerSection } from "@/components/sections/banner";
import { getHomeHeroBannerConfig } from "@/lib/home-hero-banner-config";
import { ProjectsConstructorSection } from "@/components/sections/projects-constructor-section";
import { FeaturedHouseProjectsSection } from "@/components/sections/featured-house-projects";
import { ClientsChooseVideoSection } from "@/components/sections/clients-choose-video-section";
import { AccountShowcaseSection } from "@/components/sections/account-showcase-section";
import { HomePartnersSection } from "@/components/sections/home-partners-section";
import { PortfolioSection } from "@/components/sections/portfolio";
import { HomeNewsFeed } from "@/components/sections/home-news-feed";
import {
  CaseStudyFaqSectionClient,
  ConstructionServicesStagesSection,
} from "@/components/sections/case-study-landing-sections";
import { BankPartnersMarqueeSection } from "@/components/sections/bank-partners-marquee-section";

export const revalidate = 60;

export async function generateMetadata() {
  const seo = getCommercialPageSeo("home");
  return getPageMeta({
    title: seo.title,
    description: seo.description,
    path: seo.path,
    keywords: seo.keywords,
  });
}

export default async function HomePage() {
  const homeSeo = getCommercialPageSeo("home");
  const [houseProjects, builtPortfolioPreview, partners, bankMarqueePartners, newsPreview, faqItems, heroBanner] =
    await Promise.all([
      getHouseProjects(),
      getHomeBuiltPortfolio(),
      getHomePartners(),
      getBankMarqueePartners(),
      getHomeBlogPreview(3),
      getPublicFaqs(),
      getHomeHeroBannerConfig(),
    ]);
  const projectHeroTiers = Object.fromEntries(
    await Promise.all(
      houseProjects.map(async (project) => [
        project.id,
        await getHeroShellTiersForProject(project),
      ])
    )
  );

  return (
    <>
      <JsonLdInline
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: homeSeo.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />
      <BannerSection config={heroBanner} />
      <ProjectsConstructorSection />
      <FeaturedHouseProjectsSection projects={houseProjects} projectHeroTiers={projectHeroTiers} />
      <ClientsChooseVideoSection />
      <AccountShowcaseSection />
      <HomePartnersSection partners={partners} />
      <PortfolioSection
        builtObjects={builtPortfolioPreview}
        sectionTitle="Наши работы"
        viewAllLabel="Все проекты"
        sectionId="home-cases"
      />
      <div className="border-t border-[var(--border)]" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1100px] pb-14 pt-9 md:pb-16 md:pt-12">
          <ConstructionServicesStagesSection sectionClassName="mt-0" />
        </div>
      </div>
      <section className="border-t border-[var(--border)]" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1100px] px-5 py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-subtle)" }}>
                Семантика: дом под ключ
              </p>
              <h2 className="mt-3 font-heading text-2xl font-bold md:text-3xl" style={{ color: "var(--text)" }}>
                {homeSeo.h1}
              </h2>
              <p className="mt-4 text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
                {homeSeo.intro}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/calculator"
                  className="rounded-full px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                >
                  Рассчитать стоимость
                </Link>
                <Link
                  href="/projects"
                  className="rounded-full border px-5 py-3 text-sm font-semibold transition hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--text) 14%, transparent)",
                    color: "var(--text)",
                  }}
                >
                  Выбрать проект
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {homeSeo.faq.map((item) => (
                <details
                  key={item.question}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "color-mix(in srgb, var(--text) 10%, transparent)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  <summary className="cursor-pointer text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
      <HomeNewsFeed posts={newsPreview} />
      <div className="border-t border-[var(--border)]" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1100px] pb-14 pt-9 md:pb-16 md:pt-12">
          <BankPartnersMarqueeSection partners={bankMarqueePartners} />
          <CaseStudyFaqSectionClient items={faqItems} sectionClassName="mt-10 md:mt-12" />
        </div>
      </div>
    </>
  );
}
