import { describe, expect, it } from "vitest";
import { createLeadFollowupToken, verifyLeadFollowupToken } from "./lead-followup-token";

describe("lead-followup-token", () => {
  it("verifies a fresh signed token", () => {
    const token = createLeadFollowupToken("lead_1", 1_000);
    expect(verifyLeadFollowupToken(token, 2_000)).toBe("lead_1");
  });

  it("rejects tampered and expired tokens", () => {
    const token = createLeadFollowupToken("lead_1", 1_000);
    expect(verifyLeadFollowupToken(token.replace("lead_1", "lead_2"), 2_000)).toBeNull();
    expect(verifyLeadFollowupToken(token, 31 * 60 * 1000 + 2_000)).toBeNull();
  });
});
