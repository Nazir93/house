const EXCLUSIVE_CONSTRUCTION_GROUPS = [
  ["roof_folding", "roof_soft"],
  ["roof_insulation_200", "roof_insulation_250"],
] as const;

export function toggleConstructionOptionSelection(
  current: Iterable<string>,
  slug: string
): Set<string> {
  const next = new Set(current);

  if (next.has(slug)) {
    next.delete(slug);
    return next;
  }

  for (const group of EXCLUSIVE_CONSTRUCTION_GROUPS) {
    if (group.includes(slug as never)) {
      for (const other of group) {
        if (other !== slug) next.delete(other);
      }
      break;
    }
  }

  next.add(slug);
  return next;
}
