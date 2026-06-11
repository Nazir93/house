import { describe, expect, it } from "vitest";
import { leadSourceFilterWhere } from "./lead-admin-ui";

describe("leadSourceFilterWhere", () => {
  it("returns null for empty filter", () => {
    expect(leadSourceFilterWhere("")).toBeNull();
  });

  it("groups calculator sources", () => {
    const where = leadSourceFilterWhere("calculator");
    expect(where).toEqual({
      source: {
        in: ["calculator", "calculator-pizza", "price-smeta", "project-calculator", "house-project-design"],
      },
    });
  });

  it("matches all service forms by prefix", () => {
    expect(leadSourceFilterWhere("services")).toEqual({ source: { startsWith: "service-" } });
  });

  it("falls back to exact source match", () => {
    expect(leadSourceFilterWhere("service-foundation")).toEqual({ source: "service-foundation" });
  });
});
