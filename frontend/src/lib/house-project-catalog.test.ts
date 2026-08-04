import { describe, expect, it } from "vitest";

import {
  AUTHOR_HOUSE_PROJECT_CATALOG,
  houseProjectDetailPath,
  PARTNER_HOUSE_PROJECT_CATALOG,
} from "@/lib/house-project-catalog";

describe("houseProjectDetailPath", () => {
  it("без материала — только slug", () => {
    expect(houseProjectDetailPath(AUTHOR_HOUSE_PROJECT_CATALOG, "aurora")).toBe("/projects/aurora");
  });

  it("с материалом из фильтра — query material", () => {
    expect(houseProjectDetailPath(AUTHOR_HOUSE_PROJECT_CATALOG, "aurora", { material: "kirpich" })).toBe(
      "/projects/aurora?material=kirpich",
    );
    expect(
      houseProjectDetailPath(PARTNER_HOUSE_PROJECT_CATALOG, "line", { material: "keramoblok" }),
    ).toBe("/typical-projects/line?material=keramoblok");
  });

  it("material=all не добавляет query", () => {
    expect(houseProjectDetailPath(AUTHOR_HOUSE_PROJECT_CATALOG, "aurora", { material: "all" })).toBe(
      "/projects/aurora",
    );
  });
});
