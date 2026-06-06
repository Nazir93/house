"use client";

import { ProjectDesignCostCalculator } from "@/components/construction/project-design-cost-calculator";
import { ServiceStoryScrollTrack } from "@/components/landing/service-story-scroll-track";
import type { DesignProjectPricingSettings } from "@/lib/design-project-pricing";
import type { StoryTimelineItem } from "@/lib/service-landing-schema";
import type { ComponentProps } from "react";

type HeroProps = ComponentProps<typeof ServiceStoryScrollTrack>["hero"];

export function ProektirovanieStoryScrollSection({
  hero,
  timelineItems,
  pricingSettings,
}: {
  hero: HeroProps;
  timelineItems: StoryTimelineItem[];
  pricingSettings: DesignProjectPricingSettings;
}) {
  return (
    <ServiceStoryScrollTrack
      hero={hero}
      timelineItems={timelineItems}
      afterHero={(spineOriginRef) => (
        <ProjectDesignCostCalculator
          source="individual-design"
          defaultArea={150}
          layout="banner"
          showPromoLink={false}
          pricingSettings={pricingSettings}
          spineOriginRef={spineOriginRef}
        />
      )}
    />
  );
}
