import { describe, expect, it } from "vitest";
import { safeIframeUrl } from "./safe-iframe-url";

describe("safeIframeUrl", () => {
  it("allows configured secure camera/map hosts", () => {
    expect(safeIframeUrl("https://rtsp.me/embed/abc")).toBe("https://rtsp.me/embed/abc");
    expect(safeIframeUrl("https://maps.yandex.ru/map-widget/v1/")).toBe("https://maps.yandex.ru/map-widget/v1/");
  });

  it("rejects non-https and unknown hosts", () => {
    expect(safeIframeUrl("http://rtsp.me/embed/abc")).toBeNull();
    expect(safeIframeUrl("https://evil.example/embed")).toBeNull();
    expect(safeIframeUrl("javascript:alert(1)")).toBeNull();
  });
});
