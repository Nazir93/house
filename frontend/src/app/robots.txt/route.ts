import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { buildRobotsTxtBody } from "@/lib/seo/robots-policy";

export const revalidate = 300;

/**
 * Полный robots.txt текстом: Clean-param (Яндекс) не поддерживается MetadataRoute.Robots.
 * Политика — `robots-policy.ts` (ТЗ SEO §16).
 */
export async function GET() {
  let customRules = "";
  try {
    const setting = await prisma.siteSettings.findUnique({ where: { key: "robots_txt_custom" } });
    if (setting) customRules = setting.value;
  } catch {
    // DB unavailable — дефолтная политика
  }

  const body = buildRobotsTxtBody({
    siteUrl: SITE_URL,
    customRules,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
