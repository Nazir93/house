import { describe, expect, it } from "vitest";
import { formatLeadMessage } from "./telegram";

describe("formatLeadMessage", () => {
  it("escapes pageUrl before sending as Telegram HTML", () => {
    const msg = formatLeadMessage({
      name: "User",
      phone: "+7",
      pageUrl: "/x?<b>bad</b>&q=1",
    });

    expect(msg).toContain("/x?&lt;b&gt;bad&lt;/b&gt;&amp;q=1");
    expect(msg).not.toContain("/x?<b>bad</b>&q=1");
  });
});
