/** Бесплатная подложка (CARTO + OpenStreetMap), без API-ключей. */
export const PORTFOLIO_MAP_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

export const PORTFOLIO_MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

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
