import { describe, expect, it } from "vitest";
import {
  engagementBoost,
  engagementCookieKey,
  formatEngagementCount,
  resolveHouseProjectEngagement,
  seedHouseProjectEngagement,
} from "./house-project-engagement";

describe("house-project-engagement", () => {
  it("seedHouseProjectEngagement", () => {
    expect(seedHouseProjectEngagement({ area: 128, order: 2, isNew: false })).toEqual({
      viewCount: 180 + 128 + 14,
      likeCount: 12 + 6,
    });
  });

  it("engagementBoost is in 40..100 and stable", () => {
    const p = { area: 100, order: 0, isNew: false };
    const views = engagementBoost(p, "view");
    const likes = engagementBoost(p, "like");
    expect(views).toBeGreaterThanOrEqual(40);
    expect(views).toBeLessThanOrEqual(100);
    expect(likes).toBeGreaterThanOrEqual(40);
    expect(likes).toBeLessThanOrEqual(100);
    expect(engagementBoost(p, "view")).toBe(views);
    expect(engagementBoost(p, "like")).toBe(likes);
    expect(views).not.toBe(likes);
  });

  it("resolveHouseProjectEngagement prefers DB when > 0 and adds boost", () => {
    const p = { area: 100, order: 0, isNew: false, viewCount: 500, likeCount: 40 };
    expect(resolveHouseProjectEngagement(p)).toEqual({
      viewCount: 500 + engagementBoost(p, "view"),
      likeCount: 40 + engagementBoost(p, "like"),
    });
  });

  it("resolveHouseProjectEngagement falls back to seed + boost", () => {
    const p = { area: 128, order: 2, isNew: false, viewCount: 0, likeCount: 0 };
    const seed = seedHouseProjectEngagement(p);
    expect(resolveHouseProjectEngagement(p)).toEqual({
      viewCount: seed.viewCount + engagementBoost(p, "view"),
      likeCount: seed.likeCount + engagementBoost(p, "like"),
    });
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
