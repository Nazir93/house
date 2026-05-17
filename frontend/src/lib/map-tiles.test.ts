import { describe, expect, it } from "vitest";
import { normalizeRussiaMapCoordinates } from "@/lib/map-tiles";

describe("normalizeRussiaMapCoordinates", () => {
  it("не меняет корректные координаты СПб", () => {
    expect(normalizeRussiaMapCoordinates(59.93, 30.35)).toEqual({
      latitude: 59.93,
      longitude: 30.35,
      swapped: false,
    });
  });

  it("меняет местами перепутанные широту и долготу", () => {
    expect(normalizeRussiaMapCoordinates(30.35, 59.93)).toEqual({
      latitude: 59.93,
      longitude: 30.35,
      swapped: true,
    });
  });
});
