import type { BuiltObjectItem } from "@/lib/construction-shared";
import {
  getBuiltObjectStages,
  getBuiltObjectRenders,
  getBuiltObjectPlans,
  getBuiltObjectPhaseMedia,
} from "@/lib/construction-shared";
import { CASE_STUDY_CONSTRUCTION_PHASES } from "@/lib/portfolio-case-study-phases";
import { formatArticleBody } from "@/lib/html-content";

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

function galleryPhase(phaseId: string, title: string, urls: string[], description?: string): CaseStudyPhase {
  return {
    id: phaseId,
    title,
    tier1: [
      {
        id: `${phaseId}-gallery`,
        label: "Галерея",
        tier2: [
          {
            id: `${phaseId}-all`,
            label: urls.length > 1 ? "Все фото" : "Фото",
            description,
            images: urls,
          },
        ],
      },
    ],
  };
}

function prependCmsMediaPhases(object: BuiltObjectItem, phases: CaseStudyPhase[]): CaseStudyPhase[] {
  const prefix: CaseStudyPhase[] = [];

  const renders = getBuiltObjectRenders(object);
  const renderUrls = renders.map((m) => m.url).filter(Boolean);
  const descriptionHtml = formatArticleBody(object.description ?? "");
  const showRendersPhase = renderUrls.length > 0 || descriptionHtml.trim().length > 0;

  if (showRendersPhase) {
    prefix.push(
      galleryPhase(
        "_cms_renders",
        "Рендеры и фото объекта",
        renderUrls,
        renderUrls.length > 0 ? "Материалы из карточки портфолио." : undefined
      )
    );
  }

  const plans = getBuiltObjectPlans(object);
  const planUrls = plans.map((m) => m.url).filter(Boolean);
  if (planUrls.length > 0) {
    prefix.push(galleryPhase("_cms_plans", "Планировки", planUrls, "Из карточки портфолио."));
  }

  return [...prefix, ...phases];
}

/** Разделы стройки: только если в админке загружены фото для phaseKey. */
function constructionPhasesFromAdmin(object: BuiltObjectItem): CaseStudyPhase[] {
  return CASE_STUDY_CONSTRUCTION_PHASES.flatMap(({ id, title }) => {
    const urls = getBuiltObjectPhaseMedia(object, id)
      .map((m) => m.url)
      .filter(Boolean);
    if (urls.length === 0) return [];
    return [galleryPhase(id, title, urls)];
  });
}

/** Legacy: общее поле «этапы стройки» без phaseKey — отдельный раздел в конце. */
function appendLegacyStagesPhase(object: BuiltObjectItem, phases: CaseStudyPhase[]): CaseStudyPhase[] {
  const stages = getBuiltObjectStages(object);
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
                  description: "Снимки без привязки к разделу кейса.",
                  images,
                },
                ...tier2,
              ],
      },
    ],
  };

  return [...phases, archive];
}

/**
 * Таймлайн кейса: только разделы с контентом из админки
 * (рендеры, описание, планировки, фото по phaseKey, legacy-этапы).
 */
export function getCaseStudyPhasesForObject(object: BuiltObjectItem): CaseStudyPhase[] {
  const withConstruction = constructionPhasesFromAdmin(object);
  const withMedia = prependCmsMediaPhases(object, withConstruction);
  return appendLegacyStagesPhase(object, withMedia);
}
