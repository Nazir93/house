import { OFFICE_GEO_LAT, OFFICE_GEO_LON } from "@/lib/constants";

/** ID карты из конструктора Яндекс.Карт (um=constructor:…). */
export const YANDEX_OFFICE_MAP_CONSTRUCTOR_ID =
  process.env.NEXT_PUBLIC_YANDEX_OFFICE_MAP_CONSTRUCTOR_ID?.trim() ||
  "d593a8746c275d580b8b91acec05d7045bbf3683b30195b4f7470a34648fb12f";

export type OfficeMetroDirection = {
  name: string;
  line: string;
  walkingMinutes: number;
  distanceMeters: number;
  geoLat: number;
  geoLon: number;
};

/** Ближайшие станции метро до офиса на ул. Ординарной, 18. */
export const OFFICE_METRO_DIRECTIONS: OfficeMetroDirection[] = [
  {
    name: "Петроградская",
    line: "Кировско-Выборгская (1)",
    walkingMinutes: 7,
    distanceMeters: 450,
    geoLat: 59.966389,
    geoLon: 30.311389,
  },
  {
    name: "Чкаловская",
    line: "Лахтинско-Правобережная (4)",
    walkingMinutes: 14,
    distanceMeters: 1000,
    geoLat: 59.960833,
    geoLon: 30.291667,
  },
];

/** Встроенный виджет: конструктор с маршрутами и метро или простая метка. */
export function getYandexOfficeMapEmbedUrl(): string {
  const constructorId = YANDEX_OFFICE_MAP_CONSTRUCTOR_ID;
  if (constructorId) {
    return `https://yandex.ru/map-widget/v1/?um=constructor%3A${encodeURIComponent(constructorId)}&source=constructor`;
  }
  const lon = OFFICE_GEO_LON;
  const lat = OFFICE_GEO_LAT;
  const ll = `${lon}%2C${lat}`;
  return `https://yandex.ru/map-widget/v1/?ll=${ll}&z=17&l=map&pt=${lon},${lat},pm2rdm`;
}

/** Открыть офис на полной карте Яндекса. */
export function getYandexOfficeMapLinkUrl(): string {
  const lon = OFFICE_GEO_LON;
  const lat = OFFICE_GEO_LAT;
  return `https://yandex.ru/maps/?pt=${lon}%2C${lat}&z=17&l=map`;
}

/** Пеший маршрут от станции метро до офиса в Яндекс.Картах. */
export function getYandexOfficePedestrianRouteUrl(metro: OfficeMetroDirection): string {
  const from = `${metro.geoLat},${metro.geoLon}`;
  const to = `${OFFICE_GEO_LAT},${OFFICE_GEO_LON}`;
  return `https://yandex.ru/maps/?rtext=${from}~${to}&rtt=pd`;
}

export function formatOfficeMetroWalkingLabel(metro: OfficeMetroDirection): string {
  return `${metro.name} · ~${metro.walkingMinutes} мин пешком · ${metro.distanceMeters} м`;
}
