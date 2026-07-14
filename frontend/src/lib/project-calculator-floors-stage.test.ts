import { describe, expect, it } from "vitest";
import {
  FLOORS_STAGE_ROWS_MULTI_STORY,
  FLOORS_STAGE_ROWS_SINGLE_STORY,
} from "@/lib/project-calculator-aurora-defaults";
import { resolveFloorsStageRows, resolveFloorsStageTable } from "@/lib/project-calculator-floors-stage";
import type { ProjectCalculatorUi } from "@/lib/project-calculator-types";

const baseUi: ProjectCalculatorUi = {
  stages: {
    floors: {
      imageUrl: "/images/banner/banner-hero-01.png",
      rows: FLOORS_STAGE_ROWS_MULTI_STORY.map((row) => ({ ...row })),
    },
  },
};

describe("project-calculator-floors-stage", () => {
  it("1 этаж — 12 пунктов балочного перекрытия для любого материала", () => {
    for (const tierKey of ["gas", "ceramic", "brick"]) {
      const rows = resolveFloorsStageRows(baseUi, 1, tierKey);
      expect(rows).toHaveLength(12);
      expect(rows[0]?.value).toContain("камерной сушки");
      expect(rows[11]?.value).toContain("проектной документацией");
      expect(rows).toEqual(FLOORS_STAGE_ROWS_SINGLE_STORY.map((r) => ({ ...r })));
    }
  });

  it("1,5 и 2 этажа — межэтажные ЖБ плиты + чердачные балки", () => {
    for (const floors of [1.5, 2] as const) {
      for (const tierKey of ["gas", "ceramic", "brick"]) {
        const rows = resolveFloorsStageRows(baseUi, floors, tierKey);
        expect(rows[0]).toMatchObject({ label: "Межэтажное перекрытие", section: true });
        expect(rows[1]?.value).toContain("железобетонные плиты");
        const atticHeading = rows.find((r) => r.label === "Чердачное перекрытие");
        expect(atticHeading?.section).toBe(true);
        const atticFirst = rows[1 + FLOORS_STAGE_ROWS_MULTI_STORY.length + 1];
        expect(atticFirst?.value).toContain("камерной сушки");
        expect(rows).toHaveLength(2 + FLOORS_STAGE_ROWS_MULTI_STORY.length + FLOORS_STAGE_ROWS_SINGLE_STORY.length);
      }
    }
  });

  it("secondaryImageUrl пробрасывается в таблицу (две схемы для 1,5/2)", () => {
    const ui: ProjectCalculatorUi = {
      stages: {
        floors: {
          imageUrl: "/images/calculator/floors-multi-story-gas.png",
          secondaryImageUrl: "/images/calculator/floors-multi-story-gas-b.png",
          rows: FLOORS_STAGE_ROWS_MULTI_STORY.map((row) => ({ ...row })),
        },
      },
    };
    const table = resolveFloorsStageTable(ui, 2, "gas", ["fallback"]);
    expect(table.secondaryImageUrl).toBe("/images/calculator/floors-multi-story-gas-b.png");
    expect(table.rows.some((r) => r.label === "Чердачное перекрытие")).toBe(true);
  });

  it("1,5/2 + газобетон без custom secondary — схема чердака из привязки", () => {
    const table = resolveFloorsStageTable(baseUi, 2, "gas", ["fallback"]);
    expect(table.secondaryImageUrl).toBe("/images/calculator/floors-attic-multi-story-gas.png");
  });
});
