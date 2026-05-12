import { describe, expect, it } from "vitest";
import { htmlToPlainText } from "./html-to-plain-text";

describe("htmlToPlainText", () => {
  it("returns trimmed plain text unchanged", () => {
    expect(htmlToPlainText("Текст без разметки")).toBe("Текст без разметки");
  });

  it("strips simple tags", () => {
    expect(htmlToPlainText("<p>Привет</p>")).toBe("Привет");
  });

  it("inserts breaks between paragraphs", () => {
    expect(htmlToPlainText("<p>a</p><p>b</p>")).toContain("a");
    expect(htmlToPlainText("<p>a</p><p>b</p>")).toContain("b");
  });
});
