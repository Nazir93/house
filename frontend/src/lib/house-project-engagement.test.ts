import { describe, expect, it } from "vitest";
import {
  ENGAGEMENT_LIKE_BASE_MAX,
  ENGAGEMENT_LIKE_BASE_MIN,
  ENGAGEMENT_VIEW_BASE_MAX,
  ENGAGEMENT_VIEW_BASE_MIN,
  engagementCookieKey,
  engagementDisplayBase,
  formatEngagementCount,
  resolveHouseProjectEngagement,
} from "./house-project-engagement";

describe("house-project-engagement", () => {
  const sample = { slug: "aurora", area: 128, order: 2, isNew: false };

  it("engagementDisplayBase: просмотры 92…105, огоньки 30…55, стабильно по проекту", () => {
    const views = engagementDisplayBase(sample, "view");
    const likes = engagementDisplayBase(sample, "like");
    expect(views).toBeGreaterThanOrEqual(ENGAGEMENT_VIEW_BASE_MIN);
    expect(views).toBeLessThanOrEqual(ENGAGEMENT_VIEW_BASE_MAX);
    expect(likes).toBeGreaterThanOrEqual(ENGAGEMENT_LIKE_BASE_MIN);
    expect(likes).toBeLessThanOrEqual(ENGAGEMENT_LIKE_BASE_MAX);
    expect(engagementDisplayBase(sample, "view")).toBe(views);
    expect(engagementDisplayBase(sample, "like")).toBe(likes);
    expect(views).not.toBe(likes);
  });

  it("resolveHouseProjectEngagement: база + органика из БД", () => {
    const baseViews = engagementDisplayBase(sample, "view");
    const baseLikes = engagementDisplayBase(sample, "like");
    expect(
      resolveHouseProjectEngagement({ ...sample, viewCount: 0, likeCount: 0 }),
    ).toEqual({
      viewCount: baseViews,
      likeCount: baseLikes,
    });
    expect(
      resolveHouseProjectEngagement({ ...sample, viewCount: 12, likeCount: 3 }),
    ).toEqual({
      viewCount: baseViews + 12,
      likeCount: baseLikes + 3,
    });
  });

  it("разные slug дают разные базы в допустимых диапазонах", () => {
    const a = engagementDisplayBase({ slug: "aurora", area: 100, order: 0, isNew: false }, "view");
    const b = engagementDisplayBase({ slug: "duet", area: 100, order: 0, isNew: false }, "view");
    expect(a).toBeGreaterThanOrEqual(ENGAGEMENT_VIEW_BASE_MIN);
    expect(b).toBeGreaterThanOrEqual(ENGAGEMENT_VIEW_BASE_MIN);
    expect(a).not.toBe(b);
  });

  it("engagementCookieKey sanitizes slug", () => {
    expect(engagementCookieKey("view", "aurora")).toBe("hp_v_aurora");
    expect(engagementCookieKey("like", "my-house")).toBe("hp_l_my-house");
  });

  it("formatEngagementCount", () => {
    expect(formatEngagementCount(336)).toBe("336");
    expect(formatEngagementCount(12_500)).toBe("13k");
  });
});
