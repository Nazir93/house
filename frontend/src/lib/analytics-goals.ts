"use client";

export const METRIKA_GOALS = {
  leadSubmit: "lead_submit",
  leadCalculator: "lead_calculator",
  leadProject: "lead_project",
  leadCompare: "lead_compare",
  leadMortgage: "lead_mortgage",
  leadDesign: "lead_design",
  leadLpKirpich: "lead_lp_kirpich",
  leadLpDomPodKlyuch: "lead_lp_dom_pod_klyuch",
  leadLpStoimost: "lead_lp_stoimost",
  phoneClick: "phone_click",
  telegramClick: "telegram_click",
  maxClick: "max_click",
  quizStart: "quiz_start",
  quizComplete: "quiz_complete",
  portfolioView: "portfolio_view",
  proposalDownload: "proposal_download",
  reviewSubmit: "review_submit",
} as const;

type MetrikaGoalName = (typeof METRIKA_GOALS)[keyof typeof METRIKA_GOALS];

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

function goalForLeadSource(source: string): MetrikaGoalName | null {
  if (source === "calculator" || source === "promo-qr-banner") return METRIKA_GOALS.leadCalculator;
  if (source === "project-calculator") return METRIKA_GOALS.leadProject;
  if (source === "compare") return METRIKA_GOALS.leadCompare;
  if (source === "mortgage") return METRIKA_GOALS.leadMortgage;
  if (source === "individual-design" || source === "house-project-design") return METRIKA_GOALS.leadDesign;
  if (source === "lp-kirpich") return METRIKA_GOALS.leadLpKirpich;
  if (source === "lp-dom-pod-klyuch") return METRIKA_GOALS.leadLpDomPodKlyuch;
  if (source === "lp-stoimost") return METRIKA_GOALS.leadLpStoimost;
  return null;
}

export function trackMetrikaGoal(goal: MetrikaGoalName, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const counterId = Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "110112800");
  const ym = (window as MetrikaWindow).ym;
  if (!Number.isFinite(counterId) || !ym) return;
  ym(counterId, "reachGoal", goal, params);
}

export function trackLeadSuccess(source: string, params?: Record<string, unknown>) {
  const payload = { source, ...params };
  trackMetrikaGoal(METRIKA_GOALS.leadSubmit, payload);
  const sourceGoal = goalForLeadSource(source);
  if (sourceGoal) trackMetrikaGoal(sourceGoal, payload);
  if (source.startsWith("lp-")) trackMetrikaGoal(METRIKA_GOALS.quizComplete, payload);
}

