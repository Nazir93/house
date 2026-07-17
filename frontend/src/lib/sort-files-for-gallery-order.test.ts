import { describe, expect, it } from "vitest";
import { reverseGalleryUrls, sortFilesForGalleryOrder } from "@/lib/sort-files-for-gallery-order";

function file(name: string, lastModified: number): File {
  return new File(["x"], name, { lastModified, type: "image/jpeg" });
}

describe("sortFilesForGalleryOrder", () => {
  it("сортирует по lastModified по возрастанию (сначала старые)", () => {
    const newer = file("b.jpg", 2000);
    const older = file("a.jpg", 1000);
    expect(sortFilesForGalleryOrder([newer, older])).toEqual([older, newer]);
  });

  it("при одинаковом lastModified сортирует по имени с numeric", () => {
    const t = 1000;
    const f10 = file("IMG_10.jpg", t);
    const f2 = file("IMG_2.jpg", t);
    const f1 = file("IMG_1.jpg", t);
    expect(sortFilesForGalleryOrder([f10, f2, f1]).map((f) => f.name)).toEqual([
      "IMG_1.jpg",
      "IMG_2.jpg",
      "IMG_10.jpg",
    ]);
  });

  it("не мутирует исходный массив", () => {
    const input = [file("b.jpg", 2000), file("a.jpg", 1000)];
    const copy = [...input];
    sortFilesForGalleryOrder(input);
    expect(input).toEqual(copy);
  });
});

describe("reverseGalleryUrls", () => {
  it("переворачивает порядок", () => {
    expect(reverseGalleryUrls(["/a.webp", "/b.webp", "/c.webp"])).toEqual([
      "/c.webp",
      "/b.webp",
      "/a.webp",
    ]);
  });

  it("не мутирует исходный массив", () => {
    const input = ["/a.webp", "/b.webp"];
    reverseGalleryUrls(input);
    expect(input).toEqual(["/a.webp", "/b.webp"]);
  });
});
