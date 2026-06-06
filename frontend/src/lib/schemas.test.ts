import { describe, expect, it } from "vitest";
import { leadFormSchema } from "./schemas";

describe("leadFormSchema", () => {
  const base = { name: "Иван", phone: "+7 999 111-22-33" };

  it("accepts bounded tracking fields", () => {
    const parsed = leadFormSchema.safeParse({
      ...base,
      source: "project-calculator",
      pageUrl: "https://example.test/project?a=1",
      utmSource: "direct",
      calcData: { kind: "quote", total: 100 },
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects oversized calcData", () => {
    const parsed = leadFormSchema.safeParse({
      ...base,
      calcData: { text: "x".repeat(20_000) },
    });

    expect(parsed.success).toBe(false);
  });
});
