import { describe, expect, it } from "vitest";
import { formatArticleBody, sanitizeArticleHtml } from "./html-content";

describe("sanitizeArticleHtml", () => {
  it("removes scripts, handlers and dangerous urls", () => {
    const html = sanitizeArticleHtml(
      '<p onclick="alert(1)">Hi<script>alert(1)</script><a href="javascript:alert(1)">x</a><img src="data:text/html;base64,xxx"></p>'
    );

    expect(html).not.toContain("script");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("data:text/html");
    expect(html).toContain("<p>Hi");
  });

  it("keeps safe article markup", () => {
    const html = sanitizeArticleHtml('<h2>Title</h2><p><strong>Text</strong> <a href="https://example.com">link</a></p>');
    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain("<strong>Text</strong>");
    expect(html).toContain('href="https://example.com"');
  });

  it("converts br to paragraph breaks", () => {
    const html = sanitizeArticleHtml(
      "<p>Вступление</p><p><strong>Локация:</strong> Деревня<br><strong>Статус:</strong> Готов</p>",
    );
    expect(html).toContain("<p><strong>Локация:</strong> Деревня</p>");
    expect(html).toContain("<p><strong>Статус:</strong> Готов</p>");
  });
});

describe("formatArticleBody", () => {
  it("splits plain text on single newlines", () => {
    const html = formatArticleBody("Первая строка\nВторая строка");
    expect(html).toBe("<p>Первая строка</p><p>Вторая строка</p>");
  });
});
