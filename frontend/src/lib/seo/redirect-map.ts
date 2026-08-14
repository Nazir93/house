import { PROJECTS_CATALOG_FILTER_QUERY_KEYS } from "@/lib/seo/projects-catalog-filter-indexing";

export type RedirectEntry = {
  toPath: string;
  permanent: boolean;
};

export type RedirectMap = Record<string, RedirectEntry>;

/**
 * Старые URL материалов из ТЗ → живые каноны (ТЗ SEO §11–12 / §21).
 * Без промежуточных хопов.
 */
export const SEO_LEGACY_PATH_REDIRECTS: ReadonlyArray<{
  fromPath: string;
  toPath: string;
  permanent: boolean;
}> = [
  {
    fromPath: "/stroitelstvo-domov-iz-gazobetona",
    toPath: "/projects/gazobeton",
    permanent: true,
  },
  {
    fromPath: "/stroitelstvo-domov-iz-kirpicha",
    toPath: "/projects/kirpich",
    permanent: true,
  },
  {
    fromPath: "/stroitelstvo-domov-iz-keramobloka",
    toPath: "/projects/keramoblok",
    permanent: true,
  },
];

/** Нормализует путь для поиска в карте редиректов. */
export function normalizeRedirectPath(pathname: string): string {
  if (!pathname.startsWith("/")) return `/${pathname}`;
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

/** Собирает карту из строк БД (+ опционально legacy SEO). */
export function buildRedirectMap(
  rows: Array<{ fromPath: string; toPath: string; permanent: boolean }>,
  opts?: { includeSeoLegacy?: boolean },
): RedirectMap {
  const map: RedirectMap = {};
  const source =
    opts?.includeSeoLegacy === false
      ? rows
      : [...SEO_LEGACY_PATH_REDIRECTS, ...rows];

  for (const row of source) {
    const from = normalizeRedirectPath(row.fromPath);
    // БД перекрывает legacy при конфликте fromPath.
    map[from] = {
      toPath: normalizeRedirectPath(row.toPath),
      permanent: row.permanent,
    };
  }
  return map;
}

/** Ищет редирект по точному пути (один hop). */
export function lookupRedirect(map: RedirectMap, pathname: string): RedirectEntry | null {
  const key = normalizeRedirectPath(pathname);
  return map[key] ?? null;
}

/**
 * Резолвит цепочку A→B→C в один hop A→C (ТЗ SEO §21).
 * Циклы обрываются; permanent = true только если все hops permanent.
 */
export function lookupRedirectResolved(
  map: RedirectMap,
  pathname: string,
  maxHops = 8,
): RedirectEntry | null {
  const start = normalizeRedirectPath(pathname);
  const first = map[start];
  if (!first) return null;

  let toPath = normalizeRedirectPath(first.toPath);
  let permanent = first.permanent;
  const seen = new Set<string>([start]);

  for (let hop = 0; hop < maxHops; hop++) {
    if (seen.has(toPath)) {
      // цикл — отдаём последний безопасный целевой путь до петли
      break;
    }
    seen.add(toPath);
    const next = map[toPath];
    if (!next) break;
    permanent = permanent && next.permanent;
    toPath = normalizeRedirectPath(next.toPath);
  }

  if (toPath === start) return null;
  return { toPath, permanent };
}

/** Есть ли в карте цепочки длиннее 1 hop (для тестов / аудита админки). */
export function listRedirectChainSources(map: RedirectMap): string[] {
  const out: string[] = [];
  for (const from of Object.keys(map)) {
    const one = map[from];
    if (!one) continue;
    if (map[normalizeRedirectPath(one.toPath)]) {
      out.push(from);
    }
  }
  return out.sort();
}

/**
 * Middleware: только `?material=` SEO на `/projects` → ЧПУ одним 308.
 * Иначе не трогаем query (Clean-param / noindex на странице).
 */
export function resolveProjectsMaterialQueryRedirect(
  pathname: string,
  searchParams: URLSearchParams,
): string | null {
  if (normalizeRedirectPath(pathname) !== "/projects") return null;

  const present = PROJECTS_CATALOG_FILTER_QUERY_KEYS.filter((key) => {
    const v = searchParams.get(key);
    return v != null && String(v).trim() !== "";
  });
  if (present.length !== 1 || present[0] !== "material") return null;

  const raw = (searchParams.get("material") || "").trim().toLowerCase();
  if (raw === "gazobeton" || raw === "gasobeton") return "/projects/gazobeton";
  if (raw === "kirpich" || raw === "brick") return "/projects/kirpich";
  if (raw === "keramoblok" || raw === "ceramoblok") return "/projects/keramoblok";
  return null;
}
