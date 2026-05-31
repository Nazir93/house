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

  it("still optimizes remote and public raster images through next/image", () => {
    expect(shouldUseBrowserImageDirectly("/images/banner/banner-hero-01.png")).toBe(false);
    expect(shouldUseBrowserImageDirectly("https://example.com/house.webp")).toBe(false);
    expect(buildImagePrefetchSrc("/images/banner/banner-hero-01.png", 828, 78)).toBe(
      buildNextImagePrefetchHref("/images/banner/banner-hero-01.png", 828, 78)
    );
  });

  it("never sends vector, gif, and data images through the optimizer", () => {
    expect(shouldUseBrowserImageDirectly("/images/logo.svg")).toBe(true);
    expect(shouldUseBrowserImageDirectly("/uploads/animation.gif")).toBe(true);
    expect(shouldUseBrowserImageDirectly("data:image/svg+xml;base64,abc")).toBe(true);
  });
});
