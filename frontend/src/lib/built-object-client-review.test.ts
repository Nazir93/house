import { describe, expect, it } from "vitest";

import {
  formatClientReviewText,
  hasBuiltObjectClientReview,
  isBuiltObjectClientReviewVideoInline,
} from "@/lib/built-object-client-review";

describe("built-object-client-review", () => {
  it("hasBuiltObjectClientReview when text or video present", () => {
    expect(hasBuiltObjectClientReview({ clientReviewText: "Отлично!", clientReviewVideoUrl: null })).toBe(true);
    expect(hasBuiltObjectClientReview({ clientReviewText: "", clientReviewVideoUrl: "/uploads/r.mp4" })).toBe(true);
    expect(hasBuiltObjectClientReview({ clientReviewText: "", clientReviewVideoUrl: null })).toBe(false);
  });

  it("isBuiltObjectClientReviewVideoInline for uploads and mp4", () => {
    expect(isBuiltObjectClientReviewVideoInline("/uploads/review.mp4")).toBe(true);
    expect(isBuiltObjectClientReviewVideoInline("https://cdn.example.com/v.mp4")).toBe(true);
    expect(isBuiltObjectClientReviewVideoInline("https://youtube.com/watch?v=1")).toBe(false);
  });

  it("formatClientReviewText wraps plain text in paragraphs", () => {
    expect(formatClientReviewText("Спасибо за дом!")).toContain("<p>Спасибо за дом!</p>");
  });

  it("formatClientReviewText splits double newlines into paragraphs", () => {
    const html = formatClientReviewText("Первая мысль.\n\nВторая мысль.");
    expect(html).toContain("<p>Первая мысль.</p>");
    expect(html).toContain("<p>Вторая мысль.</p>");
  });

  it("formatClientReviewText converts single newlines to br without escaping tags", () => {
    const html = formatClientReviewText("Строка один.\nСтрока два.");
    expect(html).toBe("<p>Строка один.<br />Строка два.</p>");
    expect(html).not.toContain("&lt;br");
  });

  it("hasBuiltObjectClientReview with whitespace-only text is false", () => {
    expect(hasBuiltObjectClientReview({ clientReviewText: "   ", clientReviewVideoUrl: null })).toBe(false);
  });
});
