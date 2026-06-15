import { describe, expect, it } from "vitest";
import {
  CANONICAL_PUBLIC_SITE_URL,
  getPublicSiteUrl,
  isNonPublicSiteHost,
} from "@/lib/legal-site";

describe("legal-site", () => {
  it("isNonPublicSiteHost detects IP and localhost", () => {
    expect(isNonPublicSiteHost("46.173.26.108")).toBe(true);
    expect(isNonPublicSiteHost("127.0.0.1")).toBe(true);
    expect(isNonPublicSiteHost("localhost")).toBe(true);
    expect(isNonPublicSiteHost("chastdushi.ru")).toBe(false);
  });

  it("getPublicSiteUrl uses canonical domain for IP env", () => {
    const prev = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "http://46.173.26.108:8080";
    expect(getPublicSiteUrl()).toBe(CANONICAL_PUBLIC_SITE_URL);
    process.env.NEXT_PUBLIC_SITE_URL = prev;
  });

  it("getPublicSiteUrl keeps real public domain from env", () => {
    const prev = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://chastdushi.ru";
    expect(getPublicSiteUrl()).toBe("https://chastdushi.ru");
    process.env.NEXT_PUBLIC_SITE_URL = prev;
  });
});
