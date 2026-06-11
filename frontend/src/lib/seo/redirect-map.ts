export type RedirectEntry = {
  toPath: string;
  permanent: boolean;
};

export type RedirectMap = Record<string, RedirectEntry>;

/** Нормализует путь для поиска в карте редиректов. */
export function normalizeRedirectPath(pathname: string): string {
  if (!pathname.startsWith("/")) return `/${pathname}`;
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

/** Ищет редирект по точному совпадению пути. */
export function lookupRedirect(map: RedirectMap, pathname: string): RedirectEntry | null {
  const key = normalizeRedirectPath(pathname);
  return map[key] ?? null;
}

/** Собирает карту из строк БД. */
export function buildRedirectMap(
  rows: Array<{ fromPath: string; toPath: string; permanent: boolean }>
): RedirectMap {
  const map: RedirectMap = {};
  for (const row of rows) {
    const from = normalizeRedirectPath(row.fromPath);
    map[from] = {
      toPath: normalizeRedirectPath(row.toPath),
      permanent: row.permanent,
    };
  }
  return map;
}
