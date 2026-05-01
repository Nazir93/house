/** Читает videoUrls из объекта Prisma/JSON без привязки к сгенерированным типам (после миграции поле есть в БД). */
export function readProjectVideoUrlsArray(row: unknown): string[] {
  if (!row || typeof row !== "object") return [];
  const raw = (row as Record<string, unknown>).videoUrls;
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
}

/** Объединяет массив видео и устаревшее поле videoUrl без дубликатов. */
export function mergeProjectVideoUrls(
  videoUrls: string[] | undefined | null,
  videoUrl: string | null | undefined
): string[] {
  const raw = [...(videoUrls ?? []), ...(videoUrl?.trim() ? [videoUrl.trim()] : [])];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of raw) {
    const s = u?.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export interface PortfolioCase {
  id: string;
  slug: string;
  title: string;
  tag: string;
  industry: string;
  type: string;
  year: string;
  area: string;
  location: string;
  /** Явный сниппет для поиска и соцсетей; если задан — в приоритете над обрезкой описания */
  seoDescription?: string | null;
  shortDescription: string;
  heroDescription: string;
  features: string[];
  goals: string;
  leftText1: string;
  rightText1: string;
  leftText2: string;
  rightText2: string;
  showcaseLabel1: string;
  showcaseLabel2: string;
  /** Фон больших полос на странице кейса (опционально) */
  showcaseImage1?: string | null;
  showcaseImage2?: string | null;
  videoUrl?: string | null;
  /** Несколько роликов в баннере (после фото) */
  videoUrls?: string[];
  /** Обложка и галерея (для баннера на странице кейса) */
  coverImage?: string | null;
  galleryUrls?: string[];
}

/** Статические кейсы электромонтажа сняты; актуальное портфолио — построенные объекты и каталог типовых домов. */
export const PORTFOLIO_CASES: PortfolioCase[] = [];

export function getCaseBySlug(slug: string): PortfolioCase | undefined {
  return PORTFOLIO_CASES.find((c) => c.slug === slug);
}

export function getAllCaseSlugs(): string[] {
  return PORTFOLIO_CASES.map((c) => c.slug);
}
