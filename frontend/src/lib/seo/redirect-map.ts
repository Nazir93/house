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
 * Раньше: только `?material=` на `/projects` → 308 на коммерческую ЧПУ.
 * Отключено: каталог с фильтром материала должен оставаться на `/projects?material=…`
 * (кнопка «Проекты домов» с главной / фильтр в каталоге). SEO-посадочные — отдельные `/projects/{материал}`.
 */
export function resolveProjectsMaterialQueryRedirect(
  _pathname: string,
  _searchParams: URLSearchParams,
): string | null {
  return null;
}
