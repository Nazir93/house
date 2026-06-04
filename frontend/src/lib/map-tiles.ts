/** Центр по умолчанию — СПб и ЛО. */
export const DEFAULT_MAP_CENTER: [number, number] = [59.93, 30.35];
export const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY?.trim() ?? "";
export const YANDEX_MAPS_API_LANG = "ru_RU";

/** Старые тайлы остаются для админского выбора координат. Публичная карта объектов работает через JS API Яндекса. */
export const PORTFOLIO_MAP_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const PORTFOLIO_MAP_TILE_SUBDOMAINS = ["a", "b", "c"] as const;
export const PORTFOLIO_MAP_TILE_MAX_ZOOM = 19;
export const PORTFOLIO_MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer">OpenStreetMap</a>';

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

export function yandexMapsPointUrl(latitude: number, longitude: number, zoom = 10): string {
  const ll = `${longitude},${latitude}`;
  return `https://yandex.ru/maps/?ll=${encodeURIComponent(ll)}&z=${zoom}&pt=${encodeURIComponent(`${ll},pm2grm`)}`;
}
