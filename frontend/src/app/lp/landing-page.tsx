import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBuiltObjects, getHouseProjects } from "@/lib/construction-data";
import {
  getAdvertisingLandingConfig,
  pickAdvertisingLandingPortfolio,
  pickAdvertisingLandingProjects,
  type AdvertisingLandingSlug,
} from "@/lib/advertising-landing";
import { SITE_NAME } from "@/lib/constants";
import { getPublicReviews } from "@/lib/get-public-reviews";
import { buildSelfReferencingCanonical } from "@/lib/seo/self-referencing-canonical";
import { AdvertisingLandingClient } from "./advertising-landing-client";

export const revalidate = 60;

export function generateAdvertisingLandingMetadata(slug: AdvertisingLandingSlug): Metadata {
  const config = getAdvertisingLandingConfig(slug);
  if (!config) return { title: SITE_NAME, robots: { index: false, follow: false } };

  return {
    title: config.title,
    description: config.description,
    robots: { index: false, follow: false },
    alternates: { canonical: buildSelfReferencingCanonical(config.path) },
    openGraph: {
      title: config.title,
      description: config.description,
      type: "website",
      url: buildSelfReferencingCanonical(config.path),
    },
  };
}

export async function AdvertisingLandingPage({ slug }: { slug: AdvertisingLandingSlug }) {
  const config = getAdvertisingLandingConfig(slug);
  if (!config) notFound();

  const [projects, builtObjects, reviews] = await Promise.all([
    getHouseProjects("author"),
    getBuiltObjects(),
    getPublicReviews(),
  ]);
  const selectedProjects = pickAdvertisingLandingProjects(projects, config);
  const portfolio = pickAdvertisingLandingPortfolio(builtObjects, config);

  return (
    <AdvertisingLandingClient
      config={config}
      projects={selectedProjects}
      portfolio={portfolio}
      reviews={reviews}
    />
  );
}

