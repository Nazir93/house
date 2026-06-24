/** Базовые разделы таймлайна кейса в админке (остальное — через «+ Этап»). */
export const CASE_STUDY_CONSTRUCTION_PHASES = [
  { id: "foundation", title: "Фундамент" },
  { id: "walls", title: "Стены" },
  { id: "roof", title: "Кровля" },
  { id: "facade", title: "Фасад" },
  { id: "engineering", title: "Инженерные работы" },
  { id: "drainage-blind-area", title: "Дренаж и отмостка" },
  { id: "external-networks", title: "Наружные сети" },
] as const;

/** Старые phaseKey → новые (для объектов без caseStudyPhasesJson в БД). */
export const LEGACY_CASE_STUDY_PHASE_KEY_MAP: Record<string, string> = {
  partitions: "walls",
  "prep-base": "engineering",
  mep: "engineering",
  "ext-vent": "engineering",
  conditioning: "engineering",
  power: "engineering",
  "blind-area": "drainage-blind-area",
  landscaping: "drainage-blind-area",
};

export function remapLegacyPhaseMedia(phaseMedia: Record<string, string[]>): Record<string, string[]> {
  const out: Record<string, string[]> = {};

  for (const [key, urls] of Object.entries(phaseMedia)) {
    if (!urls.length) continue;
    const target = normalizeCaseStudyPhaseKey(key) ?? key;
    out[target] = [...(out[target] ?? []), ...urls];
  }

  return out;
}

/** phaseKey из БД → актуальный id этапа (partitions → walls и т.д.). */
export function normalizeCaseStudyPhaseKey(phaseKey: string | null | undefined): string | null {
  if (!phaseKey?.trim()) return null;
  const key = phaseKey.trim();
  return LEGACY_CASE_STUDY_PHASE_KEY_MAP[key] ?? key;
}

export type CaseStudyConstructionPhaseId = (typeof CASE_STUDY_CONSTRUCTION_PHASES)[number]["id"];

export type CaseStudyPhaseDefinition = {
  id: string;
  title: string;
  order: number;
};

export function defaultCaseStudyPhaseDefinitions(): CaseStudyPhaseDefinition[] {
  return CASE_STUDY_CONSTRUCTION_PHASES.map((phase, order) => ({
    id: phase.id,
    title: phase.title,
    order,
  }));
}

export function parseCaseStudyPhasesJson(value: unknown): CaseStudyPhaseDefinition[] {
  if (!Array.isArray(value)) return defaultCaseStudyPhaseDefinitions();

  const parsed = value
    .map((row, index) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const id = String(item.id ?? "").trim();
      const title = String(item.title ?? "").trim();
      if (!id || !title) return null;
      return {
        id,
        title,
        order: typeof item.order === "number" ? item.order : index,
      };
    })
    .filter((row): row is CaseStudyPhaseDefinition => row != null)
    .sort((a, b) => a.order - b.order);

  return parsed.length > 0 ? parsed : defaultCaseStudyPhaseDefinitions();
}

export function createCaseStudyPhaseDefinition(title = "Новый этап"): CaseStudyPhaseDefinition {
  return {
    id: `phase-${Date.now()}`,
    title,
    order: 999,
  };
}

export function normalizeCaseStudyPhaseDefinitions(
  phases: CaseStudyPhaseDefinition[],
): CaseStudyPhaseDefinition[] {
  return phases.map((phase, order) => ({ ...phase, order }));
}
