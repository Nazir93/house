import { describe, expect, it } from "vitest";
import { getEffectiveCalculatorUi, type HouseProjectItem } from "@/lib/construction-data";
import { AURORA_PROJECT_CALCULATOR_UI } from "@/lib/project-calculator-aurora-defaults";

function stubProject(over: Partial<HouseProjectItem> = {}): HouseProjectItem {
  return {
    id: "p1",
    slug: "test-dom",
    title: "Тест",
    shortDescription: "",
    description: "",
    floors: 1,
    area: 120,
    price: 10_000_000,
    rooms: 3,
    bathrooms: 2,
    materials: ["Газобетон"],
    isNew: false,
    pricePromo: null,
    mortgageEnabled: true,
    mortgageMode: "CALCULATOR",
    published: true,
    order: 0,
    media: [],
    completion: [],
    constructionSchedule: [],
    anchors: [],
    builtObjectSlug: null,
    heroPricing: null,
    calculatorUi: null,
    ...over,
  };
}

describe("getEffectiveCalculatorUi", () => {
  it("без calculatorJson в БД — полный пресет Аврора (partOfSoul, addons, stages)", () => {
    const ui = getEffectiveCalculatorUi(stubProject({ calculatorUi: null }));
    expect(ui.partOfSoul?.enabled).toBe(true);
    expect(ui.addons?.length).toBe(AURORA_PROJECT_CALCULATOR_UI.addons?.length);
    expect(ui.stages?.foundation?.rows?.length).toBeGreaterThan(0);
  });

  it("этап «Подготовка» — 7 пунктов для всех технологий (общий stages.prep)", () => {
    const prep = getEffectiveCalculatorUi(stubProject({ calculatorUi: null })).stages?.prep?.rows ?? [];
    expect(prep).toHaveLength(7);
    expect(prep[0]?.label).toBe("Индивидуальный проект дома");
    expect(prep[6]?.label).toBe("Подбор отделочных материалов");
    const gas = getEffectiveCalculatorUi(stubProject({ calculatorUi: null, materials: ["Газобетон"] }));
    const brick = getEffectiveCalculatorUi(stubProject({ calculatorUi: null, materials: ["Кирпич"] }));
    expect(gas.stages?.prep?.rows).toEqual(brick.stages?.prep?.rows);
  });

  it("этап «Фундамент» — 16 пунктов для всех технологий (общий stages.foundation)", () => {
    const foundation =
      getEffectiveCalculatorUi(stubProject({ calculatorUi: null })).stages?.foundation?.rows ?? [];
    expect(foundation).toHaveLength(16);
    expect(foundation[0]?.label).toBe("Фундаментная плита");
    expect(foundation[15]?.label).toBe("Контроль качества");
    const gas = getEffectiveCalculatorUi(stubProject({ calculatorUi: null, materials: ["Газобетон"] }));
    const brick = getEffectiveCalculatorUi(stubProject({ calculatorUi: null, materials: ["Кирпич"] }));
    expect(gas.stages?.foundation?.rows).toEqual(brick.stages?.foundation?.rows);
  });

  it("этап «Стены» — газобетон: 19 пунктов (stagesByTier.gas.walls)", () => {
    const walls = getEffectiveCalculatorUi(stubProject({ calculatorUi: null })).stagesByTier?.gas?.walls?.rows ?? [];
    expect(walls).toHaveLength(19);
    expect(walls[0]?.value).toContain("2,7 м");
    expect(walls[18]?.value).toContain("резки и шлифовки блоков");
  });

  it("этап «Стены» — керамический блок: 19 пунктов (stagesByTier.ceramic.walls)", () => {
    const walls =
      getEffectiveCalculatorUi(stubProject({ calculatorUi: null })).stagesByTier?.ceramic?.walls?.rows ?? [];
    expect(walls).toHaveLength(19);
    expect(walls[2]?.value).toContain("380 мм");
    expect(walls[18]?.value).toContain("повышенной нагрузки");
  });

  it("этап «Стены» — кирpич: 14 пунктов (stagesByTier.brick.walls)", () => {
    const walls =
      getEffectiveCalculatorUi(stubProject({ calculatorUi: null })).stagesByTier?.brick?.walls?.rows ?? [];
    expect(walls).toHaveLength(14);
    expect(walls[2]?.value).toContain("2,1 НФ");
    expect(walls[13]?.value).toContain("точной геометрией");
  });

  it("этап «Пояс» — газобетон: 15 пунктов (stagesByTier.gas.belt)", () => {
    const belt = getEffectiveCalculatorUi(stubProject({ calculatorUi: null })).stagesByTier?.gas?.belt?.rows ?? [];
    expect(belt).toHaveLength(15);
    expect(belt[0]?.value).toContain("225 × 250 мм");
    expect(belt[14]?.value).toContain("перед устройством перекрытий");
  });

  it("этап «Пояс» — керамobлок и кирpich: 15 пунктов (общий пресет)", () => {
    const ui = getEffectiveCalculatorUi(stubProject({ calculatorUi: null }));
    const ceramic = ui.stagesByTier?.ceramic?.belt?.rows ?? [];
    const brick = ui.stagesByTier?.brick?.belt?.rows ?? [];
    expect(ceramic).toHaveLength(15);
    expect(brick).toEqual(ceramic);
    expect(ceramic[0]?.value).toContain("210 × 225 мм");
    expect(ceramic[12]?.label).toBe("Готовый армопояс");
  });

  it("этап «Перекрытия» — в пресете межэтажные ЖБ плиты (12 пунктов)", () => {
    const ui = getEffectiveCalculatorUi(stubProject({ calculatorUi: null }));
    expect(ui.stages?.floors?.rows).toHaveLength(12);
    expect(ui.stages?.floors?.rows?.[0]?.value).toContain("железобетонные плиты");
  });

  it("этап «Окна» — 16 пунктов для всех технологий (общий stages.windows)", () => {
    const windows = getEffectiveCalculatorUi(stubProject({ calculatorUi: null })).stages?.windows?.rows ?? [];
    expect(windows).toHaveLength(16);
    expect(windows[0]?.value).toContain("REHAU");
    expect(windows[15]?.value).toContain("стальное армирование");
  });

  it("этап «Двери» — 12 пунктов для всех технологий (общий stages.doors)", () => {
    const doors = getEffectiveCalculatorUi(stubProject({ calculatorUi: null })).stages?.doors?.rows ?? [];
    expect(doors).toHaveLength(12);
    expect(doors[0]?.value).toContain("российского производства");
    expect(doors[11]?.value).toContain("герметизацией монтажного шва");
  });

  it("для любого slug, не только aurora — тот же пресет", () => {
    const ui = getEffectiveCalculatorUi(stubProject({ slug: "my-new-house", calculatorUi: null }));
    expect(ui.partOfSoul?.enabled).toBe(true);
    expect(ui.stagesByTier?.gas?.walls?.rows?.length).toBeGreaterThan(0);
  });

  it("переопределение из БД: можно отключить формульный расчёт", () => {
    const ui = getEffectiveCalculatorUi(
      stubProject({
        calculatorUi: { partOfSoul: { enabled: false, smallHouseThresholdSqm: 100, shellSurchargeUnderThreshold: 0.15, addonsSurchargeUnderThreshold: 0.1 } },
      })
    );
    expect(ui.partOfSoul?.enabled).toBe(false);
    expect(ui.addons?.length).toBeGreaterThan(0);
  });
});
