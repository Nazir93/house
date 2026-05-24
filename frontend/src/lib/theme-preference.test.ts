import { describe, expect, it } from "vitest";
import {
  cycleThemePreference,
  normalizeThemePreference,
  resolveSiteTheme,
} from "@/lib/theme-preference";

describe("theme-preference", () => {
  it("normalizeThemePreference: пусто и неизвестное → system", () => {
    expect(normalizeThemePreference(null)).toBe("system");
    expect(normalizeThemePreference("")).toBe("system");
    expect(normalizeThemePreference("auto")).toBe("system");
  });

  it("normalizeThemePreference: light/dark/system сохраняются", () => {
    expect(normalizeThemePreference("light")).toBe("light");
    expect(normalizeThemePreference("dark")).toBe("dark");
    expect(normalizeThemePreference("system")).toBe("system");
  });

  it("resolveSiteTheme: system следует за ОС", () => {
    expect(resolveSiteTheme("system", true)).toBe("dark");
    expect(resolveSiteTheme("system", false)).toBe("light");
    expect(resolveSiteTheme("dark", false)).toBe("dark");
    expect(resolveSiteTheme("light", true)).toBe("light");
  });

  it("cycleThemePreference: light → dark → system → light", () => {
    expect(cycleThemePreference("light")).toBe("dark");
    expect(cycleThemePreference("dark")).toBe("system");
    expect(cycleThemePreference("system")).toBe("light");
  });
});
