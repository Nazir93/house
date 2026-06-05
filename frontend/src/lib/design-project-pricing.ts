export const DESIGN_MAIN_DOCUMENTATION_ITEMS = [
  "Привязка проекта к участку",
  "Архитектурный раздел проекта",
] as const;

export type DesignProjectExtras = {
  model3d: boolean;
  constructive: boolean;
  audit: boolean;
  engineering: boolean;
};

export type DesignProjectPricingSettings = {
  areaMin: number;
  areaMax: number;
  mainDocumentationPerM2: number;
  model3dFixed: number;
  constructivePerM2: number;
  auditFixed: number;
  engineeringPerM2: number;
};

export const DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS: DesignProjectPricingSettings = {
  areaMin: 50,
  areaMax: 600,
  mainDocumentationPerM2: 1400,
  model3dFixed: 45_000,
  constructivePerM2: 900,
  auditFixed: 45_000,
  engineeringPerM2: 700,
};

function positiveNumber(raw: unknown, fallback: number): number {
  return typeof raw === "number" && Number.isFinite(raw) && raw >= 0 ? raw : fallback;
}

export function normalizeDesignProjectPricingSettings(raw: unknown): DesignProjectPricingSettings {
  const fallback = DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS;
  if (!raw || typeof raw !== "object") return fallback;
  const data = raw as Partial<DesignProjectPricingSettings>;
  const areaMin = Math.max(1, Math.round(positiveNumber(data.areaMin, fallback.areaMin)));
  const areaMax = Math.max(areaMin, Math.round(positiveNumber(data.areaMax, fallback.areaMax)));
  return {
    areaMin,
    areaMax,
    mainDocumentationPerM2: Math.round(positiveNumber(data.mainDocumentationPerM2, fallback.mainDocumentationPerM2)),
    model3dFixed: Math.round(positiveNumber(data.model3dFixed, fallback.model3dFixed)),
    constructivePerM2: Math.round(positiveNumber(data.constructivePerM2, fallback.constructivePerM2)),
    auditFixed: Math.round(positiveNumber(data.auditFixed, fallback.auditFixed)),
    engineeringPerM2: Math.round(positiveNumber(data.engineeringPerM2, fallback.engineeringPerM2)),
  };
}

export function clampDesignArea(
  raw: number,
  settings: DesignProjectPricingSettings = DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS
): number {
  if (!Number.isFinite(raw) || raw < settings.areaMin) return settings.areaMin;
  if (raw > settings.areaMax) return settings.areaMax;
  return Math.round(raw);
}

export function calculateDesignProjectQuote(
  areaInput: number,
  extras: DesignProjectExtras,
  settings: DesignProjectPricingSettings = DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS
) {
  const cfg = normalizeDesignProjectPricingSettings(settings);
  const area = clampDesignArea(areaInput, cfg);
  const mainDocumentation = Math.round(area * cfg.mainDocumentationPerM2);

  const additional3d = extras.model3d ? cfg.model3dFixed : 0;
  const additionalConstructive = extras.constructive ? Math.round(area * cfg.constructivePerM2) : 0;
  const additionalAudit = extras.audit ? cfg.auditFixed : 0;
  const additionalEngineering = extras.engineering ? Math.round(area * cfg.engineeringPerM2) : 0;
  const additionalDocumentation = additional3d + additionalConstructive + additionalAudit + additionalEngineering;

  const total = mainDocumentation + additionalDocumentation;

  return {
    area,
    mainDocumentation,
    additionalDocumentation,
    breakdown: {
      model3d: additional3d,
      constructive: additionalConstructive,
      audit: additionalAudit,
      engineering: additionalEngineering,
    },
    total,
  };
}
