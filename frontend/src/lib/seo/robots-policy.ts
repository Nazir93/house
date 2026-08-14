import { SITE_URL } from "@/lib/constants";
import { PROJECTS_CATALOG_FILTER_QUERY_KEYS } from "@/lib/seo/projects-catalog-filter-indexing";

/**
 * Политика robots.txt (ТЗ SEO §16).
 * Основные URL не закрываем. Параметры фильтров — Clean-param + canonical/noindex (§9),
 * а не Disallow (Яндекс: иначе хуже склейка дублей с каноном).
 */

/** Технические пути — единственный осмысленный Disallow. */
export const ROBOTS_TECHNICAL_DISALLOW = [
  "/admin/",
  "/api/",
  "/account/",
  "/spasibo",
  "/promo",
  "/lp/",
] as const;

/** Основные публичные префиксы — нельзя Disallow в robots. */
export const ROBOTS_PROTECTED_ALLOW_PREFIXES = [
  "/",
  "/projects",
  "/typical-projects",
  "/services",
  "/portfolio",
  "/calculator",
  "/blog",
  "/about",
  "/contacts",
  "/mortgage",
  "/reviews",
  "/team",
  "/individual-design",
  "/technology",
  "/partners",
] as const;

export function getProjectsCatalogCleanParamNames(): string {
  return PROJECTS_CATALOG_FILTER_QUERY_KEYS.join("&");
}

/** Директивы Clean-param для Яндекса по каталогам с GET-фильтрами. */
export function listProjectsCatalogCleanParamLines(): string[] {
  const params = getProjectsCatalogCleanParamNames();
  return [
    `Clean-param: ${params} /projects`,
    `Clean-param: ${params} /typical-projects`,
  ];
}

/**
 * Disallow параметрических дублей / основных URL — запрещён политикой §16.
 * Технические пути из ROBOTS_TECHNICAL_DISALLOW — ок.
 */
export function isForbiddenRobotsDisallowPath(path: string): boolean {
  const raw = path.trim();
  if (!raw) return true;

  for (const tech of ROBOTS_TECHNICAL_DISALLOW) {
    if (raw === tech || raw === tech.replace(/\/$/, "")) return false;
  }

  const lower = raw.toLowerCase();

  // Параметрические / wildcard-дубли каталога
  if (lower.includes("?") || lower.includes("*?")) return true;
  if (lower.includes("$") && lower.includes("?")) return true;
  for (const key of PROJECTS_CATALOG_FILTER_QUERY_KEYS) {
    if (lower.includes(key.toLowerCase()) && (lower.includes("*") || lower.includes("?"))) {
      return true;
    }
  }

  // Закрытие корня или коммерческих хабов
  if (raw === "/") return true;
  if (raw === "/*") return true;

  const pathOnly = raw.split("?")[0] || raw;
  for (const prefix of ROBOTS_PROTECTED_ALLOW_PREFIXES) {
    if (prefix === "/") continue;
    if (pathOnly === prefix || pathOnly === `${prefix}/` || pathOnly.startsWith(`${prefix}/`)) {
      // /projects/compare — технический UI, Disallow допустим
      if (pathOnly === "/projects/compare" || pathOnly.startsWith("/projects/compare/")) {
        return false;
      }
      return true;
    }
  }

  return false;
}

export function sanitizeRobotsDisallowPaths(paths: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const path of paths) {
    const trimmed = path.trim();
    if (!trimmed || isForbiddenRobotsDisallowPath(trimmed)) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export type BuildRobotsTxtOptions = {
  siteUrl?: string;
  /** Сырой robots из админки (без Host/Sitemap — подставим канон). */
  customRules?: string | null;
};

function parseCustomAgentBlocks(customRules: string): Array<{
  userAgent: string;
  allow: string[];
  disallow: string[];
}> {
  const lines = customRules.split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks: Array<{ userAgent: string; allow: string[]; disallow: string[] }> = [];
  let current = { userAgent: "*", allow: [] as string[], disallow: [] as string[] };

  const push = () => {
    if (current.allow.length || current.disallow.length || blocks.length === 0) {
      blocks.push(current);
    }
  };

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith("host:") || lower.startsWith("sitemap:") || lower.startsWith("clean-param:")) {
      continue;
    }
    if (lower.startsWith("user-agent:")) {
      if (current.allow.length || current.disallow.length) {
        push();
        current = { userAgent: "*", allow: [], disallow: [] };
      }
      current.userAgent = line.split(":").slice(1).join(":").trim() || "*";
      continue;
    }
    if (lower.startsWith("disallow:")) {
      current.disallow.push(line.split(":").slice(1).join(":").trim());
      continue;
    }
    if (lower.startsWith("allow:")) {
      current.allow.push(line.split(":").slice(1).join(":").trim());
    }
  }
  push();
  return blocks.length ? blocks : [{ userAgent: "*", allow: ["/"], disallow: [...ROBOTS_TECHNICAL_DISALLOW] }];
}

/** Полный текст robots.txt (канон Host/Sitemap + Clean-param). */
export function buildRobotsTxtBody(opts: BuildRobotsTxtOptions = {}): string {
  const siteUrl = (opts.siteUrl ?? SITE_URL).replace(/\/$/, "");
  const host = siteUrl.replace(/^https?:\/\//i, "");
  const custom = opts.customRules?.trim() || "";

  const lines: string[] = [];

  if (custom) {
    const blocks = parseCustomAgentBlocks(custom);
    for (const block of blocks) {
      lines.push(`User-Agent: ${block.userAgent || "*"}`);
      const allow = block.allow.length ? block.allow : ["/"];
      for (const a of allow) {
        if (a) lines.push(`Allow: ${a}`);
      }
      const disallow = sanitizeRobotsDisallowPaths(
        block.disallow.length ? block.disallow : [...ROBOTS_TECHNICAL_DISALLOW],
      );
      // Если админка вычистила всё опасное и ничего не осталось — вернём тех. минимум
      const finalDisallow = disallow.length ? disallow : [...ROBOTS_TECHNICAL_DISALLOW];
      for (const d of finalDisallow) {
        lines.push(`Disallow: ${d}`);
      }
      lines.push("");
    }
  } else {
    lines.push("User-Agent: *");
    lines.push("Allow: /");
    for (const d of ROBOTS_TECHNICAL_DISALLOW) {
      lines.push(`Disallow: ${d}`);
    }
    lines.push("");
  }

  lines.push(
    "# Фильтры каталога: не Disallow. Яндекс — Clean-param; страницы — canonical + noindex,follow (§9).",
  );
  for (const line of listProjectsCatalogCleanParamLines()) {
    lines.push(line);
  }
  lines.push("");
  lines.push(`Host: ${host}`);
  lines.push(`Sitemap: ${siteUrl}/sitemap.xml`);
  lines.push("");

  return lines.join("\n");
}

/** Disallow по умолчанию (для тестов / админ-placeholder). */
export function listDefaultRobotsDisallow(): string[] {
  return [...ROBOTS_TECHNICAL_DISALLOW];
}
