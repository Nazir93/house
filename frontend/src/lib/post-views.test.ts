import { describe, expect, it } from "vitest";
import { formatPostViewCount, postViewSessionKey, shouldRecordPostView } from "./post-views";

describe("post-views", () => {
  it("H: форматирует счётчик для админки", () => {
    expect(formatPostViewCount(0)).toBe("0");
    expect(formatPostViewCount(42)).toBe("42");
    expect(formatPostViewCount(1500)).toBe("1.5 тыс.");
    expect(formatPostViewCount(12_000)).toBe("12 тыс.");
  });

  it("B: один просмотр на сессию", () => {
    expect(shouldRecordPostView({ slug: "akciya", alreadyRecordedInSession: false })).toBe(true);
    expect(shouldRecordPostView({ slug: "akciya", alreadyRecordedInSession: true })).toBe(false);
    expect(shouldRecordPostView({ slug: "  ", alreadyRecordedInSession: false })).toBe(false);
  });

  it("R: ключ sessionStorage стабильный", () => {
    expect(postViewSessionKey("  hello ")).toBe("blog-viewed:hello");
  });
});
