import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeProjectQuoteForSlug } from "@/lib/project-calculator-quote-service";

const LEGACY_ID_MAP: Record<string, { group: "engineering" | "construction" | "facade"; slug: string }> = {
  el: { group: "engineering", slug: "electric" },
  water: { group: "engineering", slug: "water" },
  sew: { group: "engineering", slug: "sewer" },
  bio: { group: "engineering", slug: "bio" },
  rad: { group: "engineering", slug: "radiators" },
  floor: { group: "engineering", slug: "heatedFloor" },
  boiler: { group: "engineering", slug: "boiler" },
  interior_plaster: { group: "construction", slug: "interior_plaster" },
  blind: { group: "construction", slug: "blind_area" },
  drain: { group: "construction", slug: "drainage" },
  soffit: { group: "construction", slug: "soffits" },
  gutter: { group: "construction", slug: "gutter" },
  roof_fold: { group: "construction", slug: "roof_folding" },
  roof_soft: { group: "construction", slug: "roof_soft" },
  roof_ins_200: { group: "construction", slug: "roof_insulation_200" },
  roof_ins_250: { group: "construction", slug: "roof_insulation_250" },
  stairs: { group: "construction", slug: "monolithic_stairs" },
  overlap: { group: "construction", slug: "monolithic_overlap" },
  fac_brick: { group: "facade", slug: "brick" },
  fac_plaster: { group: "facade", slug: "plaster" },
  fac_thermo: { group: "facade", slug: "thermo" },
  fac_brick_ins: { group: "facade", slug: "brick_insulated" },
};

const bodySchema = z.object({
  projectSlug: z.string().min(1),
  tierId: z.string().min(1),
  tierLabel: z.string().default(""),
  facadeSlug: z.string().nullable().optional(),
  engineeringSlugs: z.array(z.string()).optional(),
  constructionSlugs: z.array(z.string()).optional(),
  selectedAddonIds: z.array(z.string()).default([]),
  transportBandId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const data = parsed.data;
  let facadeSlug = data.facadeSlug ?? null;
  const engineeringSlugs = [...(data.engineeringSlugs ?? [])];
  const constructionSlugs = [...(data.constructionSlugs ?? [])];

  if (!facadeSlug && data.selectedAddonIds.length) {
    for (const id of data.selectedAddonIds) {
      const m = LEGACY_ID_MAP[id];
      if (!m) continue;
      if (m.group === "facade") facadeSlug = m.slug;
      else if (m.group === "engineering") engineeringSlugs.push(m.slug);
      else constructionSlugs.push(m.slug);
    }
  }

  const result = await computeProjectQuoteForSlug(data.projectSlug, {
    tierId: data.tierId,
    tierLabel: data.tierLabel,
    facadeSlug,
    engineeringSlugs,
    constructionSlugs,
    transportBandId: data.transportBandId,
  });

  if ("error" in result) {
    const status = result.error === "not_found" ? 404 : result.error === "no_category" ? 422 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(result);
}
