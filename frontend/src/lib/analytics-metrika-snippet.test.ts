import { describe, expect, it } from "vitest";

import {
  buildYandexMetrikaInlineBootstrap,
  buildYandexMetrikaNoscriptImgSrc,
  buildYandexMetrikaTagScriptSrc,
  metrikaSnippetMarkersPresent,
} from "@/lib/analytics-metrika-snippet";
import { DEFAULT_YANDEX_METRIKA_ID } from "@/lib/analytics-metrika-config";

describe("analytics-metrika-snippet", () => {
  it("строит tag.js и noscript watch для 110112800", () => {
    expect(buildYandexMetrikaTagScriptSrc(DEFAULT_YANDEX_METRIKA_ID)).toBe(
      "https://mc.yandex.ru/metrika/tag.js?id=110112800",
    );
    expect(buildYandexMetrikaNoscriptImgSrc(DEFAULT_YANDEX_METRIKA_ID)).toBe(
      "https://mc.yandex.ru/watch/110112800",
    );
  });

  it("inline bootstrap содержит init, tag.js и window counter key", () => {
    const html = buildYandexMetrikaInlineBootstrap("110112800");
    const markers = metrikaSnippetMarkersPresent(html, "110112800");
    expect(markers.hasCounterId).toBe(true);
    expect(markers.hasTagJs).toBe(true);
    expect(markers.hasInit).toBe(true);
    expect(html).toContain("__HOUSE_YM_COUNTER_ID__");
    expect(html).toContain("accurateTrackBounce");
  });

  it("отклоняет невалидный id", () => {
    expect(() => buildYandexMetrikaInlineBootstrap("abc")).toThrow(/invalid/);
  });
});
