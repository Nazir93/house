export type PageSkeletonVariant = "home" | "content" | "catalog" | "detail";

/** Нормализует pathname для сопоставления с вариантом скелетона. */
export function normalizePageSkeletonPath(pathname: string): string {
  const trimmed = pathname.trim();
  if (!trimmed || trimmed === "/") return "/";
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/+$/, "") || "/";
}

/**
 * Выбирает вариант скелетона по URL.
 * Используется в тестах и при необходимости на клиенте.
 */
export function resolvePageSkeletonVariant(pathname: string): PageSkeletonVariant {
  const path = normalizePageSkeletonPath(pathname);

  if (path === "/") return "home";

  if (path === "/projects" || path === "/portfolio" || path === "/blog" || path === "/services") {
    return "catalog";
  }

  if (
    /^\/projects\/[^/]+$/.test(path) ||
    /^\/portfolio\/[^/]+$/.test(path) ||
    /^\/blog\/[^/]+$/.test(path) ||
    /^\/services\/[^/]+$/.test(path)
  ) {
    return "detail";
  }

  return "content";
}
