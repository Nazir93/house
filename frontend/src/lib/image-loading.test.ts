import { describe, expect, it } from "vitest";

import {
  buildImagePrefetchSrc,
  buildNextImagePrefetchHref,
  isUploadImageSrc,
  shouldUseBrowserImageDirectly,
} from "@/lib/image-loading";

describe("image-loading", () => {
  it("растры /uploads и /images идут через next/image (ресайз под экран)", () => {
    expect(isUploadImageSrc("/uploads/hero.webp")).toBe(true);
    expect(shouldUseBrowserImageDirectly("/uploads/hero.webp")).toBe(false);
    expect(shouldUseBrowserImageDirectly("/uploads/house.jpg?cache=1")).toBe(false);
    expect(shouldUseBrowserImageDirectly("/images/banner/banner-hero-01.png")).toBe(false);
    expect(shouldUseBrowserImageDirectly("/images/about/founder-light.jpg")).toBe(false);
    expect(buildImagePrefetchSrc("/uploads/hero.webp", 828, 78)).toBe(
      buildNextImagePrefetchHref("/uploads/hero.webp", 828, 78),
    );
    expect(buildImagePrefetchSrc("/images/banner/banner-hero-01.png", 1080, 75)).toBe(
      buildNextImagePrefetchHref("/images/banner/banner-hero-01.png", 1080, 75),
    );
  });

  it("still optimizes remote raster images through next/image", () => {
    expect(shouldUseBrowserImageDirectly("https://example.com/house.webp")).toBe(false);
    expect(buildImagePrefetchSrc("https://example.com/house.webp", 828, 78)).toBe(
      buildNextImagePrefetchHref("https://example.com/house.webp", 828, 78),
    );
  });

  it("never sends vector, gif, and data images through the optimizer", () => {
    expect(shouldUseBrowserImageDirectly("/images/logo.svg")).toBe(true);
    expect(shouldUseBrowserImageDirectly("/uploads/animation.gif")).toBe(true);
    expect(shouldUseBrowserImageDirectly("data:image/svg+xml;base64,abc")).toBe(true);
  });
});
