import { describe, expect, it } from "vitest";

import {
  buildClientProjectPublicSiteSlug,
  mapClientWallMaterialToBuiltObject,
  resolvePublicSiteStatusFromStages,
} from "@/lib/client-project-public-site-sync";
import type { ClientStageNode } from "@/lib/client-project-stage-status";

describe("client-project-public-site-sync", () => {
  it("mapClientWallMaterialToBuiltObject — русские названия", () => {
    expect(mapClientWallMaterialToBuiltObject("Газобетон")).toBe("GAS_BLOCK");
    expect(mapClientWallMaterialToBuiltObject("Кирпич")).toBe("BRICK");
    expect(mapClientWallMaterialToBuiltObject("Керамоблок")).toBe("CERAMIC_BLOCK");
    expect(mapClientWallMaterialToBuiltObject("Монолит")).toBe("OTHER");
  });

  it("resolvePublicSiteStatusFromStages — строится пока не все этапы сданы", () => {
    const stages: ClientStageNode[] = [
      { id: "1", parentId: null, status: "DONE" },
      { id: "2", parentId: null, status: "IN_PROGRESS" },
    ];
    expect(resolvePublicSiteStatusFromStages(stages)).toBe("UNDER_CONSTRUCTION");

    const done: ClientStageNode[] = [
      { id: "1", parentId: null, status: "DONE" },
      { id: "2", parentId: null, status: "DONE" },
    ];
    expect(resolvePublicSiteStatusFromStages(done)).toBe("COMPLETED");
  });

  it("resolvePublicSiteStatusFromStages — подэтапы учитываются", () => {
    const stages: ClientStageNode[] = [
      { id: "p1", parentId: null, status: "IN_PROGRESS" },
      { id: "c1", parentId: "p1", status: "DONE" },
      { id: "c2", parentId: "p1", status: "IN_PROGRESS" },
    ];
    expect(resolvePublicSiteStatusFromStages(stages)).toBe("UNDER_CONSTRUCTION");
  });

  it("resolvePublicSiteStatusFromStages — без этапов строится", () => {
    expect(resolvePublicSiteStatusFromStages([])).toBe("UNDER_CONSTRUCTION");
  });

  it("buildClientProjectPublicSiteSlug — из названия", () => {
    expect(buildClientProjectPublicSiteSlug("Дом в Токсово", "DOG-12", "abc")).toMatch(/toksovo|dom/);
  });
});
