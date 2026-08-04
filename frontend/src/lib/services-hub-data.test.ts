import { describe, expect, it } from "vitest";

import {
  getServiceHubCopy,
  resolveServiceHubCtaAction,
  SERVICES_PROCESS_STEPS,
} from "@/lib/services-hub-data";

describe("resolveServiceHubCtaAction", () => {
  it("proektirovanie: «Обсудить проект» открывает форму заявки", () => {
    const hub = getServiceHubCopy("proektirovanie");
    expect(hub?.ctaLabel).toBe("Обсудить проект");
    expect(resolveServiceHubCtaAction(hub)).toBe("modal");
  });

  it("fundament: «Рассчитать фундамент» ведёт на страницу услуги", () => {
    const hub = getServiceHubCopy("fundament");
    expect(hub?.ctaLabel).toBe("Рассчитать фундамент");
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
