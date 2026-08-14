import { describe, expect, it } from "vitest";

import { SITE_NAME } from "@/lib/constants";
import {
  HOME_TURNKEY_SERVICES_H2,
  HOME_TURNKEY_SERVICES_LEAD,
  HOME_TURNKEY_SERVICE_TILES,
} from "@/lib/home-turnkey-services-block";

describe("home-turnkey-services-block (SEO §4)", () => {
  it("H2 и короткий lead без простыни", () => {
    expect(HOME_TURNKEY_SERVICES_H2).toBe("Строительство частных домов под ключ");
    expect(HOME_TURNKEY_SERVICES_LEAD).toHaveLength(2);
    expect(HOME_TURNKEY_SERVICES_LEAD[0]).toContain(SITE_NAME);
    expect(HOME_TURNKEY_SERVICES_LEAD[0]).toContain("Санкт-Петербурге и Ленинградской области");
    expect(HOME_TURNKEY_SERVICES_LEAD[1]).toContain("проектирование");
    expect(HOME_TURNKEY_SERVICES_LEAD[1]).toContain("фундамента");
    expect(HOME_TURNKEY_SERVICES_LEAD.join(" ").length).toBeLessThan(550);
  });

  it("пять плиток с HTML-путями на /services/*", () => {
    expect(HOME_TURNKEY_SERVICE_TILES.map((t) => t.label)).toEqual([
      "Проектирование",
      "Фундамент",
      "Стены дома",
      "Кровля",
      "Инженерные системы",
    ]);
    expect(HOME_TURNKEY_SERVICE_TILES.map((t) => t.href)).toEqual([
      "/services/proektirovanie",
      "/services/fundament",
      "/services/karkas",
      "/services/krovlya",
      "/services/inzheneriya",
    ]);
    for (const tile of HOME_TURNKEY_SERVICE_TILES) {
      expect(tile.href.startsWith("/services/")).toBe(true);
      expect(tile.href).not.toContain("?");
    }
  });
});
