import { describe, expect, it } from "vitest";

import type { BuiltObjectItem } from "@/lib/construction-shared";
import {
  builtObjectSiteStatusAdminLabel,
  builtObjectSiteStatusFilterToParam,
  builtObjectSiteStatusLabel,
  filterBuiltObjectsBySiteStatus,
  matchesBuiltObjectSiteStatusFilter,
  parseBuiltObjectSiteStatusFilterParam,
} from "@/lib/built-object-site-status";

function obj(siteStatus?: BuiltObjectItem["siteStatus"]): BuiltObjectItem {
  return {
    id: "1",
    slug: "test",
    title: "Test",
    material: "BRICK",
    description: "",
    published: true,
    order: 0,
    media: [],
    siteStatus,
  };
}

describe("built-object-site-status", () => {
  it("parseBuiltObjectSiteStatusFilterParam — building / completed / all", () => {
    expect(parseBuiltObjectSiteStatusFilterParam("building")).toBe("UNDER_CONSTRUCTION");
    expect(parseBuiltObjectSiteStatusFilterParam("under_construction")).toBe("UNDER_CONSTRUCTION");
    expect(parseBuiltObjectSiteStatusFilterParam("completed")).toBe("COMPLETED");
    expect(parseBuiltObjectSiteStatusFilterParam("all")).toBe("all");
    expect(parseBuiltObjectSiteStatusFilterParam(null)).toBe("all");
  });

  it("builtObjectSiteStatusFilterToParam — обратное преобразование", () => {
    expect(builtObjectSiteStatusFilterToParam("UNDER_CONSTRUCTION")).toBe("building");
    expect(builtObjectSiteStatusFilterToParam("COMPLETED")).toBe("completed");
    expect(builtObjectSiteStatusFilterToParam("all")).toBeNull();
  });

  it("filterBuiltObjectsBySiteStatus — готовые и строящиеся", () => {
    const list = [
      obj("COMPLETED"),
      obj("UNDER_CONSTRUCTION"),
      obj(),
      obj("UNDER_CONSTRUCTION"),
    ];
    expect(filterBuiltObjectsBySiteStatus(list, "COMPLETED").map((o) => o.siteStatus)).toEqual([
      "COMPLETED",
      undefined,
    ]);
    expect(filterBuiltObjectsBySiteStatus(list, "UNDER_CONSTRUCTION")).toHaveLength(2);
    expect(filterBuiltObjectsBySiteStatus(list, "all")).toHaveLength(4);
  });

  it("matchesBuiltObjectSiteStatusFilter — пустой статус считается готовым", () => {
    expect(matchesBuiltObjectSiteStatusFilter(obj(), "COMPLETED")).toBe(true);
    expect(matchesBuiltObjectSiteStatusFilter(obj(), "UNDER_CONSTRUCTION")).toBe(false);
    expect(matchesBuiltObjectSiteStatusFilter(obj("UNDER_CONSTRUCTION"), "UNDER_CONSTRUCTION")).toBe(true);
  });

  it("подписи статуса для админки и сайта", () => {
    expect(builtObjectSiteStatusLabel("UNDER_CONSTRUCTION")).toBe("Строится");
    expect(builtObjectSiteStatusLabel("COMPLETED")).toBe("Сдан");
    expect(builtObjectSiteStatusAdminLabel("UNDER_CONSTRUCTION")).toBe("Строится (стройплощадка)");
    expect(builtObjectSiteStatusAdminLabel("COMPLETED")).toBe("Сдан / готов");
  });
});
