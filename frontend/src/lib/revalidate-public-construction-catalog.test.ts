import { describe, it, expect, vi, beforeEach } from "vitest";
import { CACHE_TAG_PUBLIC_BUILT_OBJECTS, CACHE_TAG_PUBLIC_HOUSE_PROJECTS } from "@/lib/cache-tags-public";

const revalidatePathMock = vi.fn();
const revalidateTagWithProfileMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

vi.mock("@/lib/revalidate-tag", () => ({
  revalidateTagWithProfile: (...args: unknown[]) => revalidateTagWithProfileMock(...args),
}));

describe("revalidatePublicConstructionCatalog", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
    revalidateTagWithProfileMock.mockClear();
  });

  it("сбрасывает теги кэша типовых домов и построенных объектов", async () => {
    const { revalidatePublicConstructionCatalog } = await import("@/lib/revalidate-public-content");
    revalidatePublicConstructionCatalog();
    expect(revalidateTagWithProfileMock).toHaveBeenCalledWith(CACHE_TAG_PUBLIC_HOUSE_PROJECTS);
    expect(revalidateTagWithProfileMock).toHaveBeenCalledWith(CACHE_TAG_PUBLIC_BUILT_OBJECTS);
  });

  it("обновляет главную, каталог проектов и портфолио", async () => {
    const { revalidatePublicConstructionCatalog } = await import("@/lib/revalidate-public-content");
    revalidatePublicConstructionCatalog();
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
    expect(revalidatePathMock).toHaveBeenCalledWith("/projects");
    expect(revalidatePathMock).toHaveBeenCalledWith("/portfolio");
  });
});
