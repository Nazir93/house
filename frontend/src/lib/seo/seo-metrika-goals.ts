/**
 * Цели Метрики из ТЗ SEO §24.
 * Рабочие события уже есть (quiz_*, lead_*, phone/telegram/max).
 * Имена из ТЗ дублируем только там, где реально шлём reachGoal — без пустых алиасов.
 * WhatsApp на сайте нет → whatsapp_click пропускаем (есть phone / telegram / max).
 */

import { getProjectMaterialSeoSlugs } from "@/lib/seo/project-material-seo";

export const SEO_METRIKA_TZ_GOALS = {
  calculateStart: "calculate_start",
  calculateComplete: "calculate_complete",
  projectOpen: "project_open",
  formSubmit: "form_submit",
  phoneClick: "phone_click",
  telegramClick: "telegram_click",
  /** Нет WhatsApp на сайте — не заводим цель. */
  whatsappClick: "whatsapp_click",
  visitConstructionRequest: "visit_construction_request",
  mortgageRequest: "mortgage_request",
} as const;

export type SeoMetrikaTzGoalStatus = "wired" | "skip";

export const SEO_METRIKA_TZ_GOAL_STATUS: Record<
  (typeof SEO_METRIKA_TZ_GOALS)[keyof typeof SEO_METRIKA_TZ_GOALS],
  SeoMetrikaTzGoalStatus
> = {
  calculate_start: "wired",
  calculate_complete: "wired",
  project_open: "wired",
  form_submit: "wired",
  phone_click: "wired",
  telegram_click: "wired",
  whatsapp_click: "skip",
  visit_construction_request: "wired",
  mortgage_request: "wired",
};

const MATERIAL_HUB_SEGMENTS = new Set<string>(getProjectMaterialSeoSlugs());

/** Клик по карточке проекта (не хаб каталога и не посадочная материала). */
export function isProjectOpenPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/+$/, "") || "/";
  const author = path.match(/^\/projects\/([^/]+)$/);
  if (author) {
    const slug = author[1];
    if (!slug || MATERIAL_HUB_SEGMENTS.has(slug)) return false;
    return true;
  }
  const partner = path.match(/^\/typical-projects\/([^/]+)$/);
  return Boolean(partner?.[1]);
}

/** Заявка / переход «посетить строящийся объект». */
export function isVisitConstructionPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/+$/, "") || "/";
  return path === "/portfolio/under-construction";
}

export function isMortgageLeadSource(source: string): boolean {
  return source === "mortgage" || source === "house-project-mortgage";
}

export function isVisitConstructionLeadSource(source: string): boolean {
  return source === "portfolio-case-cta" || source === "portfolio-tour";
}

export function listWiredSeoMetrikaTzGoals(): string[] {
  return Object.entries(SEO_METRIKA_TZ_GOAL_STATUS)
    .filter(([, status]) => status === "wired")
    .map(([goal]) => goal);
}
