import { describe, expect, it } from "vitest";

import {
  buildImagePrefetchSrc,
  buildNextImagePrefetchHref,
  isUploadImageSrc,
  shouldUseBrowserImageDirectly,
} from "@/lib/image-loading";

describe("image-loading", () => {
  it("keeps admin-uploaded browser-ready images out of next/image optimizer", () => {
    expect(isUploadImageSrc("/uploads/hero.webp")).toBe(true);
    expect(shouldUseBrowserImageDirectly("/uploads/hero.webp")).toBe(true);
    expect(shouldUseBrowserImageDirectly("/uploads/house.jpg?cache=1")).toBe(true);
    expect(buildImagePrefetchSrc("/uploads/hero.webp", 828, 78)).toBe("/uploads/hero.webp");
  });

  it("serves public static raster images directly from /images/", () => {
    expect(shouldUseBrowserImageDirectly("/images/banner/banner-hero-01.png")).toBe(true);
    expect(shouldUseBrowserImageDirectly("/images/about/founder-light.jpg")).toBe(true);
    expect(buildImagePrefetchSrc("/images/about/founder-light.jpg", 828, 78)).toBe(
      "/images/about/founder-light.jpg"
    );
  });

  it("still optimizes remote raster images through next/image", () => {
    expect(shouldUseBrowserImageDirectly("https://example.com/house.webp")).toBe(false);
    expect(buildImagePrefetchSrc("https://example.com/house.webp", 828, 78)).toBe(
      buildNextImagePrefetchHref("https://example.com/house.webp", 828, 78)
    );
  });

  it("never sends vector, gif, and data images through the optimizer", () => {
    expect(shouldUseBrowserImageDirectly("/images/logo.svg")).toBe(true);
    expect(shouldUseBrowserImageDirectly("/uploads/animation.gif")).toBe(true);
    expect(shouldUseBrowserImageDirectly("data:image/svg+xml;base64,abc")).toBe(true);
  });
});
