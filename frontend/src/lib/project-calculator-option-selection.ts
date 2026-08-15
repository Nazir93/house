const EXCLUSIVE_CONSTRUCTION_GROUPS = [
  ["roof_folding", "roof_soft"],
  ["roof_insulation_200", "roof_insulation_250"],
] as const;

function exclusiveGroupForSlug(slug: string): readonly string[] | null {
  for (const group of EXCLUSIVE_CONSTRUCTION_GROUPS) {
    if ((group as readonly string[]).includes(slug)) return group;
  }
  return null;
}

export function toggleConstructionOptionSelection(
  current: Iterable<string>,
  slug: string
): Set<string> {
  const next = new Set(current);

  if (next.has(slug)) {
    next.delete(slug);
    return next;
  }

  const group = exclusiveGroupForSlug(slug);
  if (group) {
    for (const other of group) {
      if (other !== slug) next.delete(other);
    }
  }

  next.add(slug);
  return next;
}

/** Нормализует сохранённый/устаревший набор: в каждой группе остаётся не более одной опции. */
export function sanitizeConstructionOptionSelection(current: Iterable<string>): string[] {
  let next = new Set<string>();
  for (const slug of current) {
    const s = String(slug).trim();
    if (!s) continue;
    next = toggleConstructionOptionSelection(next, s);
  }
  return [...next];
}

/**
 * При включении галочки опции автоматически раскрываем блок
 * с картинкой и описанием (если есть что показать).
 */
export function shouldAutoExpandCalculatorOptionDetail(params: {
  checked: boolean;
  hasDetail: boolean;
}): boolean {
  return params.checked && params.hasDetail;
}
