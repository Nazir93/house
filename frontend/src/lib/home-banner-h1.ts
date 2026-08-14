/**
 * H1 главной: SEO-текст из PageMeta / commercial SEO имеет приоритет
 * над marketing headlineLines баннера (ТЗ SEO §1.3).
 */
export function resolveHomeBannerH1(
  seoH1: string | null | undefined,
  bannerHeadlineLines: readonly string[],
): string {
  const fromSeo = (seoH1 ?? "").replace(/\s+/g, " ").trim();
  if (fromSeo) return fromSeo;
  return bannerHeadlineLines
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
