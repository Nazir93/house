import {
  builtObjectMaterialLabel,
  type BuiltObjectItem,
} from "@/lib/construction-shared";
import { resolveBuiltObjectArea } from "@/lib/built-object-detail";
import { builtObjectSiteStatusLabel } from "@/lib/built-object-site-status";
import { formatFloorFilterLabel } from "@/lib/portfolio-filter-options";

/**
 * Блок «построенные дома» на главной (ТЗ SEO §5).
 * Данные — те же BuiltObject из `/portfolio`, без дублей карточек.
 */

export const HOME_BUILT_HOMES_H2 =
  "Построенные дома в Санкт-Петербурге и Ленинградской области";

/** Минимум объектов на главной по ТЗ. */
export const HOME_BUILT_HOMES_MIN = 6;

/** Сколько объектов берём в превью (не меньше минимума ТЗ). */
export const HOME_BUILT_HOMES_PREVIEW_COUNT = HOME_BUILT_HOMES_MIN;

export const HOME_BUILT_HOMES_VIEW_ALL_LABEL = "Все построенные дома";
export const HOME_BUILT_HOMES_VIEW_ALL_HREF = "/portfolio";

/**
 * Населённый пункт / КП для карточки.
 * Из `location` берём самый конкретный сегмент после запятой.
 */
export function homeBuiltObjectPlaceLabel(
  location: string | null | undefined,
  title: string,
): string {
  const loc = location?.trim();
  if (!loc) {
    const t = title.trim();
    return t || "Объект";
  }
  const parts = loc
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || loc;
}

/** Строка фактов: «Газобетон • 186 м² • 2 этажа». */
export function homeBuiltObjectFactsLine(object: BuiltObjectItem): string {
  const parts: string[] = [];
  const material = builtObjectMaterialLabel(object.material ?? "").trim();
  if (material) parts.push(material);

  const area = resolveBuiltObjectArea(object);
  if (area != null && area > 0) parts.push(`${area} м²`);

  if (object.floors != null && Number.isFinite(object.floors) && object.floors > 0) {
    parts.push(formatFloorFilterLabel(object.floors));
  }

  return parts.join(" • ");
}

export type HomeBuiltHomesCard = {
  id: string;
  slug: string;
  href: `/portfolio/${string}`;
  place: string;
  facts: string;
  status: string;
  title: string;
};

export function mapBuiltObjectToHomeCard(object: BuiltObjectItem): HomeBuiltHomesCard {
  const slug = object.slug.trim();
  return {
    id: object.id,
    slug,
    href: `/portfolio/${slug}`,
    place: homeBuiltObjectPlaceLabel(object.location, object.title),
    facts: homeBuiltObjectFactsLine(object),
    status: builtObjectSiteStatusLabel(object.siteStatus),
    title: object.title,
  };
}

/**
 * Превью для главной: сначала сданные, при нехватке до лимита — строящиеся.
 * Только реальные объекты каталога.
 */
export function pickHomeBuiltPortfolioPreview<T extends BuiltObjectItem>(
  objects: T[],
  limit: number = HOME_BUILT_HOMES_PREVIEW_COUNT,
): T[] {
  const completed = objects.filter((o) => (o.siteStatus ?? "COMPLETED") !== "UNDER_CONSTRUCTION");
  if (completed.length >= limit) return completed.slice(0, limit);

  const building = objects.filter((o) => o.siteStatus === "UNDER_CONSTRUCTION");
  const out = [...completed];
  const seen = new Set(out.map((o) => o.id));
  for (const object of building) {
    if (out.length >= limit) break;
    if (seen.has(object.id)) continue;
    seen.add(object.id);
    out.push(object);
  }
  return out;
}
