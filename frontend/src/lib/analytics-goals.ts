"use client";

import { resolveClientYandexMetrikaCounterId } from "@/lib/analytics-metrika-config";

export const METRIKA_GOALS = {
  leadSubmit: "lead_submit",
  leadCalculator: "lead_calculator",
  leadProject: "lead_project",
  leadCompare: "lead_compare",
  leadMortgage: "lead_mortgage",
  leadMortgageProject: "lead_mortgage_project",
  leadDesign: "lead_design",
  leadLpKirpich: "lead_lp_kirpich",
  leadLpDomPodKlyuch: "lead_lp_dom_pod_klyuch",
  leadLpStoimost: "lead_lp_stoimost",
  leadLpGazobeton: "lead_lp_gazobeton",
  leadLpOdnoetazhnye: "lead_lp_odnoetazhnye",
  leadLpKeramoblok: "lead_lp_keramoblok",
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
  portfolioView: "portfolio_view",
  proposalDownload: "proposal_download",
  reviewSubmit: "review_submit",
} as const;

export type MetrikaGoalName = (typeof METRIKA_GOALS)[keyof typeof METRIKA_GOALS];

export const METRIKA_GOAL_IDS = Object.values(METRIKA_GOALS);

export type TrafficParams = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  yclid: string | null;
};

type MetrikaWindow = Window & {
  ym?: (counterId: number, method: "reachGoal", goal: string, params?: Record<string, unknown>) => void;
};

function cleanParam(value: string | null, maxLength = 160): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export function collectTrafficParams(search: string): TrafficParams {
  const params = new URLSearchParams(search);
  return {
    utmSource: cleanParam(params.get("utm_source"), 120),
    utmMedium: cleanParam(params.get("utm_medium"), 120),
    utmCampaign: cleanParam(params.get("utm_campaign"), 160),
    utmTerm: cleanParam(params.get("utm_term"), 160),
    utmContent: cleanParam(params.get("utm_content"), 160),
    yclid: cleanParam(params.get("yclid"), 160),
  };
}

export function collectCurrentTrafficParams(): TrafficParams {
  if (typeof window === "undefined") {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
      yclid: null,
    };
  }
  return collectTrafficParams(window.location.search);
}

/** Цель Метрики для каждого Lead.source — см. lead-sources.ts */
export function metrikaGoalForLeadSource(source: string): MetrikaGoalName | null {
  if (source === "calculator" || source === "promo-qr-banner") return METRIKA_GOALS.leadCalculator;
  if (source === "project-calculator") return METRIKA_GOALS.leadProject;
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

export function trackMetrikaGoal(goal: MetrikaGoalName, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const counterId = resolveClientYandexMetrikaCounterId();
  const ym = (window as MetrikaWindow).ym;
  if (!Number.isFinite(counterId) || !ym) return;
  ym(counterId, "reachGoal", goal, params);
}

function shouldTrackQuizComplete(source: string): boolean {
  if (source.startsWith("lp-")) return true;
  return source === "calculator" || source === "promo-qr-banner";
}

export function trackLeadSuccess(source: string, params?: Record<string, unknown>) {
  const payload = { source, ...params };
  trackMetrikaGoal(METRIKA_GOALS.leadSubmit, payload);
  const sourceGoal = metrikaGoalForLeadSource(source);
  if (sourceGoal) trackMetrikaGoal(sourceGoal, payload);
  if (shouldTrackQuizComplete(source)) trackMetrikaGoal(METRIKA_GOALS.quizComplete, payload);
}
