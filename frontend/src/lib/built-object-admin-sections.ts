import { serializeConstructionHistory } from "@/lib/built-object-detail";
import { normalizeCaseStudyPhaseDefinitions } from "@/lib/portfolio-case-study-phases";
import { stableDraftPayloadString } from "@/lib/draft-section-baseline";

export type BuiltObjectAdminSection = "main" | "history" | "media" | "phases";

export const BUILT_OBJECT_ADMIN_SECTION_LABELS: Record<BuiltObjectAdminSection, string> = {
  main: "Основное",
  history: "История строительства",
  media: "Медиа кейса",
  phases: "Этапы строительства",
};

export type BuiltObjectAdminFormSnapshot = {
  title: string;
  slug: string;
  material: string;
  area: string;
  rooms: string;
  bathrooms: string;
  buildTerm: string;
  floors: string;
  location: string;
  latitude: string;
  longitude: string;
  regionSlug: string;
  district: string;
  siteStatus: string;
  description: string;
  worksDescription: string;
  houseProjectId: string;
  order: string;
  telegramUrl: string;
  vkUrl: string;
  clientReviewText: string;
  clientReviewVideoUrl: string;
  renders: string[];
  plans: { url: string; label: string }[];
  phaseMedia: Record<string, string[]>;
  videos: string[];
  historyStages: { id: string; title: string; description: string }[];
  caseStudyPhases: { id: string; title: string; order: number }[];
};

export function parseBuiltObjectAdminSection(value: unknown): BuiltObjectAdminSection | null {
  if (value === "main" || value === "history" || value === "media" || value === "phases") return value;
  return null;
}

export function builtObjectAdminSectionSavedMessage(section: BuiltObjectAdminSection): string {
  return `Раздел «${BUILT_OBJECT_ADMIN_SECTION_LABELS[section]}» сохранён.`;
}

export function hasUnpublishedBuiltObjectSiteDraft(object: {
  published: boolean;
  updatedAt: Date | string;
  sitePublishedAt?: Date | string | null;
}): boolean {
  if (!object.published) return true;
  if (!object.sitePublishedAt) return true;
  return new Date(object.updatedAt).getTime() > new Date(object.sitePublishedAt).getTime();
}

export function buildBuiltObjectAdminBaselineKey(
  objectId: string,
  initial: {
    updatedAt?: Date | string;
    sitePublishedAt?: Date | string | null;
    title: string;
    slug: string;
    material: string;
    area?: number | null;
    rooms?: number | null;
    bathrooms?: number | null;
    buildTerm?: string | null;
    floors?: number | null;
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    regionSlug?: string | null;
    district?: string | null;
    siteStatus?: string | null;
    description?: string | null;
    worksDescription?: string | null;
    houseProjectId?: string | null;
    order?: number | null;
    telegramUrl?: string | null;
    vkUrl?: string | null;
    clientReviewText?: string | null;
    clientReviewVideoUrl?: string | null;
    constructionHistoryJson?: unknown;
    caseStudyPhasesJson?: unknown;
    media?: { type: string; url: string; label?: string | null; phaseKey?: string | null }[];
  },
): string {
  return stableDraftPayloadString({
    objectId,
    updatedAt: initial.updatedAt ?? null,
    sitePublishedAt: initial.sitePublishedAt ?? null,
    main: {
      title: initial.title,
      slug: initial.slug,
      material: initial.material,
      area: initial.area,
      rooms: initial.rooms,
      bathrooms: initial.bathrooms,
      buildTerm: initial.buildTerm,
      floors: initial.floors,
      location: initial.location,
      latitude: initial.latitude,
      longitude: initial.longitude,
      regionSlug: initial.regionSlug,
      district: initial.district,
      siteStatus: initial.siteStatus,
      description: initial.description,
      worksDescription: initial.worksDescription,
      houseProjectId: initial.houseProjectId,
      order: initial.order,
    },
    history: initial.constructionHistoryJson ?? null,
    phases: initial.caseStudyPhasesJson ?? null,
    media: (initial.media ?? []).map((item) => ({
      type: item.type,
      url: item.url,
      label: item.label ?? null,
      phaseKey: item.phaseKey ?? null,
    })),
    links: {
      telegramUrl: initial.telegramUrl ?? null,
      vkUrl: initial.vkUrl ?? null,
      clientReviewText: initial.clientReviewText ?? null,
      clientReviewVideoUrl: initial.clientReviewVideoUrl ?? null,
    },
  });
}

function buildFullMediaPayload(form: BuiltObjectAdminFormSnapshot) {
  return {
    renders: form.renders,
    plans: form.plans,
    phaseMedia: form.phaseMedia,
    videos: form.videos,
    caseStudyPhases: normalizeCaseStudyPhaseDefinitions(form.caseStudyPhases),
  };
}

export function buildBuiltObjectSectionPayload(
  section: BuiltObjectAdminSection,
  form: BuiltObjectAdminFormSnapshot,
): Record<string, unknown> {
  switch (section) {
    case "main":
      return {
        title: form.title,
        slug: form.slug,
        material: form.material,
        area: form.area,
        rooms: form.rooms,
        bathrooms: form.bathrooms,
        buildTerm: form.buildTerm,
        floors: form.floors,
        location: form.location,
        latitude: form.latitude,
        longitude: form.longitude,
        regionSlug: form.regionSlug,
        district: form.district,
        siteStatus: form.siteStatus,
        description: form.description,
        worksDescription: form.worksDescription,
        houseProjectId: form.houseProjectId,
        order: form.order,
      };
    case "history":
      return {
        constructionHistoryJson: serializeConstructionHistory(form.historyStages),
      };
    case "media":
      return {
        ...buildFullMediaPayload(form),
        clientReviewText: form.clientReviewText,
        clientReviewVideoUrl: form.clientReviewVideoUrl || null,
        telegramUrl: form.telegramUrl,
        vkUrl: form.vkUrl,
      };
    case "phases":
      return {
        caseStudyPhasesJson: normalizeCaseStudyPhaseDefinitions(form.caseStudyPhases),
        ...buildFullMediaPayload(form),
      };
  }
}

export function builtObjectSectionPayloadString(
  section: BuiltObjectAdminSection,
  form: BuiltObjectAdminFormSnapshot,
): string {
  return stableDraftPayloadString(buildBuiltObjectSectionPayload(section, form));
}
