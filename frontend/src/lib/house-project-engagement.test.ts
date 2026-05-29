import { describe, expect, it } from "vitest";
import {
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

  it("resolveHouseProjectEngagement prefers DB when > 0", () => {
    expect(
      resolveHouseProjectEngagement({ area: 100, order: 0, isNew: false, viewCount: 500, likeCount: 40 }),
    ).toEqual({ viewCount: 500, likeCount: 40 });
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
