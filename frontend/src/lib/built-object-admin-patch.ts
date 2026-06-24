import {
  builtObjectAdminSectionSavedMessage,
  parseBuiltObjectAdminSection,
  type BuiltObjectAdminSection,
} from "@/lib/built-object-admin-sections";
import { builtObjectFormHasMediaPayload, builtObjectMediaCreatePayload } from "@/lib/built-object-admin-media";
import { builtObjectCoordinatesFromBody } from "@/lib/built-object-coordinates";

function n(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function nf(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const s = String(value).trim().replace(",", ".");
  const parsed = parseFloat(s);
  return Number.isFinite(parsed) ? parsed : null;
}

function ni(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function builtObjectSectionUpdateData(
  body: Record<string, unknown>,
  section: BuiltObjectAdminSection,
): Record<string, unknown> {
  const coords = builtObjectCoordinatesFromBody(body);

  switch (section) {
    case "main":
      return {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.material !== undefined && { material: body.material }),
        ...(body.area !== undefined && { area: n(body.area) }),
        ...(body.rooms !== undefined && { rooms: ni(body.rooms) }),
        ...(body.bathrooms !== undefined && { bathrooms: ni(body.bathrooms) }),
        ...(body.buildTerm !== undefined && { buildTerm: body.buildTerm || null }),
        ...(body.foundation !== undefined && { foundation: body.foundation || null }),
        ...(body.walls !== undefined && { walls: body.walls || null }),
        ...(body.roof !== undefined && { roof: body.roof || null }),
        ...(body.floors !== undefined && { floors: nf(body.floors) }),
        ...(body.regionSlug !== undefined && {
          regionSlug: String(body.regionSlug ?? "").trim() || null,
        }),
        ...(body.district !== undefined && {
          district: String(body.district ?? "").trim() || null,
        }),
        ...(body.siteStatus !== undefined && {
          siteStatus: body.siteStatus === "UNDER_CONSTRUCTION" ? "UNDER_CONSTRUCTION" : "COMPLETED",
        }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(coords != null && { latitude: coords.latitude, longitude: coords.longitude }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.worksDescription !== undefined && { worksDescription: body.worksDescription || null }),
        ...(body.houseProjectId !== undefined && { houseProjectId: body.houseProjectId || null }),
        ...(body.order !== undefined && { order: Number(body.order) || 0 }),
      };
    case "history":
      return {
        ...(body.constructionHistoryJson !== undefined && {
          constructionHistoryJson: Array.isArray(body.constructionHistoryJson)
            ? body.constructionHistoryJson
            : null,
        }),
      };
    case "media": {
      const hasMedia = builtObjectFormHasMediaPayload(body);
      return {
        ...(body.clientReviewText !== undefined && {
          clientReviewText: body.clientReviewText || null,
        }),
        ...(body.clientReviewVideoUrl !== undefined && {
          clientReviewVideoUrl: body.clientReviewVideoUrl || null,
        }),
        ...(body.telegramUrl !== undefined && { telegramUrl: body.telegramUrl || null }),
        ...(body.vkUrl !== undefined && { vkUrl: body.vkUrl || null }),
        ...(hasMedia && {
          media: {
            deleteMany: {},
            create: builtObjectMediaCreatePayload(body),
          },
        }),
      };
    }
    case "phases": {
      const hasMedia = builtObjectFormHasMediaPayload(body);
      return {
        ...(body.caseStudyPhasesJson !== undefined && {
          caseStudyPhasesJson: Array.isArray(body.caseStudyPhasesJson) ? body.caseStudyPhasesJson : null,
        }),
        ...(hasMedia && {
          media: {
            deleteMany: {},
            create: builtObjectMediaCreatePayload(body),
          },
        }),
      };
    }
  }
}

export function parseBuiltObjectDraftSection(body: Record<string, unknown>): BuiltObjectAdminSection {
  return parseBuiltObjectAdminSection(body.draftSection) ?? "main";
}

export function builtObjectSectionSavedResponse(section: BuiltObjectAdminSection) {
  return builtObjectAdminSectionSavedMessage(section);
}

export { n, nf, ni };
