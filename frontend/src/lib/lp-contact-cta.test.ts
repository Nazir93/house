import { describe, expect, it } from "vitest";

import type { AdvertisingLandingConfig } from "@/lib/advertising-landing";
import {
  estimatePayloadHasDetailedCalc,
  lpProjectCardLeadMeta,
  lpServiceLabel,
} from "@/lib/lp-contact-cta";

describe("lpServiceLabel", () => {
  it("берёт serviceLabel из quizDefaults лендинга", () => {
    const config = {
      quizDefaults: { serviceLabel: "Кирпичные дома" },
    } as AdvertisingLandingConfig;
    expect(lpServiceLabel(config)).toBe("Кирпичные дома");
  });

  it("без quizDefaults возвращает undefined — модалка открывается без услуги", () => {
    const config = {} as AdvertisingLandingConfig;
    expect(lpServiceLabel(config)).toBeUndefined();
  });
});

describe("lpProjectCardLeadMeta", () => {
  const config = {
    slug: "kirpich",
    quizDefaults: { serviceLabel: "Кирпичные дома" },
  } as AdvertisingLandingConfig;

  it("кладёт название проекта в service и source", () => {
    const meta = lpProjectCardLeadMeta(config, { slug: "peinit", title: "Пейнит" });
    expect(meta.source).toBe("lp-kirpich-project-peinit");
    expect(meta.service).toBe("Кирпичные дома · проект Пейнит");
    expect(meta.calcData).toEqual({
      lpSlug: "kirpich",
      projectSlug: "peinit",
      projectTitle: "Пейнит",
    });
  });

  it("без serviceLabel лендинга всё равно указывает проект", () => {
    const meta = lpProjectCardLeadMeta({ slug: "kirpich" } as AdvertisingLandingConfig, {
      slug: "tillit",
      title: "Тиллит",
    });
    expect(meta.service).toBe("Лендинг kirpich · проект Тиллит");
  });
});

describe("estimatePayloadHasDetailedCalc", () => {
  it("LP-карточка проекта — не детальный калькулятор", () => {
    expect(
      estimatePayloadHasDetailedCalc({
        projectSlug: "peinit",
        projectTitle: "Пейнит",
      }),
    ).toBe(false);
  });

  it("сравнение / смета с суммой — детальный расчёт", () => {
    expect(estimatePayloadHasDetailedCalc({ grandTotalRub: 1_000_000 })).toBe(true);
    expect(estimatePayloadHasDetailedCalc({ projects: [{ slug: "a" }] })).toBe(true);
  });

  it("пустой payload — не детальный", () => {
    expect(estimatePayloadHasDetailedCalc(null)).toBe(false);
    expect(estimatePayloadHasDetailedCalc({})).toBe(false);
  });
});
