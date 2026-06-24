import {
  parseCaseStudyPhasesJson,
  type CaseStudyPhaseDefinition,
  normalizeCaseStudyPhaseKey,
} from "@/lib/portfolio-case-study-phases";

type MediaType = "RENDER" | "PLAN" | "BUILD_STAGE" | "VIDEO";

export type BuiltObjectPlanInput = { url: string; label: string };

function splitUrls(urls: unknown): string[] {
  const list = Array.isArray(urls) ? urls : typeof urls === "string" ? urls.split("\n") : [];
  return list.map(String).map((url) => url.trim()).filter(Boolean);
}

function mediaRows(urls: unknown, type: MediaType, phaseKey?: string | null) {
  return splitUrls(urls).map((url, order) => ({
    type,
    url,
    order,
    ...(phaseKey ? { phaseKey } : {}),
  }));
}

function planRows(plans: unknown) {
  if (!Array.isArray(plans)) return mediaRows(plans, "PLAN");
  return plans
    .map((item, order) => {
      if (typeof item === "string") {
        const url = item.trim();
        return url ? { type: "PLAN" as const, url, order, label: null } : null;
      }
      if (item && typeof item === "object" && "url" in item) {
        const row = item as { url: string; label?: string };
        const url = String(row.url).trim();
        if (!url) return null;
        const label = row.label?.trim();
        return { type: "PLAN" as const, url, order, label: label || null };
      }
      return null;
    })
    .filter((row): row is NonNullable<typeof row> => row != null);
}

export function resolveCaseStudyPhaseIdsFromBody(body: Record<string, unknown>): string[] {
  const fromJson = parseCaseStudyPhasesJson(body.caseStudyPhasesJson ?? body.caseStudyPhases);
  const ids = fromJson.map((phase) => phase.id);
  const phaseMedia = body.phaseMedia;
  if (phaseMedia && typeof phaseMedia === "object" && !Array.isArray(phaseMedia)) {
    for (const key of Object.keys(phaseMedia as Record<string, unknown>)) {
      if (!ids.includes(key)) ids.push(key);
    }
  }
  return ids;
}

/** Сборка записей BuiltObjectMedia из тела запроса админки. */
export function builtObjectMediaCreatePayload(body: Record<string, unknown>) {
  const phaseMedia = body.phaseMedia;
  const phaseIds = resolveCaseStudyPhaseIdsFromBody(body);
  let buildStageOrder = 0;
  const phaseRows =
    phaseMedia && typeof phaseMedia === "object" && !Array.isArray(phaseMedia)
      ? phaseIds.flatMap((id) =>
          splitUrls((phaseMedia as Record<string, unknown>)[id]).map((url) => ({
            type: "BUILD_STAGE" as const,
            url,
            order: buildStageOrder++,
            phaseKey: id,
          })),
        )
      : [];

  return [
    ...mediaRows(body.renders, "RENDER"),
    ...planRows(body.plans),
    ...phaseRows,
    ...mediaRows(body.videos, "VIDEO"),
  ];
}

export function builtObjectFormHasMediaPayload(body: Record<string, unknown>) {
  if (
    body.renders !== undefined ||
    body.plans !== undefined ||
    body.videos !== undefined ||
    body.phaseMedia !== undefined
  ) {
    return true;
  }
  return false;
}

export function initialPhaseMediaArrays(
  media: { type: string; url: string; order?: number; phaseKey?: string | null }[] | undefined,
  phaseIds: string[],
): Record<string, string[]> {
  const keys = [
    ...new Set([
      ...phaseIds,
      ...(media ?? [])
        .filter((item) => item.type === "BUILD_STAGE" && item.phaseKey)
        .map((item) => String(item.phaseKey)),
    ]),
  ];

  return Object.fromEntries(
    keys.map((id) => [
      id,
      (media ?? [])
        .filter(
          (item) =>
            item.type === "BUILD_STAGE" && normalizeCaseStudyPhaseKey(item.phaseKey) === id,
        )
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((item) => item.url),
    ]),
  );
}

export function mapBuiltObjectMediaToForm(
  media:
    | { type: string; url: string; order?: number; label?: string | null; phaseKey?: string | null }[]
    | undefined,
  caseStudyPhases: CaseStudyPhaseDefinition[],
) {
  const list = media ?? [];
  return {
    renders: list.filter((item) => item.type === "RENDER").map((item) => item.url),
    plans: list
      .filter((item) => item.type === "PLAN")
      .map((item) => ({ url: item.url, label: item.label || "" })),
    phaseMedia: initialPhaseMediaArrays(list, caseStudyPhases.map((phase) => phase.id)),
    videos: list.filter((item) => item.type === "VIDEO").map((item) => item.url),
  };
}
