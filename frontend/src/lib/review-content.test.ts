import { describe, expect, it } from "vitest";

import { isReviewSubmitValid, reviewSubmitSchema, sanitizeReviewPlainText } from "@/lib/review-content";

describe("review-content", () => {
  it("sanitizeReviewPlainText убирает HTML", () => {
    expect(sanitizeReviewPlainText('<script>alert(1)</script> Нормальный текст', 500)).toBe(
      "Нормальный текст",
    );
  });

  it("reviewSubmitSchema: валидный отзыв", () => {
    const parsed = reviewSubmitSchema.safeParse({
      authorName: "Иван",
      objectName: "Дом в ЛО",
      rating: 5,
      text: "Отличная команда, всё по договору и в срок, рекомендую.",
      honeypot: "",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(isReviewSubmitValid(parsed.data)).toBe(true);
  });

  it("reviewSubmitSchema: honeypot не ломает парсинг", () => {
    const parsed = reviewSubmitSchema.safeParse({
      authorName: "Бот",
      rating: 5,
      text: "Спам спам спам спам спам спам спам.",
      honeypot: "filled",
    });
    expect(parsed.success).toBe(true);
  });
});
