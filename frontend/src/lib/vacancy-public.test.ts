import { describe, expect, it } from "vitest";
import {
  buildVacancyResponseHref,
  getVacancyMetaChips,
  isVacancyInputValid,
  normalizeVacancyInput,
} from "./vacancy-public";

describe("vacancy-public", () => {
  it("getVacancyMetaChips — только заполненные поля", () => {
    expect(getVacancyMetaChips({ location: "  СПб  ", schedule: "", salaryLabel: "от 80 000 ₽" })).toEqual([
      { key: "location", label: "СПб" },
      { key: "salary", label: "от 80 000 ₽" },
    ]);
  });

  it("buildVacancyResponseHref — query для отклика", () => {
    expect(buildVacancyResponseHref("Прораб")).toBe("/contacts?position=%D0%9F%D1%80%D0%BE%D1%80%D0%B0%D0%B1&topic=vacancy");
  });

  it("normalizeVacancyInput + isVacancyInputValid", () => {
    const ok = normalizeVacancyInput({
      title: "  Инженер ПТО ",
      description: "Описание вакансии не короче десяти символов",
      location: "Офис",
      order: 1,
    });
    expect(isVacancyInputValid(ok)).toBe(true);
    expect(ok.title).toBe("Инженер ПТО");

    const bad = normalizeVacancyInput({ title: "А", description: "коротко" });
    expect(isVacancyInputValid(bad)).toBe(false);
  });
});
