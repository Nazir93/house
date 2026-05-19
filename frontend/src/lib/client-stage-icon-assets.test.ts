import { describe, expect, it } from "vitest";
import { resolveStageIconPickerKey } from "./client-stage-icon-assets";

describe("client-stage-icon-assets", () => {
  it("resolveStageIconPickerKey — сохраняет ключ из пикера", () => {
    expect(resolveStageIconPickerKey("foundation")).toBe("foundation");
    expect(resolveStageIconPickerKey("electric")).toBe("electric");
    expect(resolveStageIconPickerKey("driveway")).toBe("driveway");
  });

  it("resolveStageIconPickerKey — legacy alias", () => {
    expect(resolveStageIconPickerKey("circle")).toBe("foundation");
    expect(resolveStageIconPickerKey("finish")).toBe("interior");
    expect(resolveStageIconPickerKey("house")).toBe("facade");
  });

  it("resolveStageIconPickerKey — неизвестный ключ → foundation", () => {
    expect(resolveStageIconPickerKey("unknown-stage")).toBe("foundation");
  });
});
