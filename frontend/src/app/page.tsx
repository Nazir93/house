import { SITE_NAME, CITY, getDefaultSiteGeoDescription } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { getHouseProjects } from "@/lib/construction-data";
import { BannerSection } from "@/components/sections/banner";
import { ViewAllServices } from "@/components/layout/view-all-services";
import { ProjectsConstructorSection } from "@/components/sections/projects-constructor-section";
import { FeaturedHouseProjectsSection } from "@/components/sections/featured-house-projects";
import { PartnersSection } from "@/components/sections/partners";
import {
  CaseStudyFaqSection,
  CaseStudyLeadCtaSection,
  ConstructionServicesStagesSection,
} from "@/components/sections/case-study-landing-sections";

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
  const houseProjects = await getHouseProjects();

  return (
    <>
      <BannerSection />
      <ProjectsConstructorSection projects={houseProjects} />
      <ViewAllServices />
      <FeaturedHouseProjectsSection projects={houseProjects} />
      <PartnersSection />
      <div className="border-t border-[var(--border)]" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1200px] px-5 pb-20 pt-12 md:pb-24 md:pt-16">
          <CaseStudyFaqSection sectionClassName="mt-0" />
          <ConstructionServicesStagesSection sectionClassName="mt-12 md:mt-14" />
          <CaseStudyLeadCtaSection sectionClassName="mt-12 md:mt-16" leadSource="home-landing-cta" />
        </div>
      </div>
    </>
  );
}
