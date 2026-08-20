import { describe, expect, it } from "vitest";

import {
  PORTFOLIO_TOUR_LEAD_SOURCE,
  buildNavPortfolioTourEstimatePayload,
  buildPortfolioTourEstimatePayload,
  buildPortfolioTourServiceLabel,
  isPortfolioTourLeadSource,
  resolvePortfolioTourModalCopy,
} from "@/lib/portfolio-tour-lead";
import { getLeadSourceLabel } from "@/lib/lead-sources";

describe("portfolio-tour-lead", () => {
  it("собирает payload с источником экскурсии, объектом и формой имя+телефон", () => {
    const payload = buildPortfolioTourEstimatePayload({
      title: "Дом в Вартемягах",
      slug: "dom-vartemyagi",
      siteStatus: "UNDER_CONSTRUCTION",
    });

    expect(payload.source).toBe(PORTFOLIO_TOUR_LEAD_SOURCE);
    expect(payload.service).toBe("Экскурсия: Дом в Вартемягах");
    expect(payload.calcData).toMatchObject({
      formType: "portfolio-tour",
      intent: "tour",
      projectTitle: "Дом в Вартемягах",
      objectSlug: "dom-vartemyagi",
      objectPath: "/portfolio/dom-vartemyagi",
    });
  });

  it("в админке источник читается как экскурсия", () => {
    expect(isPortfolioTourLeadSource(PORTFOLIO_TOUR_LEAD_SOURCE)).toBe(true);
    expect(getLeadSourceLabel(PORTFOLIO_TOUR_LEAD_SOURCE)).toBe(
      "Экскурсия: запись с портфолио",
    );
  });

  it("копирайт модалки включает название объекта", () => {
    const copy = resolvePortfolioTourModalCopy("Дом в Вырице");
    expect(copy.eyebrow).toBe("Экскурсия на объект");
    expect(copy.submitLabel).toContain("экскурсию");
    expect(copy.description).toContain("Дом в Вырице");
    expect(copy.badge).toBe("Объект: Дом в Вырице");
  });

  it("пустой заголовок не ломает подписи", () => {
    expect(buildPortfolioTourServiceLabel("  ")).toBe("Экскурсия на объект");
    expect(resolvePortfolioTourModalCopy("").badge).toBeNull();
  });

  it("меню собирает payload экскурсии без конкретного объекта", () => {
    const payload = buildNavPortfolioTourEstimatePayload();
    expect(payload.source).toBe(PORTFOLIO_TOUR_LEAD_SOURCE);
    expect(payload.service).toBe("Экскурсия на объекты");
    expect(payload.calcData).toMatchObject({
      formType: "portfolio-tour",
      intent: "tour",
      entry: "nav",
    });
  });
});
