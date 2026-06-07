import { describe, expect, it } from "vitest";

import { CLIENTS_CHOOSE_SERVICES } from "@/lib/clients-choose-services";

describe("clients-choose-services", () => {
  it("пять услуг с уникальными slug", () => {
    expect(CLIENTS_CHOOSE_SERVICES).toHaveLength(5);
    const hrefs = CLIENTS_CHOOSE_SERVICES.map((s) => s.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("фундамент ведёт на страницу услуги", () => {
    const fundament = CLIENTS_CHOOSE_SERVICES.find((s) => s.title === "Фундамент");
    expect(fundament?.href).toBe("/services/fundament");
  });
});
