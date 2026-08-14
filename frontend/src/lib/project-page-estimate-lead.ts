/**
 * Заявка с карточки проекта: имя + телефон → лид, без калькулятора.
 * Опционально — сноска «уточнить в смете» по этапу/пункту.
 */

export type ProjectPageEstimateLeadMeta = {
  source: "project-page-estimate";
  service: string;
  calcData: {
    projectSlug: string;
    projectTitle: string;
    materialLabel?: string;
    priceRub?: number;
    /** Тема уточнения (этап комплектации и т.п.) */
    clarificationTopic?: string;
    /** Текст сноски для менеджера / формы */
    clarificationNote?: string;
  };
};

export function buildProjectClarificationNote(topic: string): string {
  const t = topic.replace(/\s+/g, " ").trim();
  if (!t) return "Клиент хочет уточнить состав работ в смете.";
  return `Клиент хочет уточнить в смете: «${t}».`;
}

export function projectPageEstimateLeadMeta(input: {
  slug: string;
  title: string;
  materialLabel?: string | null;
  priceRub?: number | null;
  /** Например название этапа: «Проект» */
  clarificationTopic?: string | null;
}): ProjectPageEstimateLeadMeta {
  const title = input.title.trim() || input.slug.trim() || "проект";
  const slug = input.slug.trim() || "project";
  const materialLabel = input.materialLabel?.trim() || undefined;
  const priceRub =
    typeof input.priceRub === "number" && Number.isFinite(input.priceRub) && input.priceRub > 0
      ? Math.round(input.priceRub)
      : undefined;
  const clarificationTopic = input.clarificationTopic?.replace(/\s+/g, " ").trim() || undefined;
  const clarificationNote = clarificationTopic
    ? buildProjectClarificationNote(clarificationTopic)
    : undefined;

  const service = clarificationTopic
    ? `Смета · уточнение «${clarificationTopic}» · проект ${title}`
    : `Смета · проект ${title}`;

  return {
    source: "project-page-estimate",
    service,
    calcData: {
      projectSlug: slug,
      projectTitle: title,
      ...(materialLabel ? { materialLabel } : {}),
      ...(priceRub != null ? { priceRub } : {}),
      ...(clarificationTopic ? { clarificationTopic } : {}),
      ...(clarificationNote ? { clarificationNote } : {}),
    },
  };
}

/** Сноска из payload модалки (если есть). */
export function readEstimateClarificationNote(calcData: unknown): string | null {
  if (!calcData || typeof calcData !== "object") return null;
  const note = (calcData as { clarificationNote?: unknown }).clarificationNote;
  if (typeof note !== "string") return null;
  const trimmed = note.replace(/\s+/g, " ").trim();
  return trimmed || null;
}
