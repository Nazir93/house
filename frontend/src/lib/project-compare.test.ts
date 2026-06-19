import { describe, expect, it } from "vitest";
import {
  PROJECT_COMPARE_MAX,
  buildComparePageHref,
  compareEntryKey,
  normalizeCompareEntries,
  parseCompareEntryKey,
  parseCompareSearchParam,
  toggleCompareEntry,
} from "@/lib/project-compare";

describe("project-compare", () => {
  it("compareEntryKey и parseCompareEntryKey — round-trip", () => {
    const entry = { catalogKind: "author" as const, slug: "sherl" };
    expect(parseCompareEntryKey(compareEntryKey(entry))).toEqual(entry);
    expect(parseCompareEntryKey("partner:line-100")).toEqual({
      catalogKind: "partner",
      slug: "line-100",
    });
  });

  it("normalizeCompareEntries — дедуп и лимит", () => {
    const entries = normalizeCompareEntries([
      { catalogKind: "author", slug: "a" },
      { catalogKind: "author", slug: "a" },
      { catalogKind: "partner", slug: "b" },
      { catalogKind: "author", slug: "c" },
      { catalogKind: "author", slug: "d" },
      { catalogKind: "author", slug: "e" },
    ]);
    expect(entries).toHaveLength(PROJECT_COMPARE_MAX);
    expect(entries.map((e) => e.slug)).toEqual(["a", "b", "c", "d"]);
  });

  it("toggleCompareEntry — добавление, удаление, отказ при переполнении", () => {
    const a = { catalogKind: "author" as const, slug: "one" };
    const b = { catalogKind: "author" as const, slug: "two" };

    const first = toggleCompareEntry([], a);
    expect(first.added).toBe(true);
    expect(first.entries).toHaveLength(1);

    const again = toggleCompareEntry(first.entries, a);
    expect(again.removed).toBe(true);
    expect(again.entries).toHaveLength(0);

    let list = toggleCompareEntry([], a).entries;
    list = toggleCompareEntry(list, b).entries;
    list = toggleCompareEntry(list, { catalogKind: "author", slug: "3" }).entries;
    list = toggleCompareEntry(list, { catalogKind: "author", slug: "4" }).entries;
    const full = toggleCompareEntry(list, { catalogKind: "author", slug: "5" });
    expect(full.rejectedFull).toBe(true);
    expect(full.entries).toHaveLength(PROJECT_COMPARE_MAX);
  });

  it("parseCompareSearchParam — несколько p и запятые", () => {
    expect(
      parseCompareSearchParam(["author:alpha,partner:beta", "author:gamma"]),
    ).toEqual([
      { catalogKind: "author", slug: "alpha" },
      { catalogKind: "partner", slug: "beta" },
      { catalogKind: "author", slug: "gamma" },
    ]);
  });

  it("buildComparePageHref — query для шаринга", () => {
    expect(
      buildComparePageHref([
        { catalogKind: "author", slug: "sherl" },
        { catalogKind: "partner", slug: "tk-2" },
      ]),
    ).toBe("/projects/compare?p=author%3Asherl&p=partner%3Atk-2");
  });
});
