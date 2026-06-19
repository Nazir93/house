import type { HouseProjectItem } from "@/lib/construction-data";
import { resolveProjectHeroPricing } from "@/lib/construction-data";

export type CompareCompletionRow = {
  key: string;
  groupTitle: string;
  item: string;
};

export type CompareScheduleRow = {
  key: string;
  title: string;
};

export type CompareHeroTierRow = {
  id: string;
  label: string;
};

export function buildCompareCompletionRows(projects: HouseProjectItem[]): CompareCompletionRow[] {
  const seen = new Set<string>();
  const rows: CompareCompletionRow[] = [];

  for (const project of projects) {
    for (const group of project.completion) {
      for (const item of group.items) {
        const trimmed = item.trim();
        if (!trimmed) continue;
        const key = `${group.title}::${trimmed}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({ key, groupTitle: group.title, item: trimmed });
      }
    }
  }

  return rows;
}

export function projectHasCompletionItem(
  project: HouseProjectItem,
  groupTitle: string,
  item: string,
): boolean {
  return project.completion.some(
    (group) => group.title === groupTitle && group.items.some((i) => i.trim() === item),
  );
}

export function buildCompareScheduleRows(projects: HouseProjectItem[]): CompareScheduleRow[] {
  const seen = new Set<string>();
  const rows: CompareScheduleRow[] = [];

  for (const project of projects) {
    for (const step of project.constructionSchedule) {
      const title = step.title.trim();
      if (!title || seen.has(title)) continue;
      seen.add(title);
      rows.push({ key: title, title });
    }
  }

  return rows;
}

export function resolveCompareScheduleTerm(project: HouseProjectItem, title: string): string | null {
  const step = project.constructionSchedule.find((s) => s.title.trim() === title);
  return step?.term?.trim() || null;
}

export function buildCompareHeroTierRows(projects: HouseProjectItem[]): CompareHeroTierRow[] {
  const map = new Map<string, string>();
  for (const project of projects) {
    for (const tier of resolveProjectHeroPricing(project).tiers) {
      if (!map.has(tier.id)) map.set(tier.id, tier.label);
    }
  }
  return [...map.entries()].map(([id, label]) => ({ id, label }));
}

export function resolveCompareHeroTierPriceRub(
  project: HouseProjectItem,
  tierId: string,
): number | null {
  const tier = resolveProjectHeroPricing(project).tiers.find((t) => t.id === tierId);
  return tier?.price ?? null;
}

export function resolveCompareWarrantyYears(project: HouseProjectItem): number {
  return resolveProjectHeroPricing(project).warrantyYears;
}

export function resolveCompareProductionMonths(project: HouseProjectItem): number {
  return resolveProjectHeroPricing(project).productionMonthsMin;
}

export function maxComparePlanCount(projects: HouseProjectItem[]): number {
  let max = 0;
  for (const project of projects) {
    const count = project.media.filter((m) => m.type === "PLAN").length;
    if (count > max) max = count;
  }
  return max;
}

export function formatCompareYesNo(value: boolean): string {
  return value ? "Да" : "Нет";
}
