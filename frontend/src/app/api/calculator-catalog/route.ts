import { NextResponse } from "next/server";
import { getCalculatorConfig, buildPublicCatalog } from "@/lib/calculator-catalog";
import { isHouseCalculatorCategoryId, type HouseCalculatorCategoryId } from "@/lib/house-project-calculator-engine";
import type { PartOfSoulWallMaterial } from "@/lib/part-of-soul-pricing";

export const revalidate = 30;

function parseWallMaterial(raw: string | null): PartOfSoulWallMaterial | null {
  if (raw === "gas" || raw === "ceramic" || raw === "brick") return raw;
  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as HouseCalculatorCategoryId | null;
  const categoryId = isHouseCalculatorCategoryId(category) ? category : "a";
  const wallMaterial = parseWallMaterial(url.searchParams.get("wall"));

  const config = await getCalculatorConfig();
  const catalog = buildPublicCatalog(config, categoryId, [], wallMaterial);

  return NextResponse.json(
    {
      categoryId,
      facades: catalog.facades,
      engineering: catalog.engineering,
      construction: catalog.construction,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
