import type { BuiltObjectItem, ConstructionMedia } from "@/lib/construction-shared";
import {
  getBuiltObjectCover,
  getBuiltObjectPhaseMedia,
  getBuiltObjectPlans,
  getBuiltObjectStages,
} from "@/lib/construction-shared";

/** Разделы «История строительства» на публичной карточке (соответствие phaseKey в админке). */
export const BUILT_OBJECT_HISTORY_SECTIONS = [
  {
    id: "foundation",
    title: "Фундамент",
    phaseKeys: ["foundation"],
    textField: "foundation" as const,
  },
  {
    id: "walls",
    title: "Стены",
    phaseKeys: ["walls", "partitions"],
    textField: "walls" as const,
  },
  {
    id: "roof",
    title: "Кровля",
    phaseKeys: ["roof"],
    textField: "roof" as const,
  },
  {
    id: "windows",
    title: "Окна",
    phaseKeys: ["windows"],
  },
  {
    id: "engineering",
    title: "Инженерные сети",
    phaseKeys: ["prep-base", "mep", "ext-vent", "conditioning", "power", "external-networks"],
  },
  {
    id: "facade",
    title: "Отделка фасада",
    phaseKeys: ["facade"],
  },
  {
    id: "interior",
    title: "Внутренняя отделка",
    phaseKeys: ["floors"],
  },
  {
    id: "landscaping",
    title: "Благоустройство участка и въездная группа",
    phaseKeys: ["landscaping", "blind-area"],
  },
] as const;

export type BuiltObjectNavSectionId =
  | "description"
  | "plans"
  | "construction-photos"
  | "history"
  | "video";

export type BuiltObjectNavItem = {
  id: BuiltObjectNavSectionId;
  label: string;
};

export type BuiltObjectHistoryCard = {
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
};

export type BuiltObjectHistoryStageInput = {
  id: string;
  title: string;
  description: string;
};

export function parseConstructionHistoryJson(raw: unknown): BuiltObjectHistoryStageInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: BuiltObjectHistoryStageInput[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const o = item as Record<string, unknown>;
    const title = String(o.title ?? "").trim();
    if (!title) continue;
    const id = String(o.id ?? `stage-${i + 1}`).trim() || `stage-${i + 1}`;
    const description = String(o.description ?? "").trim();
    out.push({ id, title, description });
  }
  return out.length ? out : null;
}

export function defaultHistoryStagesFromObject(object: BuiltObjectItem): BuiltObjectHistoryStageInput[] {
  return BUILT_OBJECT_HISTORY_SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    description: sectionDescription(object, section),
  }));
}

export function historyStagesForAdmin(initial: {
  constructionHistoryJson?: unknown;
  foundation?: string | null;
  walls?: string | null;
  roof?: string | null;
}): BuiltObjectHistoryStageInput[] {
  const custom = parseConstructionHistoryJson(initial.constructionHistoryJson);
  if (custom?.length) return custom;
  return BUILT_OBJECT_HISTORY_SECTIONS.map((section) => {
    const field = "textField" in section ? section.textField : undefined;
    let description = "";
    if (field === "foundation" && initial.foundation?.trim()) description = initial.foundation.trim();
    if (field === "walls" && initial.walls?.trim()) description = initial.walls.trim();
    if (field === "roof" && initial.roof?.trim()) description = initial.roof.trim();
    return { id: section.id, title: section.title, description };
  });
}

export function serializeConstructionHistory(stages: BuiltObjectHistoryStageInput[]) {
  return stages
    .map((s, i) => ({
      id: s.id.trim() || `stage-${i + 1}`,
      title: s.title.trim(),
      description: s.description.trim(),
    }))
    .filter((s) => s.title.length > 0);
}

const NAV_LABELS: Record<BuiltObjectNavSectionId, string> = {
  description: "Описание",
  plans: "Планировки",
  "construction-photos": "Фото строительства",
  history: "История строительства",
  video: "Видео",
};

export function houseTypeSubtitle(material: string): string {
  const label = material.trim() || "Дом";
  if (/дом$/i.test(label)) return label;
  if (/ный$/i.test(label)) return `${label} дом`;
  if (/блок|кирпич|бетон|каркас/i.test(label)) return `${label}ный дом`;
  return `${label}ный дом`;
}

export function formatFloorsLabel(floors: number | null | undefined): string | null {
  if (floors == null || !Number.isFinite(floors)) return null;
  if (floors === 1) return "1 этаж";
  if (floors === 1.5) return "1,5 этажа";
  if (floors === 2) return "2 этажа";
  return `${floors} этаж${floors > 1 ? "а" : ""}`;
}

export function formatImplementationDays(buildTerm: string | null | undefined): string | null {
  if (!buildTerm?.trim()) return null;
  const raw = buildTerm.trim();
  if (/месяц|месяца|месяцев|год|года|лет|недел/i.test(raw)) return null;
  if (/день|дня|дней/i.test(raw)) return raw;
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  const mod10 = n % 10;
  const mod100 = n % 100;
  let suffix = "дней";
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) suffix = "день";
    else if (mod10 >= 2 && mod10 <= 4) suffix = "дня";
  }
  return `${n} ${suffix}`;
}

