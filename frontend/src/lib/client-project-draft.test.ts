import { describe, expect, it } from "vitest";
import {
  hasUnpublishedDraft,
  mergeClientProjectDraft,
  parseClientProjectDraftSection,
} from "./client-project-draft";

describe("hasUnpublishedDraft", () => {
  it("true если черновик новее публикации", () => {
    expect(
      hasUnpublishedDraft({
        draftData: { title: "x" },
        draftSavedAt: new Date("2026-05-16T12:00:00Z"),
        cabinetPublishedAt: new Date("2026-05-16T10:00:00Z"),
      })
    ).toBe(true);
  });

  it("false если публикация позже черновика", () => {
    expect(
      hasUnpublishedDraft({
        draftData: { title: "x" },
        draftSavedAt: new Date("2026-05-16T10:00:00Z"),
        cabinetPublishedAt: new Date("2026-05-16T12:00:00Z"),
      })
    ).toBe(false);
  });
});

describe("mergeClientProjectDraft", () => {
  const existing = {
    title: "Дом",
    stages: [{ clientKey: "s1", order: 0, title: "Кровля", iconKey: "r", status: "NOT_STARTED" }],
    payments: [{ order: 0, label: "Аванс", amountRubles: 100, dueDate: null, status: "EXPECTED", paidAt: null }],
  };

  it("main — не затирает этапы и платежи", () => {
    const merged = mergeClientProjectDraft(existing, { title: "Новый дом" }, "main");
    expect(merged.title).toBe("Новый дом");
    expect(merged.stages).toEqual(existing.stages);
    expect(merged.payments).toEqual(existing.payments);
  });

  it("payments — не затирает основные поля и этапы", () => {
    const merged = mergeClientProjectDraft(
      existing,
      {
        payments: [{ order: 0, label: "Аванс 2", amountRubles: 200, dueDate: null, status: "EXPECTED", paidAt: null }],
      },
      "payments"
    );
    expect(merged.title).toBe("Дом");
    expect(merged.stages).toEqual(existing.stages);
    expect(merged.payments?.[0]?.label).toBe("Аванс 2");
  });

  it("documents — оставляет черновик без изменений", () => {
    const merged = mergeClientProjectDraft(existing, {}, "documents");
    expect(merged).toEqual(existing);
  });
});

describe("parseClientProjectDraftSection", () => {
  it("принимает известные секции", () => {
    expect(parseClientProjectDraftSection("payments")).toBe("payments");
    expect(parseClientProjectDraftSection("unknown")).toBeNull();
  });
});
