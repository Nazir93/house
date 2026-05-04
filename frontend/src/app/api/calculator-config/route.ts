import { NextResponse } from "next/server";
import { getHouseConstructionCalculatorConfig } from "@/lib/house-construction-calculator-config";

/** Публичный прайс калькулятора (уже слитый дефолт + БД). */
export async function GET() {
  const config = await getHouseConstructionCalculatorConfig();
  return NextResponse.json(config, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" },
  });
}
