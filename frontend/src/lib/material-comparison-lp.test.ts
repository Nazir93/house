import { describe, expect, it } from "vitest";

import { MATERIAL_COMPARISON_ROWS } from "@/lib/advertising-landing";

describe("MATERIAL_COMPARISON_ROWS — полный текст с LP", () => {
  it("три материала с полным содержимым, без усечений ключевых фраз", () => {
    expect(MATERIAL_COMPARISON_ROWS).toHaveLength(3);

    const gas = MATERIAL_COMPARISON_ROWS.find((r) => r.id === "gas")!;
    expect(gas.label).toBe("Газобетон D400");
    expect(gas.thicknessNote).toBe("375 мм · Рациональный баланс");
    expect(gas.lead).toContain("точной геометрией");
    expect(gas.points).toEqual([
      "Бюджет: обычно ниже при одинаковой комплектации",
      "Скорость строительства: высокая",
      "Нагрузка на фундамент: ниже",
      "Тепловая инерция: средняя",
      "Важно учитывать: армирование кладки и обязательную защиту фасада",
    ]);
    expect(gas.suitsIf).toContain("энергоэффективность");

    const brick = MATERIAL_COMPARISON_ROWS.find((r) => r.id === "brick")!;
    expect(brick.label).toBe("Керамический кирпич 2,1 НФ");
    expect(brick.thicknessNote).toBe("380 мм · Капитальный выбор");
    expect(brick.lead).toContain("акустический комфорт");
    expect(brick.points).toHaveLength(5);
    expect(brick.points[1]).toContain("большего объёма кладки");
    expect(brick.suitsIf).toContain("длительная эксплуатация");
    expect(brick.badgeAbove?.toLowerCase()).toContain("капитального дома");

    const ceramic = MATERIAL_COMPARISON_ROWS.find((r) => r.id === "ceramic")!;
    expect(ceramic.label).toBe("Крупноформатный керамоблок");
    expect(ceramic.thicknessNote).toBe("380 мм · Керамика быстрее");
    expect(ceramic.lead).toContain("быстрее, чем из кирпича");
    expect(ceramic.points).toEqual([
      "Бюджет: средний+",
      "Скорость строительства: выше, чем у кирпича",
      "Нагрузка на фундамент: ниже, чем у кирпича",
      "Тепловая инерция: высокая",
      "Важно учитывать: качество кладки, заполнение швов, резку блоков и правильный крепёж",
    ]);
    expect(ceramic.suitsIf).toContain("меньшей массой");
  });
});
