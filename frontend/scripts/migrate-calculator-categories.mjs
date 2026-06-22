/**
 * Проставляет calculatorCategory для проектов без явной категории.
 * Запуск: node scripts/migrate-calculator-categories.mjs (из frontend/)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MAP = [
  { floors: 1, roof: "dual", cat: "a" },
  { floors: 1, roof: "triple", cat: "b" },
  { floors: 1, roof: "quad", cat: "c" },
  { floors: 1, roof: "flat", cat: "i" },
  { floors: 1.5, roof: "dual", cat: "d" },
  { floors: 1.5, roof: "triple", cat: "e" },
  { floors: 2, roof: "quad", cat: "f" },
  { floors: 2, roof: "dual", cat: "g" },
  { floors: 2, roof: "triple", cat: "h" },
  { floors: 2, roof: "flat", cat: "j" },
];

function inferRoof(calculatorJson, floors) {
  const roof = calculatorJson?.partOfSoul?.defaultRoof;
  if (roof === "dual" || roof === "triple" || roof === "quad" || roof === "flat") return roof;
  if (floors >= 2) return "quad";
  return "dual";
}

function inferFloors(floorsInt, calculatorJson) {
  const pf = calculatorJson?.partOfSoul?.pricingFloors;
  if (pf === 1 || pf === 1.5 || pf === 2) return pf;
  if (floorsInt >= 2) return 2;
  return 1;
}

async function main() {
  const projects = await prisma.houseProject.findMany({
    select: { id: true, floors: true, calculatorCategory: true, calculatorJson: true },
  });
  let updated = 0;
  for (const p of projects) {
    if (p.calculatorCategory) continue;
    const json = p.calculatorJson;
    const pf = inferFloors(p.floors, json);
    const roof = inferRoof(json, pf);
    const row = MAP.find((m) => m.floors === pf && m.roof === roof);
    if (!row) continue;
    await prisma.houseProject.update({
      where: { id: p.id },
      data: { calculatorCategory: row.cat },
    });
    updated++;
  }
  console.log(`Updated ${updated} projects`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
