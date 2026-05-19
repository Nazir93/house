import { describe, expect, it } from "vitest";

/** Логика сравнения фото при публикации (порядок + состав). */
function photosChanged(
  oldPhotos: { url: string; order: number }[],
  newPhotos: { url: string; order: number }[]
): boolean {
  if (oldPhotos.length !== newPhotos.length) return true;
  const seq = (rows: { url: string; order: number }[]) =>
    [...rows].sort((a, b) => a.order - b.order).map((p) => p.url);
  const oldSeq = seq(oldPhotos);
  const newSeq = seq(newPhotos);
  return oldSeq.some((url, i) => url !== newSeq[i]);
}

describe("photosChanged (publish notifications)", () => {
  it("замечает смену порядка при тех же URL", () => {
    const old = [
      { url: "/uploads/a.jpg", order: 0 },
      { url: "/uploads/b.jpg", order: 1 },
    ];
    const neu = [
      { url: "/uploads/b.jpg", order: 0 },
      { url: "/uploads/a.jpg", order: 1 },
    ];
    expect(photosChanged(old, neu)).toBe(true);
  });

  it("false если порядок и состав не менялись", () => {
    const rows = [
      { url: "/uploads/a.jpg", order: 0 },
      { url: "/uploads/b.jpg", order: 1 },
    ];
    expect(photosChanged(rows, rows)).toBe(false);
  });
});
