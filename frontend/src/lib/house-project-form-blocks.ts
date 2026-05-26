import type { CompletionGroup, ConstructionStep } from "@/lib/construction-shared";
import { normalizeHeroPricing } from "@/lib/construction-data";

export const DEFAULT_COMPLETION_GROUPS: CompletionGroup[] = [
  { title: "Теплый контур", items: ["Фундамент", "Стены", "Кровля", "Окна"] },
  { title: "Дополнительные опции", items: ["3D-моделирование", "Инженерные сети", "Отделка"] },
];

export const DEFAULT_SCHEDULE_STEPS: ConstructionStep[] = [
  { title: "Подготовка участка", term: "1-2 недели", description: "Разметка и подготовительные работы." },
  { title: "Фундамент", term: "3-4 недели", description: "Армирование, бетонные работы и набор прочности." },
  { title: "Коробка и кровля", term: "6-10 недель", description: "Стены, перекрытия и кровельный контур." },
];

export const DEFAULT_ANCHORS: { id: string; label: string }[] = [
  { id: "plans", label: "Планировки и фасады" },
  { id: "completion", label: "Комплектация" },
  { id: "schedule", label: "График строительства" },
  { id: "mortgage", label: "Ипотека" },
];

export const ANCHOR_SECTION_OPTIONS = [
  { value: "plans", label: "Планировки и фасады" },
  { value: "completion", label: "Комплектация" },
  { value: "schedule", label: "График строительства" },
  { value: "mortgage", label: "Ипотека" },
] as const;

export type HeroTierForm = { id: string; label: string; price: string };

export type HeroPricingFormState = {
  useCustomTiers: boolean;
  tiers: HeroTierForm[];
  warrantyYears: string;
  productionMonthsMin: string;
};

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/30";

export { inputClass as houseProjectBlockInputClass };

function defaultHeroTierForms(fallbackPrice: number): HeroTierForm[] {
  const base = Math.max(0, Math.round(fallbackPrice));
  return [
    { id: "gas", label: "Газоблок", price: base > 0 ? String(base) : "" },
    { id: "ceramic", label: "Керамоблок", price: base > 0 ? String(Math.round(base * 1.034)) : "" },
    { id: "brick", label: "Кирпич", price: base > 0 ? String(Math.round(base * 1.086)) : "" },
  ];
}

export function parseCompletionFromDb(raw: unknown): CompletionGroup[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return structuredClone(DEFAULT_COMPLETION_GROUPS);
  }
  const groups: CompletionGroup[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const o = item as Record<string, unknown>;
    const title = String(o.title ?? "").trim();
    const items = Array.isArray(o.items) ? o.items.map((x) => String(x).trim()).filter(Boolean) : [];
    if (!title && items.length === 0) continue;
    groups.push({ title: title || "Без названия", items: items.length ? items : [""] });
  }
  return groups.length ? groups : structuredClone(DEFAULT_COMPLETION_GROUPS);
}

export function serializeCompletion(groups: CompletionGroup[]): CompletionGroup[] {
  return groups
    .map((g) => ({
      title: g.title.trim(),
      items: g.items.map((i) => i.trim()).filter(Boolean),
    }))
    .filter((g) => g.title || g.items.length > 0);
}

export function parseScheduleFromDb(raw: unknown): ConstructionStep[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return structuredClone(DEFAULT_SCHEDULE_STEPS);
  }
  const steps: ConstructionStep[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const o = item as Record<string, unknown>;
    const title = String(o.title ?? "").trim();
    const term = String(o.term ?? "").trim();
    const description = String(o.description ?? "").trim();
    if (!title && !term && !description) continue;
    steps.push({
      title: title || "Этап",
      term: term || "—",
      description,
    });
  }
  return steps.length ? steps : structuredClone(DEFAULT_SCHEDULE_STEPS);
}

export function serializeSchedule(steps: ConstructionStep[]): ConstructionStep[] {
  return steps
    .map((s) => ({
      title: s.title.trim(),
      term: s.term.trim(),
      description: s.description.trim(),
    }))
    .filter((s) => s.title || s.term || s.description);
}

export function parseAnchorsFromDb(raw: unknown): { id: string; label: string }[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return structuredClone(DEFAULT_ANCHORS);
  }
  const anchors: { id: string; label: string }[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const o = item as Record<string, unknown>;
    const id = String(o.id ?? "").trim();
    const label = String(o.label ?? "").trim();
    if (!id && !label) continue;
    anchors.push({ id: id || "plans", label: label || id });
  }
  return anchors.length ? anchors : structuredClone(DEFAULT_ANCHORS);
}

export function serializeAnchors(anchors: { id: string; label: string }[]): { id: string; label: string }[] {
  return anchors
    .map((a) => ({
      id: a.id.trim() || "plans",
      label: a.label.trim(),
    }))
    .filter((a) => a.label.length > 0);
}

export function parseHeroPricingFormFromDb(raw: unknown, fallbackPrice: number): HeroPricingFormState {
  const normalized = normalizeHeroPricing(raw);
  if (normalized?.tiers.length) {
    return {
      useCustomTiers: true,
      tiers: normalized.tiers.map((t) => ({
        id: t.id,
        label: t.label,
        price: String(t.price),
      })),
      warrantyYears: normalized.warrantyYears != null ? String(normalized.warrantyYears) : "",
      productionMonthsMin:
        normalized.productionMonthsMin != null ? String(normalized.productionMonthsMin) : "",
    };
  }
  const wy =
    raw && typeof raw === "object" && !Array.isArray(raw) ?
      Number((raw as Record<string, unknown>).warrantyYears)
    : NaN;
  const pm =
    raw && typeof raw === "object" && !Array.isArray(raw) ?
      Number((raw as Record<string, unknown>).productionMonthsMin)
    : NaN;
  return {
    useCustomTiers: false,
    tiers: defaultHeroTierForms(fallbackPrice),
    warrantyYears: Number.isFinite(wy) && wy > 0 ? String(Math.round(wy)) : "",
    productionMonthsMin: Number.isFinite(pm) && pm > 0 ? String(Math.round(pm)) : "",
  };
}

export function buildHeroPricingJson(state: HeroPricingFormState): Record<string, unknown> | null {
  const out: Record<string, unknown> = {};
  if (state.useCustomTiers) {
    const tiers = state.tiers
      .map((t) => ({
        id: t.id.trim() || "tier",
        label: t.label.trim(),
        price: Math.round(Number(t.price.replace(/\s/g, ""))),
      }))
      .filter((t) => t.label && Number.isFinite(t.price) && t.price > 0);
    if (tiers.length) out.tiers = tiers;
  }
  const wy = Number(state.warrantyYears.replace(/\s/g, ""));
  const pm = Number(state.productionMonthsMin.replace(/\s/g, ""));
  if (Number.isFinite(wy) && wy > 0) out.warrantyYears = Math.round(wy);
  if (Number.isFinite(pm) && pm > 0) out.productionMonthsMin = Math.round(pm);
  return Object.keys(out).length ? out : null;
}
