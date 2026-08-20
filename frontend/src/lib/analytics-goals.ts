"use client";

import { resolveClientYandexMetrikaCounterId } from "@/lib/analytics-metrika-config";
import {
  collectTrafficParams,
  emptyTrafficParams,
  resolveLeadTrafficForSubmit,
  type TrafficParams,
} from "@/lib/analytics-traffic";
import {
  isMortgageLeadSource,
  isVisitConstructionLeadSource,
} from "@/lib/seo/seo-metrika-goals";

export type { TrafficParams };
export {
  collectTrafficParams,
  emptyTrafficParams,
  resolveLeadTrafficForSubmit,
} from "@/lib/analytics-traffic";

/**
 * Идентификаторы условий JS-целей (reachGoal), не числовые ID UI Метрики.
 * UI ID (сверка с кабинетом):
 * 593966484 → lead_lp_kirpich
 * 593975324 → lead_lp_kirpich_callback
 * 593985668 → lead_lp_keramoblok
 * 593994796 → lead_lp_keramoblok_callback
 * 594449404 → lead_lp_gazobeton
 * 594449441 → lead_lp_gazobeton_callback
 * 594448264 → lead_calculator
 */
export const METRIKA_GOALS = {
  leadSubmit: "lead_submit",
  leadCalculator: "lead_calculator",
  leadProject: "lead_project",
  leadCompare: "lead_compare",
  leadMortgage: "lead_mortgage",
  leadMortgageProject: "lead_mortgage_project",
  leadDesign: "lead_design",
  leadLpKirpich: "lead_lp_kirpich",
  leadLpKirpichCallback: "lead_lp_kirpich_callback",
  leadLpDomPodKlyuch: "lead_lp_dom_pod_klyuch",
  leadLpStoimost: "lead_lp_stoimost",
  leadLpGazobeton: "lead_lp_gazobeton",
  leadLpGazobetonCallback: "lead_lp_gazobeton_callback",
  leadLpOdnoetazhnye: "lead_lp_odnoetazhnye",
  leadLpKeramoblok: "lead_lp_keramoblok",
  leadLpKeramoblokCallback: "lead_lp_keramoblok_callback",
  leadPartnerPartner: "lead_partner_partner",
  leadPartnerSupplier: "lead_partner_supplier",
  leadPartnerVacancy: "lead_partner_vacancy",
  leadService: "lead_service",
  leadServiceConsult: "lead_service_consult",
  leadAbout: "lead_about",
  leadPortfolio: "lead_portfolio",
  phoneClick: "phone_click",
  telegramClick: "telegram_click",
  maxClick: "max_click",
  quizStart: "quiz_start",
  quizComplete: "quiz_complete",
  /** ТЗ SEO §24 — дублируем рядом с quiz_* для отчётов по заявкам после SEO. */
  calculateStart: "calculate_start",
  calculateComplete: "calculate_complete",
  projectOpen: "project_open",
  formSubmit: "form_submit",
  visitConstructionRequest: "visit_construction_request",
  mortgageRequest: "mortgage_request",
  portfolioView: "portfolio_view",
  proposalDownload: "proposal_download",
  reviewSubmit: "review_submit",
} as const;

export type MetrikaGoalName = (typeof METRIKA_GOALS)[keyof typeof METRIKA_GOALS];

export const METRIKA_GOAL_IDS = Object.values(METRIKA_GOALS);

/** Сколько ждать callback reachGoal перед редиректом на /spasibo (Метрика блокирована / не загрузилась). */
export const METRIKA_REACH_GOAL_TIMEOUT_MS = 700;

type YmFn = ((...args: unknown[]) => void) & { a?: unknown[]; l?: number };

type MetrikaWindow = Window & {
  ym?: YmFn;
};

export function collectCurrentTrafficParams(): TrafficParams {
  if (typeof window === "undefined") return emptyTrafficParams();
  return collectTrafficParams(window.location.search);
}

const LP_CALLBACK_GOAL_BY_SLUG: Record<string, MetrikaGoalName> = {
  kirpich: METRIKA_GOALS.leadLpKirpichCallback,
  gazobeton: METRIKA_GOALS.leadLpGazobetonCallback,
  keramoblok: METRIKA_GOALS.leadLpKeramoblokCallback,
};

/** `lp-kirpich-header-callback` / `lp-gazobeton-nav-callback` → callback goal. */
export function metrikaGoalForLpCallbackSource(source: string): MetrikaGoalName | null {
  const m = /^lp-([a-z0-9-]+)-(?:header|nav)-callback$/.exec(source);
  if (!m?.[1]) return null;
  return LP_CALLBACK_GOAL_BY_SLUG[m[1]] ?? null;
}

