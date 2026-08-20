/** First-touch UTM / yclid / landing / referrer for lead + Metrika payloads. */

export const TRAFFIC_SESSION_STORAGE_KEY = "house_traffic_first_touch_v1";

export type PersistedTraffic = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  yclid: string | null;
  landingUrl: string | null;
  referrer: string | null;
};

export type TrafficParams = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  yclid: string | null;
};

function cleanParam(value: string | null, maxLength = 160): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export function collectTrafficParams(search: string): TrafficParams {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  return {
    utmSource: cleanParam(params.get("utm_source"), 120),
    utmMedium: cleanParam(params.get("utm_medium"), 120),
    utmCampaign: cleanParam(params.get("utm_campaign"), 160),
    utmTerm: cleanParam(params.get("utm_term"), 160),
    utmContent: cleanParam(params.get("utm_content"), 160),
    yclid: cleanParam(params.get("yclid"), 160),
  };
}

export function emptyTrafficParams(): TrafficParams {
  return {
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
    yclid: null,
  };
}

/** Non-null from `next` wins; else keep `prev`. */
export function mergeTrafficParams(prev: TrafficParams, next: TrafficParams): TrafficParams {
  return {
    utmSource: next.utmSource ?? prev.utmSource,
    utmMedium: next.utmMedium ?? prev.utmMedium,
    utmCampaign: next.utmCampaign ?? prev.utmCampaign,
    utmTerm: next.utmTerm ?? prev.utmTerm,
    utmContent: next.utmContent ?? prev.utmContent,
    yclid: next.yclid ?? prev.yclid,
  };
}

export function parsePersistedTraffic(raw: string | null): PersistedTraffic | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedTraffic>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      utmSource: typeof parsed.utmSource === "string" ? parsed.utmSource : null,
      utmMedium: typeof parsed.utmMedium === "string" ? parsed.utmMedium : null,
      utmCampaign: typeof parsed.utmCampaign === "string" ? parsed.utmCampaign : null,
      utmTerm: typeof parsed.utmTerm === "string" ? parsed.utmTerm : null,
      utmContent: typeof parsed.utmContent === "string" ? parsed.utmContent : null,
      yclid: typeof parsed.yclid === "string" ? parsed.yclid : null,
      landingUrl: typeof parsed.landingUrl === "string" ? parsed.landingUrl : null,
      referrer: typeof parsed.referrer === "string" ? parsed.referrer : null,
    };
  } catch {
    return null;
  }
}

export function buildFirstTouchTraffic(input: {
  search: string;
  href: string;
  referrer: string;
  existing: PersistedTraffic | null;
}): PersistedTraffic {
  const fromUrl = collectTrafficParams(input.search);
  if (!input.existing) {
    return {
      ...fromUrl,
      landingUrl: cleanParam(input.href, 500),
      referrer: cleanParam(input.referrer, 500),
    };
  }
  return {
    ...mergeTrafficParams(input.existing, fromUrl),
    landingUrl: input.existing.landingUrl ?? cleanParam(input.href, 500),
    referrer: input.existing.referrer ?? cleanParam(input.referrer, 500),
  };
}

export function captureFirstTouchTrafficInSession(): PersistedTraffic | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = parsePersistedTraffic(sessionStorage.getItem(TRAFFIC_SESSION_STORAGE_KEY));
    const next = buildFirstTouchTraffic({
      search: window.location.search,
      href: window.location.href,
      referrer: document.referrer || "",
      existing,
    });
    sessionStorage.setItem(TRAFFIC_SESSION_STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}

export function readFirstTouchTraffic(): PersistedTraffic | null {
  if (typeof window === "undefined") return null;
  try {
    return parsePersistedTraffic(sessionStorage.getItem(TRAFFIC_SESSION_STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * Для заявки: first-touch UTM/yclid, дополненные текущим query;
 * pageUrl — текущая страница; landing/referrer — из first-touch.
 */
export function resolveLeadTrafficForSubmit(): TrafficParams & {
  pageUrl: string;
  landingUrl: string | null;
  referrer: string | null;
} {
  if (typeof window === "undefined") {
    return { ...emptyTrafficParams(), pageUrl: "", landingUrl: null, referrer: null };
  }
  const stored = captureFirstTouchTrafficInSession();
  const current = collectTrafficParams(window.location.search);
  const merged = mergeTrafficParams(
    {
      utmSource: stored?.utmSource ?? null,
      utmMedium: stored?.utmMedium ?? null,
      utmCampaign: stored?.utmCampaign ?? null,
      utmTerm: stored?.utmTerm ?? null,
      utmContent: stored?.utmContent ?? null,
      yclid: stored?.yclid ?? null,
    },
    current,
  );
  return {
    ...merged,
    pageUrl: window.location.href,
    landingUrl: stored?.landingUrl ?? window.location.href,
    referrer: stored?.referrer ?? (document.referrer || null),
  };
}

/** Фрагмент в calcData заявки: referrer, посадочная, тип формы. */
export function buildLeadTrafficCalcFields(input: {
  formType: string;
  material?: string | null;
  landingUrl?: string | null;
  referrer?: string | null;
}): Record<string, unknown> {
  return {
    formType: input.formType,
    ...(input.material ? { wallMaterial: input.material, material: input.material } : {}),
    traffic: {
      landingUrl: input.landingUrl ?? null,
      referrer: input.referrer ?? null,
      formType: input.formType,
    },
  };
}
