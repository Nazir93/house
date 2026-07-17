import { describe, expect, it } from "vitest";
import { CITY, SITE_NAME, getDefaultSiteGeoDescription } from "@/lib/constants";
import {
  META_DESCRIPTION_MAX_LENGTH,
  buildMetaDescription,
  clampMetaDescription,
  pickNonEmptyMetaText,
  resolvePageMetaDescription,
} from "@/lib/seo/build-meta-description";

describe("pickNonEmptyMetaText", () => {
  it("берёт первый непустой после trim", () => {
    expect(pickNonEmptyMetaText("", "  ", "  Ок  ", "Другой")).toBe("Ок");
  });

  it("схлопывает пробелы", () => {
    expect(pickNonEmptyMetaText("  дом   под   ключ  ")).toBe("дом под ключ");
  });
});

describe("clampMetaDescription", () => {
  it("не режет короткий текст", () => {
    expect(clampMetaDescription("Короткий текст")).toBe("Короткий текст");
  });

  it("обрезает длинный текст с …", () => {
    const long = "слово ".repeat(80).trim();
    const out = clampMetaDescription(long, 50);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(50);
  });
});

describe("buildMetaDescription", () => {
  it("использует primary, если он достаточно длинный", () => {
    const primary =
      "Строительство газобетонного дома 180 м²: фундамент, коробка и инженерия под ключ.";
    expect(buildMetaDescription({ primary, title: "Дом" })).toBe(primary);
  });

  it("достаёт текст из HTML", () => {
    const out = buildMetaDescription({
      html: "<p>Построенный дом из керамического блока в Ленинградской области с полной отделкой.</p>",
      title: "Объект",
      kind: "portfolio",
    });
    expect(out).toContain("керамического блока");
    expect(out).not.toContain("<");
  });

  it("при пустом контенте собирает шаблон по title", () => {
    const out = buildMetaDescription({
      primary: "",
      html: "",
      title: "Дом в Токсово",
      kind: "portfolio",
    });
    expect(out).toContain("Дом в Токсово");
    expect(out).toContain(SITE_NAME);
    expect(out).toContain(CITY);
    expect(out.length).toBeGreaterThan(40);
    expect(out.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH);
  });

  it("никогда не возвращает пустую строку", () => {
    expect(buildMetaDescription({})).toBe(clampMetaDescription(getDefaultSiteGeoDescription()));
  });

  it("игнорирует слишком короткий primary и берёт fallback", () => {
    const fallback =
      "Каталог типовых проектов домов: планировки, площади и материалы для строительства под ключ.";
    expect(
      buildMetaDescription({
        primary: "Коротко",
        fallback,
        title: "Проект",
        kind: "project",
      }),
    ).toBe(fallback);
  });
});

describe("resolvePageMetaDescription", () => {
  it("предпочитает непустое значение из БД", () => {
    expect(resolvePageMetaDescription("  Из админки SEO  ", "Код")).toBe("Из админки SEO");
  });

  it("игнорирует пустую/пробельную запись БД", () => {
    expect(resolvePageMetaDescription("   ", "Описание из кода страницы")).toBe(
      "Описание из кода страницы",
    );
    expect(resolvePageMetaDescription(null, "Описание из кода страницы")).toBe(
      "Описание из кода страницы",
    );
  });

  it("при пустых БД и defaults возвращает geo default", () => {
    expect(resolvePageMetaDescription("", "")).toBe(getDefaultSiteGeoDescription());
  });
});
