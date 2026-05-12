import type { BuiltObjectItem } from "@/lib/construction-shared";
import { getBuiltObjectStages } from "@/lib/construction-shared";
import { getTier1ContentForPhase } from "@/lib/portfolio-case-study-phases-content";

/** Конкретный подпункт с галереей (второй ряд чипов на референсе). */
export interface CaseStudyChipNode {
  id: string;
  label: string;
  /** Пояснение под заголовком активного чипа */
  description?: string;
  images?: string[];
}

/** Первый ряд фильтров; у каждого варианта свой набор второго ряда. */
export interface CaseStudyTier1Chip {
  id: string;
  label: string;
  tier2: CaseStudyChipNode[];
}

/** Этап стройки в левой колонке (таймлайн). */
export interface CaseStudyPhase {
  id: string;
  title: string;
  tier1: CaseStudyTier1Chip[];
}

export type CaseStudyViewMode = "list" | "grid-sm" | "grid-lg";

const DEFAULT_PHASE_TITLES: { id: string; title: string }[] = [
  { id: "foundation", title: "Фундамент" },
  { id: "walls", title: "Стены" },
  { id: "roof", title: "Кровля" },
  { id: "windows", title: "Окна" },
  { id: "partitions", title: "Перегородки" },
  {
    id: "prep-base",
    title: "Подготовка основания под монтаж инженерных коммуникаций",
  },
  {
    id: "mep",
    title: "Отопление, водоснабжение, вентиляция, канализация",
  },
  { id: "ext-vent", title: "Внешняя вентиляция" },
  { id: "conditioning", title: "Кондиционирование" },
  { id: "power", title: "Электроснабжение" },
  { id: "floors", title: "Полы" },
  { id: "facade", title: "Фасад" },
  { id: "blind-area", title: "Отмостка и дренаж" },
  { id: "landscaping", title: "Благоустройство" },
  { id: "external-networks", title: "Наружные сети" },
];

/** Этапы таймлайна с чипами первого/второго уровня — см. `portfolio-case-study-phases-content.ts`. */
export function getDefaultCaseStudyPhases(): CaseStudyPhase[] {
  return DEFAULT_PHASE_TITLES.map((row) => ({
    id: row.id,
    title: row.title,
    tier1: getTier1ContentForPhase(row.id),
  }));
}

/**
 * Если в объекте есть фото этапов (BUILD_STAGE), добавляем блок с реальными снимками,
 * чтобы контент из админки не терялся до появления полной структуры кейса.
 */
function appendStagesArchivePhase(object: BuiltObjectItem, phases: CaseStudyPhase[]): CaseStudyPhase[] {
  const stages = getBuiltObjectStages(object);
  if (stages.length === 0) return phases;

  const images = stages.map((s) => s.url).filter(Boolean);
  if (images.length === 0) return phases;

  const tier2: CaseStudyChipNode[] = stages.map((s, i) => ({
    id: `stage-${s.id}`,
    label: s.label?.trim() || `Этап ${i + 1}`,
    description: s.alt || undefined,
    images: [s.url],
  }));

  const archive: CaseStudyPhase = {
    id: "_build_stages",
    title: "Фото этапов строительства",
    tier1: [
      {
        id: "_all_stages",
        label: "Все этапы",
        tier2:
          tier2.length === 1
            ? tier2
            : [
                {
                  id: "_all_in_one",
                  label: "Все фотографии",
                  description: "Снимки из карточки объекта (этапы строительства).",
                  images,
                },
                ...tier2,
              ],
      },
    ],
  };

  return [...phases, archive];
}

/** Полная конфигурация кейса для страницы объекта. */
export function getCaseStudyPhasesForObject(object: BuiltObjectItem): CaseStudyPhase[] {
  const base = getDefaultCaseStudyPhases();
  return appendStagesArchivePhase(object, base);
}
