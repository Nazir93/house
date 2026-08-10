import { describe, expect, it } from "vitest";

import {
  buildUploadFileStem,
  isJunkUploadStem,
  slugifyUploadStem,
  stripUploadExtension,
} from "@/lib/upload-file-stem";

describe("slugifyUploadStem", () => {
  it("транслитерирует кириллицу и ставит дефисы", () => {
    expect(slugifyUploadStem("Петергоф (Банный комплекс)")).toBe("petergof-bannyy-kompleks");
  });

  it("пустую строку оставляет пустой", () => {
    expect(slugifyUploadStem("!!!")).toBe("");
  });
});

describe("isJunkUploadStem", () => {
  it("ловит ChatGPT / скриншоты / камеру", () => {
    expect(isJunkUploadStem("ChatGPT_Image_27_июл_2026_г__16_48_00")).toBe(true);
    expect(isJunkUploadStem("Screenshot 2026-07-27")).toBe(true);
    expect(isJunkUploadStem("IMG_1234")).toBe(true);
    expect(isJunkUploadStem("WhatsApp Image 2024-01-01")).toBe(true);
  });

  it("не трогает осмысленные имена", () => {
    expect(isJunkUploadStem("petergof-bannyj-kompleks")).toBe(false);
    expect(isJunkUploadStem("Сясьстрой фасад")).toBe(false);
  });
});

describe("buildUploadFileStem", () => {
  const suffix = "ms3a8v7k";

  it("при nameHint игнорирует мусорное имя файла", () => {
    expect(
      buildUploadFileStem({
        originalFileName: "ChatGPT_Image_27_июл_2026_г__16_48_00.png",
        nameHint: "Петергоф (Банный комплекс)",
        uniqueSuffix: suffix,
      }),
    ).toBe("petergof-bannyy-kompleks-ms3a8v7k");
  });

  it("добавляет роль (план)", () => {
    expect(
      buildUploadFileStem({
        originalFileName: "scan.pdf",
        nameHint: "syasstroy",
        role: "plan",
        kind: "document",
        uniqueSuffix: suffix,
      }),
    ).toBe("syasstroy-plan-ms3a8v7k");
  });

  it("без подсказки и с мусором — photo + суффикс", () => {
    expect(
      buildUploadFileStem({
        originalFileName: "ChatGPT_Image_1.webp",
        uniqueSuffix: suffix,
      }),
    ).toBe("photo-ms3a8v7k");
  });

  it("без подсказки сохраняет хорошее имя файла", () => {
    expect(
      buildUploadFileStem({
        originalFileName: "kirpichnyj-dom-fasad.jpg",
        uniqueSuffix: suffix,
      }),
    ).toBe("kirpichnyj-dom-fasad-ms3a8v7k");
  });

  it("stripUploadExtension убирает расширение", () => {
    expect(stripUploadExtension("a.b.webp")).toBe("a.b");
  });
});
