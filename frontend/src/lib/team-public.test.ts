import { describe, expect, it } from "vitest";
import { isTeamMemberInputValid, mergeTeamMemberPatch, normalizeTeamMemberInput } from "./team-public";

describe("team-public", () => {
  it("normalizeTeamMemberInput — обрезка полей", () => {
    const out = normalizeTeamMemberInput({
      name: "  Иван Петров ",
      position: " Прораб ",
      photoUrl: "",
      description: "  Опыт 10 лет  ",
      order: 2,
    });
    expect(out.name).toBe("Иван Петров");
    expect(out.position).toBe("Прораб");
    expect(out.photoUrl).toBeNull();
    expect(out.description).toBe("Опыт 10 лет");
  });

  it("isTeamMemberInputValid", () => {
    expect(isTeamMemberInputValid(normalizeTeamMemberInput({ name: "А", position: "Б" }))).toBe(false);
    expect(
      isTeamMemberInputValid(normalizeTeamMemberInput({ name: "Иван", position: "Инженер" }))
    ).toBe(true);
  });

  it("mergeTeamMemberPatch — частичное обновление visible", () => {
    const existing = normalizeTeamMemberInput({
      name: "Иван",
      position: "Прораб",
      visible: true,
    });
    const patch = normalizeTeamMemberInput({ visible: false });
    const merged = mergeTeamMemberPatch(existing, patch, { visible: true });
    expect(merged.name).toBe("Иван");
    expect(merged.visible).toBe(false);
  });
});
