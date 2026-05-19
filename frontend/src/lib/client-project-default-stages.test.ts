import { describe, expect, it } from "vitest";
import {
  buildDefaultClientProjectStagesPayload,
  DEFAULT_CLIENT_PROJECT_STAGE_COUNT,
  DEFAULT_CLIENT_PROJECT_TOP_LEVEL_COUNT,
} from "./client-project-default-stages";

describe("buildDefaultClientProjectStagesPayload", () => {
  it("8 основных этапов по ТЗ", () => {
    const stages = buildDefaultClientProjectStagesPayload();
    const top = stages.filter((s) => !s.parentClientKey);
    expect(top).toHaveLength(DEFAULT_CLIENT_PROJECT_TOP_LEVEL_COUNT);
    expect(stages).toHaveLength(DEFAULT_CLIENT_PROJECT_STAGE_COUNT);
    expect(top.map((s) => s.title)).toEqual([
      "Фундамент",
      "Стены",
      "Кровля",
      "Окна",
      "Инженерные сети",
      "Отделка фасада",
      "Внутренняя отделка",
      "Благоустройство участка и въездная группа",
    ]);
    expect(top.map((s) => s.iconKey)).toEqual([
      "foundation",
      "walls",
      "roof",
      "windows",
      "engineering",
      "facade",
      "interior",
      "landscaping",
    ]);
  });

  it("подэтапы инженерии и благоустройства", () => {
    const stages = buildDefaultClientProjectStagesPayload();
    const engSubs = stages.filter((s) => s.parentClientKey === "stage-engineering");
    expect(engSubs).toHaveLength(7);
    expect(engSubs.map((s) => s.title)).toContain("Электроснабжение");
    expect(engSubs.map((s) => s.title)).toContain("Колодец");

    const landSubs = stages.filter((s) => s.parentClientKey === "stage-landscaping");
    expect(landSubs).toHaveLength(3);
    expect(landSubs.map((s) => s.title)).toContain("Устройство подпорной стены");
  });
});
