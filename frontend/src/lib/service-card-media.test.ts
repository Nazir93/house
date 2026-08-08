import { describe, expect, it } from "vitest";
import { resolveServiceCardMedia, resolveServiceHubVisual } from "@/lib/service-card-media";
import type { ServiceItem } from "@/lib/get-services";

const base: ServiceItem = {
  id: "1",
  slug: "/services/inzheneriya",
  title: "Инженерные сети",
  shortDescription: "Коммуникации",
  icon: "network",
  coverImage: null,
  videoUrl: null,
};

describe("resolveServiceCardMedia", () => {
  it("предпочитает обложку из админки", () => {
    expect(resolveServiceCardMedia({ ...base, coverImage: "/uploads/cover.webp" })).toEqual({
      coverImage: "/uploads/cover.webp",
      videoUrl: null,
    });
  });

  it("без обложки берёт видео", () => {
    expect(resolveServiceCardMedia({ ...base, videoUrl: "/uploads/card.mp4" })).toEqual({
      coverImage: null,
      videoUrl: "/uploads/card.mp4",
    });
  });

  it("без медиа — fallback по slug", () => {
    expect(resolveServiceCardMedia(base).coverImage).toBe("/images/hero/hero-05.png");
  });
});

describe("resolveServiceHubVisual", () => {
  it("обложка админки важнее картинки хаба", () => {
    expect(
      resolveServiceHubVisual({ ...base, coverImage: "/uploads/hub-cover.webp" }, "/images/services/hub/hub-engineering.png")
    ).toEqual({ coverImage: "/uploads/hub-cover.webp", videoUrl: null });
  });

  it("без обложки — видео из админки", () => {
    expect(
      resolveServiceHubVisual({ ...base, videoUrl: "/uploads/hub.mp4" }, "/images/services/hub/hub-engineering.png")
    ).toEqual({ coverImage: null, videoUrl: "/uploads/hub.mp4" });
  });

  it("без медиа админки — centerImageSrc хаба", () => {
    expect(resolveServiceHubVisual(base, "/images/services/hub/hub-engineering.png")).toEqual({
      coverImage: "/images/services/hub/hub-engineering.png",
      videoUrl: null,
    });
  });
});
