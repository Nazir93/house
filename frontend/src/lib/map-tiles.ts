/**
 * Подложка карты без API-ключей.
 * OpenStreetMap: в РФ названия улиц и населённых пунктов — на русском (данные OSM).
 * Яндекс.Карты в Leaflet официально требуют API-ключ; маркеры ставим сами по координатам.
 */
export const PORTFOLIO_MAP_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const PORTFOLIO_MAP_TILE_SUBDOMAINS = ["a", "b", "c"] as const;

export const PORTFOLIO_MAP_TILE_MAX_ZOOM = 19;

export const PORTFOLIO_MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer">OpenStreetMap</a>';

/** Центр по умолчанию — СПб и ЛО. */
export const DEFAULT_MAP_CENTER: [number, number] = [59.93, 30.35];

/** Если перепутали широту и долготу (в ссылках часто сначала lon). */
export function normalizeRussiaMapCoordinates(
  latitude: number | null,
  longitude: number | null
): { latitude: number | null; longitude: number | null; swapped: boolean } {
  if (latitude == null || longitude == null) {
    return { latitude, longitude, swapped: false };
  }
  const looksSwapped =
    latitude >= 19 && latitude <= 50 && longitude >= 50 && longitude <= 75;
  if (!looksSwapped) {
    return { latitude, longitude, swapped: false };
  }
  return { latitude: longitude, longitude: latitude, swapped: true };
}
