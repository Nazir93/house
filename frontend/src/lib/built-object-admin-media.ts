import { CASE_STUDY_CONSTRUCTION_PHASES } from "@/lib/portfolio-case-study-phases";

type MediaType = "RENDER" | "PLAN" | "BUILD_STAGE" | "VIDEO";

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

/** Сборка записей BuiltObjectMedia из тела запроса админки. */
export function builtObjectMediaCreatePayload(body: Record<string, unknown>) {
  const phaseMedia = body.phaseMedia;
  const phaseRows =
    phaseMedia && typeof phaseMedia === "object" && !Array.isArray(phaseMedia)
      ? CASE_STUDY_CONSTRUCTION_PHASES.flatMap(({ id }) =>
          mediaRows((phaseMedia as Record<string, unknown>)[id], "BUILD_STAGE", id)
        )
      : [];

  return [
    ...mediaRows(body.renders, "RENDER"),
    ...mediaRows(body.plans, "PLAN"),
    ...phaseRows,
    ...mediaRows(body.stages, "BUILD_STAGE"),
    ...mediaRows(body.videos, "VIDEO"),
  ];
}

export function builtObjectFormHasMediaPayload(body: Record<string, unknown>) {
  if (
    body.renders !== undefined ||
    body.plans !== undefined ||
    body.stages !== undefined ||
    body.videos !== undefined ||
    body.phaseMedia !== undefined
  ) {
    return true;
  }
  return false;
}

/** Строки URL для textarea в форме (по типу и опциональному phaseKey). */
export function mediaUrlsForForm(
  media: { type: string; url: string; phaseKey?: string | null }[] | undefined,
  type: string,
  phaseKey?: string | null
): string {
  return (media ?? [])
    .filter((item) => {
      if (item.type !== type) return false;
      if (phaseKey === undefined) return true;
      if (phaseKey === null) return !item.phaseKey;
      return item.phaseKey === phaseKey;
    })
    .map((item) => item.url)
    .join("\n");
}

export function initialPhaseMediaForm(
  media: { type: string; url: string; phaseKey?: string | null }[] | undefined
): Record<string, string> {
  return Object.fromEntries(
    CASE_STUDY_CONSTRUCTION_PHASES.map(({ id }) => [id, mediaUrlsForForm(media, "BUILD_STAGE", id)])
  );
}
