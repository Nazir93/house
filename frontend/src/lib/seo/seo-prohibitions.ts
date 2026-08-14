/**
 * Запреты ТЗ SEO §26 (и пересечение с §23 / §9 / §17 / §22).
 * Это не «фичи», а инварианты: не скрывать текст, не плодить GEO, не фейки в Schema и т.д.
 */

import { assertGeneralContractorHasNoFakes } from "@/lib/seo/general-contractor-json-ld";
import { resolveProjectsCatalogFilterSeoAction } from "@/lib/seo/projects-catalog-filter-indexing";
import {
  isProtectedIndexedPath,
  urlChangeHasRequiredPermanentRedirect,
} from "@/lib/seo/indexed-url-stability";
import type { RedirectMap } from "@/lib/seo/redirect-map";

export type SeoProhibitionId =
  | "hidden_seo_text"
  | "white_on_white"
  | "mass_geo_pages"
  | "duplicate_seo_bodies"
  | "comma_keyword_lists"
  | "multiple_h1"
  | "index_all_filters"
  | "rename_indexed_url_without_301"
  | "fake_schema_reviews";

export type SeoProhibition = {
  id: SeoProhibitionId;
  title: string;
  /** Как уже закрыто в коде / политике. */
  enforcedBy: string;
};

/** Чеклист «что НЕ делать» из ТЗ. */
export const SEO_PROHIBITIONS: readonly SeoProhibition[] = [
  {
    id: "hidden_seo_text",
    title: "Не вставлять скрытый SEO-текст",
    enforcedBy: "Контент в видимых блоках; progressive disclosure — hidden в DOM, не off-screen keyword dump (`ssr-seo-html.ts`)",
  },
  {
    id: "white_on_white",
    title: "Не делать белый текст на белом фоне",
    enforcedBy: "Токены темы `--text` / `--bg`; запрет классов/стилей маскировки SEO",
  },
  {
    id: "mass_geo_pages",
    title: "Не генерировать автоматически десятки почти одинаковых GEO-страниц",
    enforcedBy: "Нет фабрики city-landing; каноны только хабы/материалы/услуги (`indexed-url-stability`, §23)",
  },
  {
    id: "duplicate_seo_bodies",
    title: "Не повторять один и тот же SEO-текст на разных страницах",
    enforcedBy: "Аудит уникальности длинных SEO-блоков в тестах §26",
  },
  {
    id: "comma_keyword_lists",
    title: "Не перечислять ключи через запятую",
    enforcedBy: "Видимые intro/H1/SEO-абзацы — предложения; meta keywords отдельно",
  },
  {
    id: "multiple_h1",
    title: "Не ставить несколько H1 ради SEO",
    enforcedBy: "Один H1 на индексируемую страницу (`MAX_H1_PER_INDEXABLE_PAGE`)",
  },
  {
    id: "index_all_filters",
    title: "Не индексировать все комбинации фильтров",
    enforcedBy: "`projects-catalog-filter-indexing.ts` → noindex + canonical на хаб",
  },
  {
    id: "rename_indexed_url_without_301",
    title: "Не менять существующие индексируемые URL без 301",
    enforcedBy: "`indexed-url-stability.ts` + permanent redirect map",
  },
  {
    id: "fake_schema_reviews",
    title: "Не добавлять искусственные отзывы или рейтинг в Schema",
    enforcedBy: "`general-contractor-json-ld.ts` / `assertGeneralContractorHasNoFakes`",
  },
] as const;

/** Ровно один H1 на индексируемой странице. */
export const MAX_H1_PER_INDEXABLE_PAGE = 1;

/** Массовые GEO-посадочные запрещены (ноль автогенерации). */
export const MAX_AUTO_GEO_LANDING_PAGES = 0;

/** Подозрительные маркеры скрытого/маскированного SEO в className/style. */
export const FORBIDDEN_SEO_MASKING_MARKERS = [
  "seo-hidden",
  "seo-text-hidden",
  "keyword-dump",
  "text-transparent",
  "opacity-0",
  "left-[-9999",
  "left:-9999",
  "-9999px",
] as const;

