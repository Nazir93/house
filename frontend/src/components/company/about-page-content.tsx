import { CompanyPageHeader } from "./company-page-header";
import { AboutFounderSection } from "./about-founder-section";
import { AboutMissionSection } from "./about-mission-section";
import { AboutTeamSection } from "./about-team-section";
import { AboutValuesSection } from "./about-values-section";
import { getAboutPageAssets } from "@/lib/about-page-assets";
import { SITE_NAME } from "@/lib/constants";

export function AboutPageContent() {
  const assets = getAboutPageAssets();

  return (
    <article style={{ color: "var(--text)" }}>
      <CompanyPageHeader
        breadcrumbCurrent="О нас"
        title="О нас"
        description={`${SITE_NAME}: проектируем и строим загородные дома с вниманием к архитектуре, качеству и каждой детали.`}
      />

      <AboutFounderSection founderImageSrc={assets.founder.src} founderImageAlt={assets.founder.alt} />
      <AboutMissionSection backgroundSrc={assets.missionBg.src} backgroundAlt={assets.missionBg.alt} />
      <AboutTeamSection teamImageSrc={assets.team.src} teamImageAlt={assets.team.alt} />
      <AboutValuesSection valuesImageSrc={assets.valuesImage.src} valuesImageAlt={assets.valuesImage.alt} />
    </article>
  );
}
