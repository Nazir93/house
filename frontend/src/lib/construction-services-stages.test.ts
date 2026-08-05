import { describe, expect, it } from "vitest";

import {
  CONSTRUCTION_SERVICE_STAGES,
  getConstructionServiceStage,
} from "@/lib/construction-services-stages";

describe("construction-services-stages", () => {
  it("четыре этапа со своими фото", () => {
    expect(CONSTRUCTION_SERVICE_STAGES).toHaveLength(4);
    expect(CONSTRUCTION_SERVICE_STAGES.map((s) => s.id)).toEqual([
      "site-check",
      "utilities",
      "facade",
      "interior",
    ]);
    expect(CONSTRUCTION_SERVICE_STAGES[0]?.title).toBe("Комплексная проверка участка");
    expect(CONSTRUCTION_SERVICE_STAGES[1]?.title).toBe("Наружные сети и участок");
    expect(CONSTRUCTION_SERVICE_STAGES[2]?.title).toBe("Отделка фасадов");
    expect(CONSTRUCTION_SERVICE_STAGES[3]?.title).toBe(
      "Внутренняя отделка и внутренние инженерные коммуникации",
    );
  });

  it("у каждого этапа уникальный image под /images/services/stages/", () => {
    const images = CONSTRUCTION_SERVICE_STAGES.map((s) => s.image);
    expect(new Set(images).size).toBe(4);
    for (const image of images) {
      expect(image).toMatch(/^\/images\/services\/stages\/[a-z-]+\.png$/);
    }
  });

  it("getConstructionServiceStage: находит id и падает на первый при неизвестном", () => {
    expect(getConstructionServiceStage(CONSTRUCTION_SERVICE_STAGES, "facade").id).toBe("facade");
    expect(getConstructionServiceStage(CONSTRUCTION_SERVICE_STAGES, "unknown").id).toBe("site-check");
  });
});
