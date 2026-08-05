import { describe, expect, it, vi } from "vitest";

import {
  builtObjectNavItemsHaveUniqueTargets,
  builtObjectNavScrollPlan,
  isBuiltObjectNavScrollLocked,
  resolveActiveNavSectionId,
} from "@/lib/built-object-nav-scroll";
import { getBuiltObjectNavItems } from "@/lib/built-object-detail";
import {
  readCssLengthToPx,
  resolveElementScrollTopPx,
  scrollPageToElement,
  sectionScrollOffsetPx,
} from "@/lib/scroll-page-to-element";
import type { BuiltObjectItem } from "@/lib/construction-shared";

/**
 * ТЗ п.3 — навигация карточки дома в Портфолио.
 * 1) все кнопки с одного нажатия
 * 2) каждая → строго свой раздел
 * 3) повторный клик не нужен
 * 4) ПК (Lenis) и мобила/планшет (window.scrollTo)
 */
describe("ТЗ п.3: навигация разделов портфолио", () => {
  const object = {
    id: "1",
    slug: "dom",
    title: "Дом",
    material: "Кирпич",
    description: "Текст",
    published: true,
    order: 0,
    media: [],
    clientReviewText: "Отзыв",
  } as BuiltObjectItem;

  it("1–2: каждый пункт меню → свой href/dom id, цели уникальны", () => {
    const items = getBuiltObjectNavItems(object);
    expect(builtObjectNavItemsHaveUniqueTargets(items)).toBe(true);

    for (const item of items) {
      const plan = builtObjectNavScrollPlan(item.id);
      expect(plan.href).toBe(`#built-section-${item.id}`);
      expect(plan.sectionDomId).toBe(`built-section-${item.id}`);
      expect(plan.id).toBe(item.id);
    }

    const plans = items.find((i) => i.label === "Планировки");
    expect(plans).toBeTruthy();
    expect(builtObjectNavScrollPlan(plans!.id).sectionDomId).toBe("built-section-plans");
  });

  it("3: один клик = один scrollTo (Lenis, ПК) — без scrollIntoView", () => {
    const items = getBuiltObjectNavItems(object);
    for (const item of items) {
      const scrollTo = vi.fn();
      const scrollIntoView = vi.fn();
      const el = {
        scrollIntoView,
        getBoundingClientRect: () => ({ top: 400 }),
      } as unknown as HTMLElement;

      const ok = scrollPageToElement(
        el,
        { offsetPx: -64 },
        { lenis: { scroll: 100, scrollTo }, matchMedia: () => ({ matches: false }) },
      );
      expect(ok).toBe(true);
      expect(scrollTo).toHaveBeenCalledTimes(1);
      expect(scrollTo).toHaveBeenCalledWith(436, undefined);
      expect(scrollIntoView).not.toHaveBeenCalled();
      expect(builtObjectNavScrollPlan(item.id).sectionDomId).toContain(item.id);
    }
  });

  it("4: без Lenis — один window.scrollTo smooth (мобила/планшет)", () => {
    const scrollToWindow = vi.fn();
    const scrollIntoView = vi.fn();
    const el = {
      scrollIntoView,
      getBoundingClientRect: () => ({ top: 300 }),
    } as unknown as HTMLElement;

    expect(
      scrollPageToElement(
        el,
        { offsetPx: -64 },
        {
          lenis: null,
          matchMedia: () => ({ matches: false }),
          scrollToWindow,
          nowScrollY: 20,
        },
      ),
    ).toBe(true);
    expect(scrollToWindow).toHaveBeenCalledTimes(1);
    expect(scrollToWindow).toHaveBeenCalledWith({ top: 256, behavior: "smooth" });
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it("описание: раскрытие + отложенный скролл после layout", () => {
    const plan = builtObjectNavScrollPlan("description");
    expect(plan.expandDescription).toBe(true);
    expect(plan.deferScrollForLayout).toBe(true);
    expect(builtObjectNavScrollPlan("plans").expandDescription).toBe(false);
    expect(builtObjectNavScrollPlan("plans").deferScrollForLayout).toBe(false);
  });

  it("во время программного скролла IO не перебивает activeNav", () => {
    expect(isBuiltObjectNavScrollLocked(100, 200)).toBe(true);
    expect(isBuiltObjectNavScrollLocked(200, 200)).toBe(false);
  });

  it("подсветка меню: активен последний раздел выше линии шапки, не залипает на Описании", () => {
    expect(
      resolveActiveNavSectionId(
        [
          { id: "description" as const, top: -120 },
          { id: "plans" as const, top: 40 },
          { id: "construction-photos" as const, top: 400 },
          { id: "history" as const, top: 900 },
        ],
        64,
      ),
    ).toBe("plans");
    expect(
      resolveActiveNavSectionId(
        [
          { id: "description" as const, top: -500 },
          { id: "plans" as const, top: -200 },
          { id: "construction-photos" as const, top: 50 },
          { id: "history" as const, top: 600 },
        ],
        64,
      ),
    ).toBe("construction-photos");
    expect(resolveActiveNavSectionId([{ id: "description" as const, top: 120 }], 64)).toBe(
      "description",
    );
  });

  it("offset шапки и Y считаются без DOM-probe", () => {
    expect(readCssLengthToPx("3rem")).toBe(48);
    expect(sectionScrollOffsetPx(() => "3rem")).toBe(-64);
    expect(resolveElementScrollTopPx(10, 0, -64)).toBe(0);
  });
});
