import { describe, expect, it } from "vitest";
import { documentMatchKey } from "@/lib/client-notification-sync";

describe("client-document-sync keys", () => {
  it("documentMatchKey uses url", () => {
    expect(documentMatchKey({ url: "/a.pdf" })).toBe("/a.pdf");
    expect(documentMatchKey({ url: "/a.pdf" })).toBe(documentMatchKey({ url: "/a.pdf" }));
  });
});