function phaseMediaText(object: BuiltObjectItem, phaseKeys: readonly string[]): string {
  const parts: string[] = [];
  for (const key of phaseKeys) {
    for (const item of getBuiltObjectPhaseMedia(object, key)) {
      const t = item.label?.trim() || item.alt?.trim();
      if (t) parts.push(t);
    }
  }
  return parts.join(" ");
}

function sectionDescription(
  object: BuiltObjectItem,
  section: (typeof BUILT_OBJECT_HISTORY_SECTIONS)[number],
): string {
  const field = "textField" in section ? section.textField : undefined;
  if (field) {
    const fromField = object[field]?.trim();
    if (fromField) return fromField;
  }
  const fromMedia = phaseMediaText(object, section.phaseKeys);
  if (fromMedia) return fromMedia;
  return "";
}

function sectionImages(object: BuiltObjectItem, phaseKeys: readonly string[]): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const key of phaseKeys) {
    for (const item of getBuiltObjectPhaseMedia(object, key)) {
      const url = item.url?.trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      urls.push(url);
    }
  }
  return urls;
}

export function getBuiltObjectHistoryCards(object: BuiltObjectItem): BuiltObjectHistoryCard[] {
  const custom = parseConstructionHistoryJson(object.constructionHistoryJson);
  const stages = custom?.length ? custom : defaultHistoryStagesFromObject(object);
  return stages.map((stage, index) => {
    const section = BUILT_OBJECT_HISTORY_SECTIONS.find((s) => s.id === stage.id);
    const imageUrls = section ? sectionImages(object, section.phaseKeys) : [];
    return {
      id: stage.id || `stage-${index + 1}`,
      title: stage.title,
      description: stage.description,
      imageUrls,
    };
  });
}

/** Все фото хода стройки для сетки 5×5 (без рендеров и планировок). */
export function getBuiltObjectConstructionPhotos(object: BuiltObjectItem): ConstructionMedia[] {
  const items = object.media
    .filter((m) => m.type === "BUILD_STAGE")
    .sort((a, b) => a.order - b.order);
  if (items.length > 0) return items;
  return getBuiltObjectStages(object);
}

export function getBuiltObjectHeroImage(object: BuiltObjectItem): ConstructionMedia | null {
  return getBuiltObjectCover(object) ?? null;
}

export function getBuiltObjectPlansForPage(object: BuiltObjectItem) {
  return getBuiltObjectPlans(object);
}

export function getBuiltObjectVideos(object: BuiltObjectItem) {
  return object.media.filter((m) => m.type === "VIDEO").sort((a, b) => a.order - b.order);
}

export function builtObjectMapHref(object: BuiltObjectItem): string | null {
  const slug = object.slug?.trim();
  if (!slug) return null;
  return `/portfolio/map?object=${encodeURIComponent(slug)}`;
}

function resolveBuiltObjectArea(object: BuiltObjectItem): number | null {
  if (object.area != null && object.area > 0) return object.area;
  if (object.linkedProjectArea != null && object.linkedProjectArea > 0) return object.linkedProjectArea;
  return null;
}

function resolveBuiltObjectRooms(object: BuiltObjectItem): number | null {
  if (object.rooms != null && object.rooms > 0) return object.rooms;
  if (object.linkedProjectRooms != null && object.linkedProjectRooms > 0) return object.linkedProjectRooms;
  return null;
}

function resolveBuiltObjectBathrooms(object: BuiltObjectItem): number | null {
  if (object.bathrooms != null && object.bathrooms > 0) return object.bathrooms;
  if (object.linkedProjectBathrooms != null && object.linkedProjectBathrooms > 0) return object.linkedProjectBathrooms;
  return null;
}

function roomCountLabel(count: number, one: string, few: string, many: string): string {
  return `${count} ${count === 1 ? one : count < 5 ? few : many}`;
}

export function builtObjectCharacteristics(object: BuiltObjectItem) {
  const materialLabel = object.material?.trim() || null;
  const area = resolveBuiltObjectArea(object);
  const rooms = resolveBuiltObjectRooms(object);
  const bathrooms = resolveBuiltObjectBathrooms(object);

  return [
    area != null ? { label: "Площадь дома", value: `${area} м²` } : null,
    materialLabel ? { label: "Материал стен", value: materialLabel } : null,
    formatFloorsLabel(object.floors) ? { label: "Этажность", value: formatFloorsLabel(object.floors)! } : null,
    rooms != null ? { label: "Спальни", value: roomCountLabel(rooms, "спальня", "спальни", "спален") } : null,
    bathrooms != null
      ? { label: "Санузлы", value: roomCountLabel(bathrooms, "санузел", "санузла", "санузлов") }
      : null,
    formatImplementationDays(object.buildTerm)
      ? { label: "Реализация проекта", value: formatImplementationDays(object.buildTerm)! }
      : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row));
}

export function getBuiltObjectNavItems(object: BuiltObjectItem): BuiltObjectNavItem[] {
  const items: BuiltObjectNavItem[] = [
    { id: "description", label: NAV_LABELS.description },
    { id: "plans", label: NAV_LABELS.plans },
    { id: "construction-photos", label: NAV_LABELS["construction-photos"] },
    { id: "history", label: NAV_LABELS.history },
  ];
  if (getBuiltObjectVideos(object).length > 0) {
    items.push({ id: "video", label: NAV_LABELS.video });
  }
  return items;
}
