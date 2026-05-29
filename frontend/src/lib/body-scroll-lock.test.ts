import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lockBodyScroll, resetBodyScrollLockForTests, unlockBodyScroll } from "@/lib/body-scroll-lock";

function createBodyMock() {
  const style: Record<string, string> = {};
  return {
    style: new Proxy({} as CSSStyleDeclaration, {
      set(_target, prop: string, value: string) {
        style[prop] = value;
        return true;
      },
      get(_target, prop: string) {
        return style[prop] ?? "";
      },
    }),
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  };
}

describe("body-scroll-lock", () => {
  let body: ReturnType<typeof createBodyMock>;
  const scrollTo = vi.fn();

  beforeEach(() => {
    resetBodyScrollLockForTests();
    body = createBodyMock();
    vi.stubGlobal("document", { body });
    vi.stubGlobal("window", {
      scrollY: 120,
      scrollTo,
      __lenis: undefined,
    });
    scrollTo.mockClear();
  });

  afterEach(() => {
    resetBodyScrollLockForTests();
    vi.unstubAllGlobals();
  });

  it("фиксирует body и восстанавливает позицию скролла", () => {
    lockBodyScroll();
    expect(body.style.position).toBe("fixed");
    expect(body.style.top).toBe("-120px");

    unlockBodyScroll();
    expect(body.style.position).toBe("");
    expect(scrollTo).toHaveBeenCalledWith(0, 120);
  });

  it("поддерживает вложенные lock/unlock", () => {
    lockBodyScroll();
    lockBodyScroll();
    unlockBodyScroll();
    expect(body.style.position).toBe("fixed");

    unlockBodyScroll();
    expect(body.style.position).toBe("");
  });
});
