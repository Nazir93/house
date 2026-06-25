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
import { AdvertisingLandingClient } from "./advertising-landing-client";

export const revalidate = 60;

export function generateAdvertisingLandingMetadata(slug: AdvertisingLandingSlug): Metadata {
  const config = getAdvertisingLandingConfig(slug);
  if (!config) return { title: SITE_NAME, robots: { index: false, follow: false } };

  return {
    title: config.title,
    description: config.description,
    robots: { index: false, follow: false },
    alternates: { canonical: config.path },
    openGraph: {
      title: config.title,
      description: config.description,
      type: "website",
    },
  };
}

export async function AdvertisingLandingPage({ slug }: { slug: AdvertisingLandingSlug }) {
  const config = getAdvertisingLandingConfig(slug);
  if (!config) notFound();

  const [projects, builtObjects] = await Promise.all([
    getHouseProjects("author"),
    getBuiltObjects(),
  ]);
  const selectedProjects = pickAdvertisingLandingProjects(projects, config);
  const portfolio = pickAdvertisingLandingPortfolio(builtObjects, config);

  return (
    <AdvertisingLandingClient config={config} projects={selectedProjects} portfolio={portfolio} />
  );
}

