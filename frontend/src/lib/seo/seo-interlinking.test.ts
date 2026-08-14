import { describe, expect, it } from "vitest";

import {
  HOME_SEO_INTERLINKS,
  PROJECTS_HUB_SEO_INTERLINKS,
  listSeoInterlinkHrefs,
  materialLandingSeoInterlinks,
} from "@/lib/seo/seo-interlinking";
import { AUTHOR_PROJECTS_AFTER_CATALOG_LINKS } from "@/lib/seo/project-catalog-hub-seo";
import { HOME_TURNKEY_SERVICE_TILES } from "@/lib/home-turnkey-services-block";
import { HOME_MATERIAL_CARDS } from "@/lib/home-materials-section";
import { HOME_BUILT_HOMES_VIEW_ALL_HREF } from "@/lib/home-built-homes-block";
import { builtObjectSimilarHouseLinks } from "@/lib/built-object-similar-house-links";

describe("seo-interlinking (ТЗ SEO §25)", () => {
  it("главная: газобетон / кирпич / керамоблок / проекты / объекты / проектирование", () => {
    const hrefs = listSeoInterlinkHrefs(HOME_SEO_INTERLINKS);
    expect(hrefs).toEqual([
      "/projects/gazobeton",
      "/projects/kirpich",
      "/projects/keramoblok",
      "/projects",
      "/portfolio",
      "/services/proektirovanie",
    ]);
    expect(HOME_MATERIAL_CARDS.map((c) => c.seoPath).sort()).toEqual(
      ["/projects/gazobeton", "/projects/keramoblok", "/projects/kirpich"].sort(),
    );
    expect(HOME_TURNKEY_SERVICE_TILES.some((t) => t.href === "/services/proektirovanie")).toBe(true);
    expect(HOME_BUILT_HOMES_VIEW_ALL_HREF).toBe("/portfolio");
  });

  it("/projects: материалы + объекты + проектирование + калькулятор", () => {
    const hrefs = listSeoInterlinkHrefs(PROJECTS_HUB_SEO_INTERLINKS);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/projects/gazobeton",
        "/projects/kirpich",
        "/projects/keramoblok",
        "/portfolio",
        "/services/proektirovanie",
        "/calculator",
      ]),
    );
    expect(AUTHOR_PROJECTS_AFTER_CATALOG_LINKS.map((l) => l.href)).toEqual(
      expect.arrayContaining([
        "/projects/gazobeton",
        "/portfolio",
        "/calculator",
        "/services/proektirovanie",
      ]),
    );
  });

  it("материал: проекты/объекты материала + калькулятор + проектирование", () => {
    const links = materialLandingSeoInterlinks("gazobeton");
    expect(listSeoInterlinkHrefs(links)).toEqual([
      "#material-projects",
      "#material-objects",
      "/calculator",
      "/services/proektirovanie",
    ]);
  });

  it("объект: похожие проекты + материал + расчёт", () => {
    const hrefs = builtObjectSimilarHouseLinks("GAS_BLOCK").map((l) => l.href);
    expect(hrefs).toEqual(
      expect.arrayContaining(["/projects", "/calculator", "/projects/gazobeton"]),
    );
  });
});
