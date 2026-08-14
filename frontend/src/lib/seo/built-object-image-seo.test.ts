import { describe, expect, it } from "vitest";

import {
  buildBuiltObjectImageAlt,
  buildBuiltObjectImageFileStem,
  buildBuiltObjectUploadNameHint,
  isWeakBuiltObjectImageAlt,
  resolveBuiltObjectImageAlt,
} from "@/lib/seo/built-object-image-seo";
import { isJunkUploadStem } from "@/lib/upload-file-stem";

describe("built-object-image-seo (ТЗ SEO §19)", () => {
  const base = {
    material: "GAS_BLOCK",
    location: "Всеволожский район",
    siteName: "Часть души",
  };

  it("имя файла не IMG_*, а dom-gazobeton-place-01", () => {
    expect(isJunkUploadStem("IMG_82456")).toBe(true);
    expect(
      buildBuiltObjectImageFileStem({
        ...base,
        index: 1,
        role: "render",
      }),
    ).toBe("dom-gazobeton-vsevolozhskiy-01");
    expect(buildBuiltObjectUploadNameHint({ ...base, index: 2, role: "foto" })).toMatch(
      /^dom-gazobeton-vsevolozhskiy-02$/,
    );
  });

  it("ALT обложки — конкретный объект + бренд; остальные без одного ключа на все", () => {
    const cover = buildBuiltObjectImageAlt({ ...base, index: 1, role: "cover" });
    const second = buildBuiltObjectImageAlt({ ...base, index: 2, role: "render" });
    const third = buildBuiltObjectImageAlt({ ...base, index: 3, role: "render" });

    expect(cover).toMatch(/газобетон/i);
    expect(cover).toMatch(/Всеволожск/i);
    expect(cover).toContain("Часть души");
    expect(second).not.toBe(cover);
    expect(third).not.toBe(second);
    expect(second).not.toContain("Часть души");
    expect([cover, second, third].every((a) => a === cover)).toBe(false);
  });

  it("этап строительства и планировка — отдельные формулировки", () => {
    expect(
      buildBuiltObjectImageAlt({
        ...base,
        role: "stroyka",
        phaseKey: "foundation",
        index: 1,
      }),
    ).toMatch(/Фундамент/i);
    expect(
      buildBuiltObjectImageAlt({
        ...base,
        role: "plan",
        title: "Дом во Всеволожске",
        index: 2,
      }),
    ).toMatch(/Планировка/);
  });

  it("слабый ALT (пустой / IMG / только title) заменяется генерацией", () => {
    expect(isWeakBuiltObjectImageAlt("")).toBe(true);
    expect(isWeakBuiltObjectImageAlt("IMG_82456")).toBe(true);
    expect(isWeakBuiltObjectImageAlt("Дом в Вырице", "Дом в Вырице")).toBe(true);

    const resolved = resolveBuiltObjectImageAlt("", {
      ...base,
      title: "Дом во Всеволожске",
      index: 1,
      role: "render",
    });
    expect(resolved.length).toBeGreaterThan(10);
    expect(resolved).not.toBe("Дом во Всеволожске");
  });
});
