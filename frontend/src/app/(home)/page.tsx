import dynamic from "next/dynamic";
import { getPageH1, getPageMeta } from "@/lib/get-page-meta";
import { getHouseProjects, getHomeBuiltPortfolio } from "@/lib/construction-data";
import { getHeroShellTiersForProject } from "@/lib/project-hero-shell-tiers";
import { getBankMarqueePartners, getHomePartners } from "@/lib/get-home-partners";
import { getHomeBlogPreview } from "@/lib/get-home-blog-preview";
import { getPublicFaqs } from "@/lib/get-public-faqs";
import { resolveHomeBannerH1 } from "@/lib/home-banner-h1";
import { HOME_HERO_SEO_LEAD, resolveHomeHeroLead } from "@/lib/home-hero-first-screen";
import {
  HOME_BUILT_HOMES_H2,
  HOME_BUILT_HOMES_VIEW_ALL_HREF,
  HOME_BUILT_HOMES_VIEW_ALL_LABEL,
} from "@/lib/home-built-homes-block";
import { getCommercialPageSeo } from "@/lib/seo/commercial-page-seo";
import { JsonLdInline } from "@/components/seo/json-ld-inline";
import { BannerSection } from "@/components/sections/banner";
import { HomeTurnkeyServicesSection } from "@/components/sections/home-turnkey-services-section";
import { getHomeHeroBannerConfig } from "@/lib/home-hero-banner-config";
import { buildHomeHeroLcpPreloadHref } from "@/lib/home-hero-lcp";

/** Ниже первого экрана — отдельные чанки, не блокируют LCP баннера. */
const ProjectsConstructorSection = dynamic(
  () =>
    import("@/components/sections/projects-constructor-section").then((m) => ({
      default: m.ProjectsConstructorSection,
    })),
  { loading: () => <div className="min-h-[40vh]" aria-hidden /> },
);
const FeaturedHouseProjectsSection = dynamic(
  () =>
    import("@/components/sections/featured-house-projects").then((m) => ({
      default: m.FeaturedHouseProjectsSection,
    })),
  { loading: () => <div className="min-h-[50vh]" aria-hidden /> },
);
const ClientsChooseVideoSection = dynamic(
  () =>
    import("@/components/sections/clients-choose-video-section").then((m) => ({
      default: m.ClientsChooseVideoSection,
    })),
  { loading: () => <div className="min-h-[50vh]" aria-hidden /> },
);
const AccountShowcaseSection = dynamic(
  () =>
    import("@/components/sections/account-showcase-section").then((m) => ({
      default: m.AccountShowcaseSection,
    })),
  { loading: () => null },
);
const HomePartnersSection = dynamic(
  () =>
    import("@/components/sections/home-partners-section").then((m) => ({
      default: m.HomePartnersSection,
    })),
  { loading: () => null },
);
const PortfolioSection = dynamic(
  () =>
    import("@/components/sections/portfolio").then((m) => ({
      default: m.PortfolioSection,
    })),
  { loading: () => <div className="min-h-[40vh]" aria-hidden /> },
);
const ConstructionServicesStagesSection = dynamic(
  () =>
    import("@/components/sections/case-study-landing-sections").then((m) => ({
      default: m.ConstructionServicesStagesSection,
    })),
  { loading: () => null },
);
const HomeNewsFeed = dynamic(
  () =>
    import("@/components/sections/home-news-feed").then((m) => ({
      default: m.HomeNewsFeed,
    })),
  { loading: () => null },
);
const BankPartnersMarqueeSection = dynamic(
  () =>
    import("@/components/sections/bank-partners-marquee-section").then((m) => ({
      default: m.BankPartnersMarqueeSection,
    })),
  { loading: () => null },
);
const CaseStudyFaqSectionClient = dynamic(
  () =>
    import("@/components/sections/case-study-landing-sections").then((m) => ({
      default: m.CaseStudyFaqSectionClient,
    })),
  { loading: () => null },
);

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
  const [houseProjects, builtPortfolioPreview, partners, bankMarqueePartners, newsPreview, faqItems, heroBanner, homeH1] =
    await Promise.all([
      getHouseProjects(),
      getHomeBuiltPortfolio(),
      getHomePartners(),
      getBankMarqueePartners(),
      getHomeBlogPreview(3),
      getPublicFaqs(),
      getHomeHeroBannerConfig(),
      getPageH1("/", homeSeo.h1),
    ]);
  const projectHeroTiers = Object.fromEntries(
    await Promise.all(
      houseProjects.map(async (project) => [
        project.id,
        await getHeroShellTiersForProject(project),
      ]),
    ),
  );

  const heroLcpHref = buildHomeHeroLcpPreloadHref(heroBanner.backgrounds.light);
  const bannerH1 = resolveHomeBannerH1(homeH1, heroBanner.headlineLines);
  const bannerLead = resolveHomeHeroLead(HOME_HERO_SEO_LEAD, heroBanner.subheadline);

  return (
    <>
      {/* LCP: фон баннера в HTML head до CSS mask логотипа и нижеfold-чанков. */}
      <link rel="preload" as="image" href={heroLcpHref} fetchPriority="high" />
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
      <BannerSection config={heroBanner} seoH1={bannerH1} seoLead={bannerLead} />
      <ProjectsConstructorSection />
      <HomeTurnkeyServicesSection />
      <FeaturedHouseProjectsSection projects={houseProjects} projectHeroTiers={projectHeroTiers} />
      <ClientsChooseVideoSection />
      <AccountShowcaseSection />
      <HomePartnersSection partners={partners} />
      <PortfolioSection
        builtObjects={builtPortfolioPreview}
        sectionTitle={HOME_BUILT_HOMES_H2}
        viewAllLabel={HOME_BUILT_HOMES_VIEW_ALL_LABEL}
        viewAllHref={HOME_BUILT_HOMES_VIEW_ALL_HREF}
        sectionId="home-cases"
      />
      <div className="border-t border-[var(--border)]" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1100px] pb-14 pt-9 md:pb-16 md:pt-12">
          <ConstructionServicesStagesSection sectionClassName="mt-0" />
        </div>
      </div>
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
