import { describe, expect, it } from "vitest";

import {
  isAllowedReviewPhotoUrl,
  isReviewSubmitValid,
  normalizeReviewPhotoUrls,
  reviewSubmitSchema,
  sanitizeReviewPlainText,
} from "@/lib/review-content";

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

  it("isAllowedReviewPhotoUrl допускает только /uploads/reviews/", () => {
    expect(isAllowedReviewPhotoUrl("/uploads/reviews/review-abc.webp")).toBe(true);
    expect(isAllowedReviewPhotoUrl("/uploads/evil.webp")).toBe(false);
    expect(isAllowedReviewPhotoUrl("https://evil.test/x.webp")).toBe(false);
    expect(isAllowedReviewPhotoUrl("/uploads/reviews/../secret.webp")).toBe(false);
  });

  it("normalizeReviewPhotoUrls отфильтровывает лишнее и режет до 5", () => {
    expect(
      normalizeReviewPhotoUrls([
        "/uploads/reviews/a.webp",
        "/uploads/other.png",
        "/uploads/reviews/a.webp",
        "/uploads/reviews/b.webp",
        "/uploads/reviews/c.webp",
        "/uploads/reviews/d.webp",
        "/uploads/reviews/e.webp",
        "/uploads/reviews/f.webp",
      ]),
    ).toEqual([
      "/uploads/reviews/a.webp",
      "/uploads/reviews/b.webp",
      "/uploads/reviews/c.webp",
      "/uploads/reviews/d.webp",
      "/uploads/reviews/e.webp",
    ]);
  });

  it("reviewSubmitSchema принимает photoUrls", () => {
    const parsed = reviewSubmitSchema.safeParse({
      authorName: "Иван",
      rating: 5,
      text: "Отличная команда, всё по договору и в срок, рекомендую.",
      photoUrls: ["/uploads/reviews/ok.webp", "https://evil.test/x.png"],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.photoUrls).toEqual(["/uploads/reviews/ok.webp"]);
    }
  });
});
