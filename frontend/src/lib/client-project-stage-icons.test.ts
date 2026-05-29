import { describe, expect, it } from "vitest";
import {
  resolveDefaultIconKeyForStageTitle,
  resolveStageIconKeyForDisplay,
  resolveStageIconKeyForPersist,
} from "./client-project-stage-icons";

describe("client-project-stage-icons", () => {
  it("8 стандартных этапов по точному названию", () => {
    expect(resolveDefaultIconKeyForStageTitle("Фундамент")).toBe("foundation");
    expect(resolveDefaultIconKeyForStageTitle("Стены")).toBe("walls");
    expect(resolveDefaultIconKeyForStageTitle("Внутренняя отделка")).toBe("interior");
    expect(resolveDefaultIconKeyForStageTitle("Благоустройство участка и въездная группа")).toBe(
      "landscaping"
    );
  });

  it("legacy названия из старых объектов", () => {
    expect(resolveDefaultIconKeyForStageTitle("Стены 1–2-й этажи")).toBe("walls");
    expect(resolveDefaultIconKeyForStageTitle("Отделка внутренняя")).toBe("interior");
  });

  it("resolveStageIconKeyForPersist — circle + название → правильная иконка", () => {
    expect(resolveStageIconKeyForPersist("Кровля", "circle")).toBe("roof");
    expect(resolveStageIconKeyForPersist("Электроснабжение", "circle")).toBe("electric");
  });

  it("resolveStageIconKeyForDisplay — alias для отображения в ЛК", () => {
    expect(resolveStageIconKeyForDisplay("Фундамент", "circle")).toBe("foundation");
    expect(resolveStageIconKeyForDisplay("Инженерные сети", "f")).toBe("engineering");
  });

  it("произвольный этап без шаблона", () => {
    expect(resolveDefaultIconKeyForStageTitle("Мой особый этап")).toBeNull();
    expect(resolveStageIconKeyForPersist("Мой особый этап", "hammer")).toBe("engineering");
  });
});
