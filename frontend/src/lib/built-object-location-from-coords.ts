import type { BuiltObjectMapRegionSlug } from "@/lib/built-object-map-taxonomy";
import { normalizeRussiaMapCoordinates } from "@/lib/map-tiles";

export type ResolvedBuiltObjectLocation = {
  regionSlug: BuiltObjectMapRegionSlug;
  district: string;
};

export type BuiltObjectLocationFieldPatch = {
  latitude: string;
  longitude: string;
  regionSlug: BuiltObjectMapRegionSlug;
  district: string;
};

type DistrictBBox = {
  slug: string;
  regionSlug: BuiltObjectMapRegionSlug;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
};

/** Приоритет сверху вниз — более узкие зоны раньше широких. Без внешних API. */
const DISTRICT_BBOXES: DistrictBBox[] = [
  { slug: "vyritsa", regionSlug: "lo", minLat: 59.32, maxLat: 59.52, minLon: 30.1, maxLon: 30.65 },
  { slug: "vyborg", regionSlug: "lo", minLat: 59.88, maxLat: 61.15, minLon: 27.0, maxLon: 29.75 },
  { slug: "priyutninskoe", regionSlug: "lo", minLat: 59.0, maxLat: 60.35, minLon: 28.5, maxLon: 30.0 },
  { slug: "gatchina", regionSlug: "lo", minLat: 58.88, maxLat: 59.72, minLon: 29.35, maxLon: 30.65 },
  { slug: "vsevolozhsk", regionSlug: "lo", minLat: 59.72, maxLat: 60.55, minLon: 30.35, maxLon: 34.0 },
  { slug: "ramenskoe", regionSlug: "mo", minLat: 55.35, maxLat: 55.75, minLon: 38.0, maxLon: 38.55 },
  { slug: "krasnogorsk", regionSlug: "mo", minLat: 55.75, maxLat: 56.05, minLon: 37.0, maxLon: 37.55 },
  { slug: "novgorod_city", regionSlug: "vnovgorod", minLat: 58.3, maxLat: 58.85, minLon: 30.9, maxLon: 31.6 },
];

const DISTRICT_CENTERS: { slug: string; regionSlug: BuiltObjectMapRegionSlug; lat: number; lon: number }[] = [
  { slug: "vyritsa", regionSlug: "lo", lat: 59.407, lon: 30.346 },
  { slug: "gatchina", regionSlug: "lo", lat: 59.57, lon: 30.13 },
  { slug: "vyborg", regionSlug: "lo", lat: 60.713, lon: 28.753 },
  { slug: "vsevolozhsk", regionSlug: "lo", lat: 60.02, lon: 30.65 },
  { slug: "priyutninskoe", regionSlug: "lo", lat: 59.45, lon: 30.05 },
  { slug: "ramenskoe", regionSlug: "mo", lat: 55.567, lon: 38.23 },
  { slug: "krasnogorsk", regionSlug: "mo", lat: 55.831, lon: 37.329 },
  { slug: "other_mo", regionSlug: "mo", lat: 55.75, lon: 37.5 },
  { slug: "novgorod_city", regionSlug: "vnovgorod", lat: 58.521, lon: 31.271 },
];

export function parseCoordinate(value: string): number | null {
  const s = value.trim().replace(",", ".");
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export function formatCoordinate(n: number | null): string {
  if (n == null) return "";
  return String(Math.round(n * 1_000_000) / 1_000_000);
}

export function resolveRegionFromCoordinates(lat: number, lon: number): BuiltObjectMapRegionSlug {
  if (lat >= 54.3 && lat <= 56.9 && lon >= 35.0 && lon <= 40.5) return "mo";
  if (lat >= 58.2 && lat <= 59.0 && lon >= 30.5 && lon <= 32.0) return "vnovgorod";
  if (lat >= 58.5 && lat <= 61.2 && lon >= 27.0 && lon <= 35.5) return "lo";
  return "other";
}

function pointInBox(lat: number, lon: number, box: DistrictBBox): boolean {
  return lat >= box.minLat && lat <= box.maxLat && lon >= box.minLon && lon <= box.maxLon;
}

function nearestDistrictInRegion(lat: number, lon: number, regionSlug: BuiltObjectMapRegionSlug): string {
  let bestSlug = "";
  let bestDist = Number.POSITIVE_INFINITY;

  for (const center of DISTRICT_CENTERS) {
    if (center.regionSlug !== regionSlug) continue;
    const dLat = lat - center.lat;
    const dLon = lon - center.lon;
    const dist = dLat * dLat + dLon * dLon;
    if (dist < bestDist) {
      bestDist = dist;
      bestSlug = center.slug;
    }
  }

  return bestSlug;
}

export function resolveDistrictFromCoordinates(
  lat: number,
  lon: number,
  regionSlug: BuiltObjectMapRegionSlug,
): string {
  if (regionSlug === "other") return "";

  for (const box of DISTRICT_BBOXES) {
    if (box.regionSlug !== regionSlug) continue;
    if (pointInBox(lat, lon, box)) return box.slug;
  }

  return nearestDistrictInRegion(lat, lon, regionSlug);
}

export function resolveBuiltObjectLocationFromCoordinates(
  latitude: number | null,
  longitude: number | null,
): ResolvedBuiltObjectLocation | null {
  if (latitude == null || longitude == null) return null;

  const norm = normalizeRussiaMapCoordinates(latitude, longitude);
  if (norm.latitude == null || norm.longitude == null) return null;

  const regionSlug = resolveRegionFromCoordinates(norm.latitude, norm.longitude);
  const district = resolveDistrictFromCoordinates(norm.latitude, norm.longitude, regionSlug);

  return { regionSlug, district };
}

/** Патч полей формы админки портфолио после ввода/вставки координат (без внешних API). */
export function buildBuiltObjectLocationFieldsFromInputs(
  latitudeInput: string,
  longitudeInput: string,
): BuiltObjectLocationFieldPatch | null {
  const lat = parseCoordinate(latitudeInput);
  const lon = parseCoordinate(longitudeInput);
  if (lat == null || lon == null) return null;

  const resolved = resolveBuiltObjectLocationFromCoordinates(lat, lon);
  if (!resolved) return null;

  const norm = normalizeRussiaMapCoordinates(lat, lon);
  return {
    latitude: formatCoordinate(norm.latitude),
    longitude: formatCoordinate(norm.longitude),
    regionSlug: resolved.regionSlug,
    district: resolved.district,
  };
}
