import { describe, expect, it } from "vitest";
import {
  houseProjectCatalogTeaser,
  houseProjectDescriptionHtml,
  houseProjectHeroTeaser,
} from "@/lib/house-project-teaser";

describe("house-project-teaser", () => {
  it("prefers shortDescription in hero", () => {
    expect(houseProjectHeroTeaser("Коротко", "<p>Длинное</p>")).toBe("Коротко");
  });

  it("falls back to plain text from full description", () => {
    expect(houseProjectHeroTeaser("", "<p>Полное <strong>описание</strong> проекта</p>")).toBe(
      "Полное описание проекта",
    );
  });

  it("sanitizes full description html", () => {
    expect(houseProjectDescriptionHtml("<p>Текст</p><script>x</script>")).toBe("<p>Текст</p>");
  });

  it("catalog teaser matches hero logic", () => {
    expect(houseProjectCatalogTeaser("", "Простой текст")).toBe("Простой текст");
  });
});
