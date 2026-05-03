import { SITE_NAME, CITY, getDefaultSiteGeoDescription } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { getHouseProjects } from "@/lib/construction-data";
import { BannerSection } from "@/components/sections/banner";
import { ProjectsConstructorSection } from "@/components/sections/projects-constructor-section";
import { FeaturedHouseProjectsSection } from "@/components/sections/featured-house-projects";
import { ClientsChooseVideoSection } from "@/components/sections/clients-choose-video-section";
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
      <ProjectsConstructorSection />
      <FeaturedHouseProjectsSection projects={houseProjects} />
      <ClientsChooseVideoSection />
      <div className="border-t border-[var(--border)]" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1100px] pb-14 pt-9 md:pb-16 md:pt-12">
          <CaseStudyFaqSection sectionClassName="mt-0" />
          <ConstructionServicesStagesSection sectionClassName="mt-9 md:mt-10" />
          <CaseStudyLeadCtaSection sectionClassName="mt-9 md:mt-11" leadSource="home-landing-cta" />
        </div>
      </div>
    </>
  );
}
