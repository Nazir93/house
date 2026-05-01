import { LandingHero } from "@/components/landing/landing-hero";
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

export async function ServiceLandingRenderer({
  document,
  pagePath,
}: {
  document: ServiceLandingDocument;
  /** Путь страницы для H1 из SEO (PageMeta), например `/services/electrical` */
  pagePath: string;
}) {
  const contact = await loadContactConfig();
  const telephone: [string, string] = [contact.phoneRaw, contact.phone2Raw];

  const heroH1ByIndex = new Map<number, string>();
  for (let i = 0; i < document.sections.length; i++) {
    const s = document.sections[i];
    if (s.type === "hero") {
      heroH1ByIndex.set(i, await getPageH1(pagePath, s.title));
    }
  }

  return (
    <article>
      {document.sections.map((section, i) => {
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
