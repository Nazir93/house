import {
  builtObjectSectionDomId,
  type BuiltObjectNavItem,
  type BuiltObjectNavSectionId,
} from "@/lib/built-object-detail";

/** Блокировка scroll-spy на время программного скролла. */
export const BUILT_OBJECT_NAV_SCROLL_LOCK_MS = 1200;

/** План одного клика по пункту навигации карточки портфолио (ТЗ п.3). */
export function builtObjectNavScrollPlan(id: BuiltObjectNavSectionId) {
  const expandDescription = id === "description";
  return {
    id,
    sectionDomId: builtObjectSectionDomId(id),
    href: `#${builtObjectSectionDomId(id)}`,
    expandDescription,
    /** Описание раскрывается → ждём layout перед измерением Y. */
    deferScrollForLayout: expandDescription,
    lockMs: BUILT_OBJECT_NAV_SCROLL_LOCK_MS,
  };
}

export function builtObjectNavItemsHaveUniqueTargets(items: BuiltObjectNavItem[]): boolean {
  const domIds = items.map((item) => builtObjectSectionDomId(item.id));
  return domIds.length > 0 && new Set(domIds).size === domIds.length;
}

export function isBuiltObjectNavScrollLocked(nowMs: number, untilMs: number): boolean {
  return nowMs < untilMs;
}

/**
 * Активный пункт меню: последний раздел, чей верх уже прошёл линию шапки.
 * Так подсветка не залипает на «Описание», пока видны несколько секций.
 */
export function resolveActiveNavSectionId<T extends string>(
  sections: ReadonlyArray<{ id: T; top: number }>,
  activationLinePx: number,
): T | null {
  if (!sections.length) return null;
  let active: T = sections[0]!.id;
  for (const section of sections) {
    if (section.top <= activationLinePx) active = section.id;
    else break;
  }
  return active;
}
