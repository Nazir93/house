import { NextResponse } from "next/server";
import { z } from "zod";
import { computeProjectQuoteForSlug } from "@/lib/project-calculator-quote-service";
import { checkPublicApiRateLimitAsync, rateLimitKeyFromHeaders } from "@/lib/public-api-rate-limit";

const bodySchema = z.object({
  tierId: z.string().min(1),
  tierLabel: z.string().default(""),
  facadeSlug: z.string().nullable().optional(),
  engineeringSlugs: z.array(z.string()).default([]),
  constructionSlugs: z.array(z.string()).default([]),
  /** @deprecated используйте engineeringSlugs + constructionSlugs */
  selectedAddonIds: z.array(z.string()).optional(),
  transportBandId: z.string().optional(),
});

export async function POST(req: Request, props: { params: Promise<{ slug: string }> }) {
  if (
    !(await checkPublicApiRateLimitAsync(rateLimitKeyFromHeaders(req.headers), {
      namespace: "project-quote",
      max: 60,
      windowMs: 10 * 60 * 1000,
    }))
  ) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { slug } = await props.params;
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
  const result = await computeProjectQuoteForSlug(slug, {
    tierId: data.tierId,
    tierLabel: data.tierLabel,
    facadeSlug: data.facadeSlug ?? null,
    engineeringSlugs: data.engineeringSlugs,
    constructionSlugs: data.constructionSlugs,
    transportBandId: data.transportBandId,
  });

  if ("error" in result) {
    const status =
      result.error === "not_found" ? 404
      : result.error === "invalid_option" || result.error === "invalid_facade" ? 400
      : result.error === "no_category" ? 422
      : 500;
    return NextResponse.json({ error: result.error, slug: "slug" in result ? result.slug : undefined }, { status });
  }

  return NextResponse.json(result);
}
