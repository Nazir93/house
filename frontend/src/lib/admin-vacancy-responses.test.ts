import { describe, expect, it } from "vitest";
import {
  vacancyResponseMessage,
  vacancyResponsePosition,
  vacancyResponseResume,
} from "./admin-vacancy-responses";

describe("admin-vacancy-responses", () => {
  it("H: позиция из calcData.position", () => {
    expect(
      vacancyResponsePosition({
        service: "fallback",
        calcData: { position: "Прораб" },
      }),
    ).toBe("Прораб");
  });

  it("B: без calcData — service или «Вакансия»", () => {
    expect(vacancyResponsePosition({ service: "Инженер", calcData: null })).toBe("Инженер");
    expect(vacancyResponsePosition({ service: null, calcData: {} })).toBe("Вакансия");
  });

  it("R: резюме и сообщение опциональны", () => {
    expect(vacancyResponseResume({ resume: "  https://cv.test  " })).toBe("https://cv.test");
    expect(vacancyResponseResume({})).toBeNull();
    expect(vacancyResponseMessage({ message: "Готов выйти" })).toBe("Готов выйти");
    expect(vacancyResponseMessage(null)).toBeNull();
  });
});
