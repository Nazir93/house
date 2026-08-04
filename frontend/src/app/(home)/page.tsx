import dynamic from "next/dynamic";
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

/** Ниже первого экрана — отдельные чанки, не блокируют LCP баннера. */
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
      ]),
    ),
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
