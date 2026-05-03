import { SITE_NAME, CITY, getDefaultSiteGeoDescription } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { getHouseProjects, getHomeBuiltPortfolio } from "@/lib/construction-data";
import { getHomePartners } from "@/lib/get-home-partners";
import { getHomeBlogPreview } from "@/lib/get-home-blog-preview";
import { BannerSection } from "@/components/sections/banner";
import { ProjectsConstructorSection } from "@/components/sections/projects-constructor-section";
import { FeaturedHouseProjectsSection } from "@/components/sections/featured-house-projects";
import { ClientsChooseVideoSection } from "@/components/sections/clients-choose-video-section";
import { HomePartnersSection } from "@/components/sections/home-partners-section";
import { PortfolioSection } from "@/components/sections/portfolio";
import { HomeNewsFeed } from "@/components/sections/home-news-feed";
import { CaseStudyFaqSection, ConstructionServicesStagesSection } from "@/components/sections/case-study-landing-sections";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `${SITE_NAME} — строительство загородных домов под ключ в ${CITY}`,
    description: getDefaultSiteGeoDescription(),
    path: "/",
    keywords: ["строительство домов", "коттедж под ключ", CITY, "типовые проекты домов", SITE_NAME],
  });
}

export default async function HomePage() {
  const [houseProjects, builtPortfolioPreview, partners, newsPreview] = await Promise.all([
    getHouseProjects(),
    getHomeBuiltPortfolio(),
    getHomePartners(),
    getHomeBlogPreview(3),
  ]);

  return (
    <>
      <BannerSection />
      <ProjectsConstructorSection />
      <FeaturedHouseProjectsSection projects={houseProjects} />
      <ClientsChooseVideoSection />
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
          <CaseStudyFaqSection sectionClassName="mt-0" />
        </div>
      </div>
    </>
  );
}
