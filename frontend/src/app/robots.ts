import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  let customRules = "";
  try {
    const setting = await prisma.siteSettings.findUnique({ where: { key: "robots_txt_custom" } });
    if (setting) customRules = setting.value;
  } catch {
    // DB unavailable
  }

  if (customRules) {
    const rules: MetadataRoute.Robots = {
      rules: [],
      host: SITE_URL.replace(/^https?:\/\//i, ""),
      sitemap: `${SITE_URL}/sitemap.xml`,
    };

    const lines = customRules.split("\n").map((l) => l.trim()).filter(Boolean);
    let currentAgent = "*";
    const allow: string[] = [];
    const disallow: string[] = [];

    for (const line of lines) {
      const lower = line.toLowerCase();
      // Host/Sitemap из админки игнорируем — всегда канон SITE_URL (chastdushi.ru)
      if (lower.startsWith("host:") || lower.startsWith("sitemap:")) continue;
      if (lower.startsWith("user-agent:")) {
        currentAgent = line.split(":")[1]?.trim() || "*";
      } else if (lower.startsWith("disallow:")) {
        disallow.push(line.split(":").slice(1).join(":").trim());
      } else if (lower.startsWith("allow:")) {
        allow.push(line.split(":").slice(1).join(":").trim());
      }
    }

    rules.rules = [{ userAgent: currentAgent, allow, disallow }];
    return rules;
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/spasibo", "/promo", "/lp/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL.replace(/^https?:\/\//i, ""),
  };
}