/** Цель Метрики для каждого Lead.source — см. lead-sources.ts */
export function metrikaGoalForLeadSource(source: string): MetrikaGoalName | null {
  const callbackGoal = metrikaGoalForLpCallbackSource(source);
  if (callbackGoal) return callbackGoal;
  if (source === "calculator" || source === "promo-qr-banner") return METRIKA_GOALS.leadCalculator;
  if (source === "project-calculator" || source === "project-page-estimate") return METRIKA_GOALS.leadProject;
  if (source === "compare") return METRIKA_GOALS.leadCompare;
  if (source === "mortgage") return METRIKA_GOALS.leadMortgage;
  if (source === "house-project-mortgage") return METRIKA_GOALS.leadMortgageProject;
  if (source === "individual-design" || source === "house-project-design") return METRIKA_GOALS.leadDesign;
  if (source === "lp-kirpich") return METRIKA_GOALS.leadLpKirpich;
  if (source === "lp-dom-pod-klyuch") return METRIKA_GOALS.leadLpDomPodKlyuch;
  if (source === "lp-stoimost") return METRIKA_GOALS.leadLpStoimost;
  if (source === "lp-gazobeton") return METRIKA_GOALS.leadLpGazobeton;
  if (source === "lp-odnoetazhnye") return METRIKA_GOALS.leadLpOdnoetazhnye;
  if (source === "lp-keramoblok") return METRIKA_GOALS.leadLpKeramoblok;
  if (source === "partner-partner") return METRIKA_GOALS.leadPartnerPartner;
  if (source === "partner-supplier") return METRIKA_GOALS.leadPartnerSupplier;
  if (source === "partner-vacancy") return METRIKA_GOALS.leadPartnerVacancy;
  if (source === "about-leadership-feedback") return METRIKA_GOALS.leadAbout;
  if (source === "portfolio-case-cta") return METRIKA_GOALS.leadPortfolio;
  if (source.startsWith("service-consult-")) return METRIKA_GOALS.leadServiceConsult;
  if (source.startsWith("service-")) return METRIKA_GOALS.leadService;
  return null;
}

/** Только реальные квиз/калькулятор — не lp-*-callback. */
export function shouldTrackQuizComplete(source: string): boolean {
  if (source === "calculator" || source === "promo-qr-banner") return true;
  return (
    source === "lp-kirpich" ||
    source === "lp-gazobeton" ||
    source === "lp-keramoblok" ||
    source === "lp-dom-pod-klyuch" ||
    source === "lp-stoimost" ||
    source === "lp-odnoetazhnye"
  );
}

export function trackMetrikaGoal(goal: MetrikaGoalName, params?: Record<string, unknown>) {
  void trackMetrikaGoalAsync(goal, params);
}

/**
 * reachGoal с callback Метрики + таймаут (если ym нет / AdBlock / сеть).
 * Всегда resolve — редирект на /spasibo не должен зависеть от блокировщика.
 */
export function trackMetrikaGoalAsync(
  goal: MetrikaGoalName,
  params?: Record<string, unknown>,
  timeoutMs: number = METRIKA_REACH_GOAL_TIMEOUT_MS,
): Promise<"ok" | "timeout" | "missing"> {
  if (typeof window === "undefined") return Promise.resolve("missing");
  const counterId = resolveClientYandexMetrikaCounterId();
  const ym = (window as MetrikaWindow).ym;
  if (!Number.isFinite(counterId) || typeof ym !== "function") {
    return Promise.resolve("missing");
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (reason: "ok" | "timeout" | "missing") => {
      if (settled) return;
      settled = true;
      resolve(reason);
    };
    const timer = window.setTimeout(() => finish("timeout"), timeoutMs);
    try {
      ym(counterId, "reachGoal", goal, params ?? {}, () => {
        window.clearTimeout(timer);
        finish("ok");
      });
    } catch {
      window.clearTimeout(timer);
      finish("missing");
    }
  });
}

/** Старт калькулятора / квиза: quiz_start + calculate_start (ТЗ §24). */
export function trackQuizStart(params?: Record<string, unknown>) {
  trackMetrikaGoal(METRIKA_GOALS.quizStart, params);
  trackMetrikaGoal(METRIKA_GOALS.calculateStart, params);
}

/**
 * После успешного POST /api/leads. Ждёт ключевые reachGoal (source + lead_submit),
 * затем возвращает управление — вызывающий код может редиректить на /spasibo.
 */
export async function trackLeadSuccess(source: string, params?: Record<string, unknown>): Promise<void> {
  const payload = { source, ...params };
  const sourceGoal = metrikaGoalForLeadSource(source);
  const waits: Promise<"ok" | "timeout" | "missing">[] = [
    trackMetrikaGoalAsync(METRIKA_GOALS.leadSubmit, payload),
  ];
  if (sourceGoal) waits.push(trackMetrikaGoalAsync(sourceGoal, payload));

  trackMetrikaGoal(METRIKA_GOALS.formSubmit, payload);
  if (shouldTrackQuizComplete(source)) {
    trackMetrikaGoal(METRIKA_GOALS.quizComplete, payload);
    trackMetrikaGoal(METRIKA_GOALS.calculateComplete, payload);
  }
  if (isMortgageLeadSource(source)) {
    trackMetrikaGoal(METRIKA_GOALS.mortgageRequest, payload);
  }
  if (isVisitConstructionLeadSource(source)) {
    trackMetrikaGoal(METRIKA_GOALS.visitConstructionRequest, payload);
  }

  await Promise.all(waits);
}

export function trackMetrikaHit(url: string, options?: { title?: string; referer?: string }) {
  if (typeof window === "undefined") return;
  const counterId = resolveClientYandexMetrikaCounterId();
  const ym = (window as MetrikaWindow).ym;
  if (!Number.isFinite(counterId) || typeof ym !== "function") return;
  ym(counterId, "hit", url, {
    title: options?.title,
    referer: options?.referer,
  });
}

/** Пропуск первого hit после init (иначе двойной просмотр). */
export function shouldSendSpaMetrikaHit(isFirstNavigation: boolean): boolean {
  return !isFirstNavigation;
}
