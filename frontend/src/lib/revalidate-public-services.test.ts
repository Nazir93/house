import { describe, it, expect, vi, beforeEach } from "vitest";

const revalidatePathMock = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

vi.mock("@/lib/revalidate-tag", () => ({
  revalidateTagWithProfile: vi.fn(),
}));

describe("revalidatePublicServices", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
  });

  it("сбрасывает хаб и конкретный лендинг по slug", async () => {
    const { revalidatePublicServices } = await import("@/lib/revalidate-public-content");
    revalidatePublicServices("inzheneriya");
    expect(revalidatePathMock).toHaveBeenCalledWith("/services");
    expect(revalidatePathMock).toHaveBeenCalledWith("/services/inzheneriya");
  });

  it("принимает полный путь /services/…", async () => {
    const { revalidatePublicServices } = await import("@/lib/revalidate-public-content");
    revalidatePublicServices("/services/krovlya");
    expect(revalidatePathMock).toHaveBeenCalledWith("/services/krovlya");
  });
});
