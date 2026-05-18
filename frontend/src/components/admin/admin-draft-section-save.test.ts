import { describe, expect, it } from "vitest";
import { draftSectionStatusMessage } from "./admin-draft-section-save";

describe("draftSectionStatusMessage", () => {
  it("возвращает тексты для всех состояний", () => {
    expect(draftSectionStatusMessage("saving")).toBe("Сохранение…");
    expect(draftSectionStatusMessage("saved")).toBe("Изменения сохранены");
    expect(draftSectionStatusMessage("dirty")).toBe("Есть несохранённые изменения");
    expect(draftSectionStatusMessage("error")).toBe("Ошибка сохранения");
    expect(draftSectionStatusMessage("error", "Конфликт")).toBe("Конфликт");
    expect(draftSectionStatusMessage("idle")).toBeNull();
  });
});
