import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { getCalculatorConfig } from "@/lib/calculator-catalog";
import { seedCalculatorCatalog } from "@/lib/seed-calculator-catalog";
import { revalidateTagWithProfile } from "@/lib/revalidate-tag";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const count = await prisma.calculatorCategory.count();
    if (count === 0) {
      await seedCalculatorCatalog();
      revalidateTagWithProfile("calculator-catalog");
      revalidateTagWithProfile("house-project-calculator-config");
    }

    const [categories, facades, options, settings] = await Promise.all([
      prisma.calculatorCategory.findMany({
        include: { shellPrices: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.calculatorFacadeType.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.calculatorOption.findMany({ orderBy: [{ groupSlug: "asc" }, { sortOrder: "asc" }] }),
      prisma.calculatorSettings.findUnique({ where: { id: "default" } }),
    ]);

    const config = await getCalculatorConfig();

    return NextResponse.json({ categories, facades, options, settings, config });
  } catch (e) {
    console.error("[ADMIN CALCULATOR GET]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    if (body.action === "seed") {
      const result = await seedCalculatorCatalog();
      revalidateTagWithProfile("calculator-catalog");
      revalidateTagWithProfile("house-project-calculator-config");
      return NextResponse.json({ ok: true, ...result });
    }

    if (body.action === "bulk_update" && typeof body.percent === "number") {
      const percent = body.percent;
      const factor = 1 + percent / 100;
      const group = typeof body.groupSlug === "string" ? body.groupSlug : null;

      if (group === "construction" || group === "engineering") {
        const opts = await prisma.calculatorOption.findMany({ where: { groupSlug: group } });
        await Promise.all(
          opts.map((o: (typeof opts)[number]) =>
            prisma.calculatorOption.update({
              where: { id: o.id },
              data: { pricePerUnit: Math.round(o.pricePerUnit * factor) },
            })
          )
        );
      } else if (group === "facade") {
        const facades = await prisma.calculatorFacadeType.findMany();
        await Promise.all(
          facades.map((f: (typeof facades)[number]) =>
            prisma.calculatorFacadeType.update({
              where: { id: f.id },
              data: { pricePerM2: Math.round(f.pricePerM2 * factor) },
            })
          )
        );
      } else if (group === "shell") {
        const prices = await prisma.calculatorShellPrice.findMany();
        await Promise.all(
          prices.map((p: (typeof prices)[number]) =>
            prisma.calculatorShellPrice.update({
              where: { id: p.id },
              data: { pricePerM2: Math.round(p.pricePerM2 * factor) },
            })
          )
        );
      }

      revalidateTagWithProfile("calculator-catalog");
      revalidateTagWithProfile("house-project-calculator-config");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("[ADMIN CALCULATOR POST]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
