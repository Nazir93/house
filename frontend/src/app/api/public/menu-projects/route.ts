import { NextResponse } from "next/server";

import { getHouseProjects } from "@/lib/construction-data";
import { getProjectRenders } from "@/lib/construction-shared";
import { resolveProjectListingPriceRub } from "@/lib/project-listing-price";

const COVER_FALLBACK = "/images/banner/banner-hero-01.png";

export async function GET() {
  const projects = await getHouseProjects();
  const items = [...projects]
    .filter((p) => p.published)
    .sort((a, b) =>
      a.order !== b.order ?
        a.order - b.order
      : resolveProjectListingPriceRub(a) - resolveProjectListingPriceRub(b),
    )
    .slice(0, 8)
    .map((p) => {
      const cover = getProjectRenders(p)[0]?.url ?? COVER_FALLBACK;
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        area: p.area,
        price: resolveProjectListingPriceRub(p),
        cover,
        alt: getProjectRenders(p)[0]?.alt || p.title,
      };
    });

  return NextResponse.json({ projects: items });
}
