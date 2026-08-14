import { describe, expect, it } from "vitest";

import {
  buildCyrillicMirrorRedirectLocation,
  CYRILLIC_MIRROR_HOST_PUNYCODE,
  CYRILLIC_MIRROR_HOST_UNICODE,
  isCyrillicMirrorHost,
  listSeoMirrorHostsThatMust301,
} from "@/lib/seo/cyrillic-mirror-domain";

describe("cyrillic-mirror-domain (ТЗ SEO §14)", () => {
  it("распознаёт частьдуши.рф в unicode и punycode", () => {
    expect(isCyrillicMirrorHost(CYRILLIC_MIRROR_HOST_PUNYCODE)).toBe(true);
    expect(isCyrillicMirrorHost(CYRILLIC_MIRROR_HOST_UNICODE)).toBe(true);
    expect(isCyrillicMirrorHost("chastdushi.ru")).toBe(false);
    expect(isCyrillicMirrorHost("www.chastdushi.ru")).toBe(false);
  });

  it("главная зеркала → 301 Location на канон с /", () => {
    expect(buildCyrillicMirrorRedirectLocation("/")).toBe("https://chastdushi.ru/");
    expect(buildCyrillicMirrorRedirectLocation("")).toBe("https://chastdushi.ru/");
  });

  it("внутренний URL зеркала → тот же путь на chastdushi.ru", () => {
    expect(buildCyrillicMirrorRedirectLocation("/services/proektirovanie")).toBe(
      "https://chastdushi.ru/services/proektirovanie",
    );
    expect(buildCyrillicMirrorRedirectLocation("/projects/gazobeton")).toBe(
      "https://chastdushi.ru/projects/gazobeton",
    );
  });

  it("сохраняет query как nginx $request_uri", () => {
    expect(buildCyrillicMirrorRedirectLocation("/projects?material=kirpich")).toBe(
      "https://chastdushi.ru/projects?material=kirpich",
    );
  });

  it("зеркало и www обязаны 301, не 200-дубль", () => {
    expect(listSeoMirrorHostsThatMust301()).toEqual(
      expect.arrayContaining([CYRILLIC_MIRROR_HOST_PUNYCODE, "www.chastdushi.ru"]),
    );
  });
});
