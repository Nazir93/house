import { describe, expect, it } from "vitest";
import { clampPdfPage } from "@/lib/pdfjs-viewer";

describe("clampPdfPage", () => {
  it("ограничивает страницу диапазоном 1..total", () => {
    expect(clampPdfPage(0, 5)).toBe(1);
    expect(clampPdfPage(3, 5)).toBe(3);
    expect(clampPdfPage(9, 5)).toBe(5);
  });

  it("при totalPages=0 не падает", () => {
    expect(clampPdfPage(2, 0)).toBe(1);
  });
});
