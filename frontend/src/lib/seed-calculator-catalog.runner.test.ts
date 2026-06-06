import { describe, expect, it } from "vitest";
import { seedCalculatorCatalog } from "./seed-calculator-catalog";

/** Запуск: npm run db:seed-calculator (нужен DATABASE_URL в .env.local) */
describe("seed calculator catalog (db runner)", () => {
  it.skipIf(!process.env.DATABASE_URL)(
    "writes TZ defaults to calculator tables",
    async () => {
      const result = await seedCalculatorCatalog();
      expect(result.categories).toBe(8);
      expect(result.options).toBeGreaterThan(10);
    },
    60_000
  );
});
