import { describe, expect, it } from "vitest";

import {
  getServiceHubCopy,
  resolveServiceHubCtaAction,
  SERVICES_PROCESS_STEPS,
} from "@/lib/services-hub-data";

const LINK_CTA_SEGMENTS = [
  "proektirovanie",
  "fundament",
  "karkas",
  "krovlya",
  "inzheneriya",
  "otdelka",
] as const;

describe("resolveServiceHubCtaAction", () => {
  it.each(LINK_CTA_SEGMENTS)("%s: «Перейти к услуге» ведёт на страницу услуги", (segment) => {
    const hub = getServiceHubCopy(segment);
    expect(hub?.ctaLabel).toBe("Перейти к услуге");
    expect(resolveServiceHubCtaAction(hub)).toBe("link");
  });

  it("fallback: «Обсудить…» без явного ctaAction — modal", () => {
    expect(
      resolveServiceHubCtaAction({
        navTitle: "T",
        cardDescription: "D",
        sectionParagraphs: [],
        features: [],
        ctaLabel: "Обсудить что-то",
      }),
    ).toBe("modal");
  });
});

describe("getServiceHubCopy — тексты вкладок /services", () => {
  it("proektirovanie: состав с иконками по смыслу пунктов", () => {
    const hub = getServiceHubCopy("proektirovanie");
    expect(hub?.features.map((f) => f.label)).toEqual([
      "Архитектурные решения",
      "Планировки и объёмно-планировочные решения",
      "Рабочая документация",
      "3D-визуализация и детализация",
    ]);
    expect(hub?.features.map((f) => f.Icon.displayName ?? f.Icon.name)).toEqual([
      "Building2",
      "Grid2x2",
      "FileText",
      "Box",
    ]);
  });

  it("karkas: описание, состав и CTA", () => {
    const hub = getServiceHubCopy("karkas");
    expect(hub?.navTitle).toBe("Возведение коробки дома");
    expect(hub?.cardDescription).toContain("возведения коробки");
    expect(hub?.sectionParagraphs[0]).toContain("газобетона");
    expect(hub?.features.map((f) => f.label)).toEqual([
      "Материалы стен",
      "Несущие конструкции",
      "Перекрытия и армопояса",
      "Контроль качества строительства",
    ]);
  });

  it("krovlya: описание, состав и CTA", () => {
    const hub = getServiceHubCopy("krovlya");
    expect(hub?.navTitle).toBe("Монтаж кровли");
    expect(hub?.cardDescription).toContain("Кровля завершает");
    expect(hub?.sectionParagraphs[0]).toContain("конструктивная система");
    expect(hub?.features.map((f) => f.label)).toEqual([
      "Стропильная система",
      "Кровельные материалы",
      "Кровельный пирог",
      "Узлы примыканий",
      "Водосточная система",
    ]);
  });

  it("inzheneriya: описание, состав без вентиляции", () => {
    const hub = getServiceHubCopy("inzheneriya");
    expect(hub?.navTitle).toBe("Инженерные сети");
    expect(hub?.cardDescription).toContain("Инженерные системы");
    expect(hub?.sectionParagraphs[0]).toContain("единая система");
    expect(hub?.features.map((f) => f.label)).toEqual([
      "Электроснабжение",
      "Водоснабжение и канализация",
      "Отопление",
      "Котельная",
    ]);
    expect(hub?.features.some((f) => f.label === "Вентиляция")).toBe(false);
  });

  it("otdelka: заголовок, описание и состав", () => {
    const hub = getServiceHubCopy("otdelka");
    expect(hub?.navTitle).toBe("Внутренняя отделка под ключ");
    expect(hub?.cardDescription).toContain("Внутренняя отделка завершает");
    expect(hub?.sectionParagraphs[0]).toContain("строгом соответствии с проектом");
    expect(hub?.features.map((f) => f.label)).toEqual([
      "Подготовка поверхностей",
      "Стены, полы и потолки",
      "Монтаж дверей и сантехники",
      "Финишная отделка",
    ]);
    expect(hub?.features.some((f) => f.label === "Освещение и навеска")).toBe(false);
  });
});

describe("SERVICES_PROCESS_STEPS", () => {
  it("includes wall erection between foundation and roofing", () => {
    const titles = SERVICES_PROCESS_STEPS.map((s) => s.title);
    expect(titles).toEqual([
      "Проектирование",
      "Фундамент под ключ",
      "Возведение стен",
      "Монтаж кровли",
      "Инженерные сети",
      "Отделка под ключ",
      "Сдача и подключение",
    ]);
  });
});
