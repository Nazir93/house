import type { BuiltObjectItem } from "@/lib/construction-shared";
import {
  getBuiltObjectRenders,
  getBuiltObjectPlans,
  getBuiltObjectPhaseMedia,
} from "@/lib/construction-shared";
import {
  parseCaseStudyPhasesJson,
  type CaseStudyPhaseDefinition,
} from "@/lib/portfolio-case-study-phases";
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
        renderUrls.length > 0 ? "Материалы из карточки построенного дома." : undefined
      )
    );
  }

  const plans = getBuiltObjectPlans(object);
  const planUrls = plans.map((m) => m.url).filter(Boolean);
  if (planUrls.length > 0) {
    prefix.push(galleryPhase("_cms_plans", "Планировки", planUrls, "Из карточки построенного дома."));
  }

  return [...prefix, ...phases];
}

/** Разделы стройки: только если в админке загружены фото для phaseKey. */
function constructionPhasesFromAdmin(object: BuiltObjectItem): CaseStudyPhase[] {
  const definitions: CaseStudyPhaseDefinition[] = parseCaseStudyPhasesJson(object.caseStudyPhasesJson);
  return definitions.flatMap(({ id, title }) => {
    const urls = getBuiltObjectPhaseMedia(object, id)
      .map((m) => m.url)
      .filter(Boolean);
    if (urls.length === 0) return [];
    return [galleryPhase(id, title, urls)];
  });
}

export function getCaseStudyPhasesForObject(object: BuiltObjectItem): CaseStudyPhase[] {
  const withConstruction = constructionPhasesFromAdmin(object);
  const withMedia = prependCmsMediaPhases(object, withConstruction);
  return withMedia;
}
