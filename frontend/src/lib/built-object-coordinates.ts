import { normalizeRussiaMapCoordinates } from "@/lib/map-tiles";

function parseNum(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const parsed = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

/** Нормализует широту/долготу при сохранении объекта (в т.ч. если перепутали местами). */
export function builtObjectCoordinatesFromBody(body: {
  latitude?: unknown;
  longitude?: unknown;
}): { latitude: number | null; longitude: number | null } | null {
  if (body.latitude === undefined && body.longitude === undefined) return null;
  const lat = body.latitude !== undefined ? parseNum(body.latitude) : null;
  const lon = body.longitude !== undefined ? parseNum(body.longitude) : null;
  if (lat == null && lon == null) return { latitude: null, longitude: null };
  const norm = normalizeRussiaMapCoordinates(lat, lon);
  return { latitude: norm.latitude, longitude: norm.longitude };
}
