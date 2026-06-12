import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHeroCinematic } from "@/components/landing/landing-hero-cinematic";
import { ProektirovanieStoryScrollSection } from "@/components/landing/proektirovanie-story-scroll-section";
import { ServiceStoryScrollTrack } from "@/components/landing/service-story-scroll-track";
import { ServiceStoryTimeline } from "@/components/landing/service-story-timeline";
import { LandingShowcase } from "@/components/landing/landing-showcase";
import { LandingPain } from "@/components/landing/landing-pain";
import { LandingAdvantages } from "@/components/landing/landing-advantages";
import { LandingTextBlock } from "@/components/landing/landing-text-block";
import { LandingSteps } from "@/components/landing/landing-steps";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingServiceSchema } from "@/components/landing/landing-service-schema";
import type { ServiceLandingDocument } from "@/lib/service-landing-schema";
import { getPageH1 } from "@/lib/get-page-meta";
import { loadContactConfig } from "@/lib/load-contact-config";
import { ProjectDesignCostCalculator } from "@/components/construction/project-design-cost-calculator";
import { ProjectTemplateViewer } from "@/components/construction/project-template-viewer";
import { getDesignProjectPricingSettings } from "@/lib/design-project-pricing-config";

type ServiceVisualTheme =
  | "service-theme-foundation"
  | "service-theme-structure"
  | "service-theme-roofing"
  | "service-theme-engineering"
  | "service-theme-finishing";

function resolveServiceVisualTheme(pagePath: string): ServiceVisualTheme | null {
  if (pagePath.endsWith("/fundament")) return "service-theme-foundation";
  if (pagePath.endsWith("/karkas")) return "service-theme-structure";
  if (pagePath.endsWith("/krovlya")) return "service-theme-roofing";
  if (pagePath.endsWith("/inzheneriya")) return "service-theme-engineering";
  if (pagePath.endsWith("/otdelka")) return "service-theme-finishing";
  return null;
}

export async function ServiceLandingRenderer({
  document,
  pagePath,
}: {
  document: ServiceLandingDocument;
  /** Путь страницы для H1 из SEO (PageMeta), например `/services/fundament` */
  pagePath: string;
}) {
  const contact = await loadContactConfig();
  const designPricing = await getDesignProjectPricingSettings();
  const telephone = [contact.phoneRaw, contact.phone2Raw].filter((t) => t?.trim());
  const visualTheme = resolveServiceVisualTheme(pagePath);

  const heroH1ByIndex = new Map<number, string>();
  for (let i = 0; i < document.sections.length; i++) {
    const s = document.sections[i];
    if (s.type === "hero" || s.type === "heroCinematic") {
      heroH1ByIndex.set(i, await getPageH1(pagePath, s.title));
    }
  }

  return (
    <article className={visualTheme ?? undefined} data-service-page={pagePath}>
      {document.sections.map((section, i) => {
        const next = document.sections[i + 1];
        if (section.type === "heroCinematic" && next?.type === "storyTimeline") {
          return (
            <ServiceStoryScrollTrack
              key={i}
              hero={{
                title: heroH1ByIndex.get(i) ?? section.title,
                subtitle: section.subtitle,
                tag: section.tag,
                features: section.features,
                bannerImageDesktop: section.bannerImageDesktop,
                bannerImageMobile: section.bannerImageMobile,
              }}
              timelineItems={next.items}
            />
          );
        }
        if (
          section.type === "heroCinematic" &&
          next?.type === "designCalculator" &&
          document.sections[i + 2]?.type === "storyTimeline"
        ) {
          const timeline = document.sections[i + 2];
          return timeline.type === "storyTimeline" ? (
            <ProektirovanieStoryScrollSection
              key={i}
              hero={{
                title: heroH1ByIndex.get(i) ?? section.title,
                subtitle: section.subtitle,
                tag: section.tag,
                features: section.features,
                bannerImageDesktop: section.bannerImageDesktop,
                bannerImageMobile: section.bannerImageMobile,
              }}
              pricingSettings={designPricing}
              timelineItems={timeline.items}
            />
          ) : null;
        }
        if (i > 0 && document.sections[i - 1]?.type === "heroCinematic" && section.type === "storyTimeline") {
          return null;
        }
        if (
          i > 0 &&
          document.sections[i - 1]?.type === "heroCinematic" &&
          section.type === "designCalculator"
        ) {
          return null;
        }
        if (
          i > 1 &&
          document.sections[i - 2]?.type === "heroCinematic" &&
          document.sections[i - 1]?.type === "designCalculator" &&
          section.type === "storyTimeline"
        ) {
          return null;
        }

        switch (section.type) {
          case "schema":
            return (
              <LandingServiceSchema
                key={i}
                serviceName={section.serviceName}
                serviceDescription={section.serviceDescription}
                slug={section.slug}
                priceRange={section.priceRange}
                telephone={telephone}
              />
            );
          case "heroCinematic":
            return (
              <LandingHeroCinematic
                key={i}
                title={heroH1ByIndex.get(i) ?? section.title}
                subtitle={section.subtitle}
                tag={section.tag}
                features={section.features}
                bannerImageDesktop={section.bannerImageDesktop}
                bannerImageMobile={section.bannerImageMobile}
              />
            );
          case "storyTimeline":
            return <ServiceStoryTimeline key={i} items={section.items} />;
          case "designCalculator":
            return (
              <ProjectDesignCostCalculator
                key={i}
                source="individual-design"
                defaultArea={150}
                layout="banner"
                showPromoLink={false}
                pricingSettings={designPricing}
              />
            );
          case "projectTemplateViewer":
            return <ProjectTemplateViewer key={i} />;
          case "hero":
            return (
              <LandingHero
                key={i}
                title={heroH1ByIndex.get(i) ?? section.title}
                subtitle={section.subtitle}
                service={section.serviceKey}
                tag={section.tag}
                features={section.features}
                goals={section.goals}
                bannerImageDesktop={section.bannerImageDesktop}
                bannerImageMobile={section.bannerImageMobile}
              />
            );
          case "showcase":
            return (
              <LandingShowcase key={i} label={section.label} dark={section.dark} imageUrl={"imageUrl" in section ? section.imageUrl : undefined} />
            );
          case "textBlock":
            return (
              <LandingTextBlock
                key={i}
                leftText={section.leftText}
                rightText={section.rightText}
                accent={section.accent}
              />
            );
          case "pain":
            return (
              <LandingPain
                key={i}
                title={section.title}
                points={section.points}
                conclusion={section.conclusion}
              />
            );
          case "advantages":
            return <LandingAdvantages key={i} title={section.title} items={section.items} />;
          case "steps":
            return <LandingSteps key={i} title={section.title} steps={section.steps} />;
          case "faq":
            return <LandingFaq key={i} service={section.serviceKey} items={section.items} />;
          default:
            return null;
        }
      })}
    </article>
  );
}
