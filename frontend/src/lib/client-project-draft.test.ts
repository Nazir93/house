import { describe, expect, it } from "vitest";
import { hasUnpublishedDraft } from "./client-project-draft";

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
