import { NextResponse } from "next/server";
import { getCalculatorConfig, buildPublicCatalog } from "@/lib/calculator-catalog";
import type { HouseCalculatorCategoryId } from "@/lib/house-project-calculator-engine";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as HouseCalculatorCategoryId | null;
  const categoryId =
    category && ["a", "b", "c", "d", "e", "f"].includes(category) ? category : "a";

  const config = await getCalculatorConfig();
  const catalog = buildPublicCatalog(config, categoryId);

  return NextResponse.json({
    categoryId,
    facades: catalog.facades,
    engineering: catalog.engineering,
    construction: catalog.construction,
  });
}