const MASS_GEO_PATH_RE =
  /^\/(?:geo|gorod|city|cities|regiony|regions)(?:\/|$)/i;

/** Явные city-slugs не заводим как индексируемые лендинги. */
const FORBIDDEN_CITY_LANDING_SLUGS = new Set([
  "vsevolozhsk",
  "pushkin",
  "kolpino",
  "gatchina",
  "vyborg",
  "tosno",
  "kirishi",
  "luga",
]);

export function listSeoProhibitionIds(): SeoProhibitionId[] {
  return SEO_PROHIBITIONS.map((p) => p.id);
}

/**
 * Видимый текст похож на «ключ1, ключ2, ключ3, ключ4» без нормальных предложений.
 * Meta keywords (массив в коде) сюда не передаём.
 */
export function looksLikeCommaSeparatedKeywordList(text: string): boolean {
  const raw = text.trim();
  if (!raw || raw.includes(".")) return false;
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 4) return false;
  const shortParts = parts.filter((p) => p.split(/\s+/).length <= 6);
  return shortParts.length >= Math.ceil(parts.length * 0.75);
}

export function tokenizeForSeoSimilarity(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^a-zа-я0-9]+/i)
    .filter((t) => t.length >= 4);
  return new Set(tokens);
}

/** Доля пересечения токенов (Jaccard). 1 = одинаковый набор слов. */
export function seoTextSimilarityRatio(a: string, b: string): number {
  const A = tokenizeForSeoSimilarity(a);
  const B = tokenizeForSeoSimilarity(b);
  if (A.size === 0 && B.size === 0) return 1;
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Порог «почти одинаковый» SEO-текст на разных страницах. */
export const SEO_BODY_NEAR_DUPLICATE_THRESHOLD = 0.82;

export function seoBodiesAreNearDuplicates(a: string, b: string, threshold = SEO_BODY_NEAR_DUPLICATE_THRESHOLD): boolean {
  if (a.trim().length < 120 || b.trim().length < 120) return false;
  return seoTextSimilarityRatio(a, b) >= threshold;
}

export function findNearDuplicateSeoBodyPairs(
  bodies: ReadonlyArray<{ id: string; text: string }>,
  threshold = SEO_BODY_NEAR_DUPLICATE_THRESHOLD,
): Array<{ a: string; b: string; ratio: number }> {
  const hits: Array<{ a: string; b: string; ratio: number }> = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const left = bodies[i]!;
      const right = bodies[j]!;
      if (!seoBodiesAreNearDuplicates(left.text, right.text, threshold)) continue;
      hits.push({
        a: left.id,
        b: right.id,
        ratio: seoTextSimilarityRatio(left.text, right.text),
      });
    }
  }
  return hits;
}

export function classOrStyleLooksLikeSeoMasking(value: string): boolean {
  const v = value.toLowerCase();
  return FORBIDDEN_SEO_MASKING_MARKERS.some((m) => v.includes(m.toLowerCase()));
}

export function isForbiddenMassGeoLandingPath(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/+$/, "") || "/";
  if (path === "/") return false;
  if (MASS_GEO_PATH_RE.test(path)) return true;
  const seg = path.replace(/^\//, "").split("/")[0]?.toLowerCase() ?? "";
  return FORBIDDEN_CITY_LANDING_SLUGS.has(seg);
}

export function filterComboIndexingAllowed(sp: Record<string, string | string[] | undefined>): boolean {
  return !resolveProjectsCatalogFilterSeoAction(sp, "/projects").noindex;
}

export function indexedUrlRenameAllowed(
  oldPath: string,
  newPath: string,
  map: RedirectMap,
): boolean {
  if (!isProtectedIndexedPath(oldPath)) return true;
  return urlChangeHasRequiredPermanentRedirect(oldPath, newPath, map);
}

export function schemaHasFakeReviewsOrRating(schema: Record<string, unknown>): boolean {
  return assertGeneralContractorHasNoFakes(schema).length > 0;
}
