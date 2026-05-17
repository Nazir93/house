export type AdminStageRow = {
  clientKey: string;
  parentClientKey: string | null;
  order: number;
  title: string;
  iconKey: string;
  status: string;
};

export function newAdminStageKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `stage-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createAdminStageRow(
  partial: Partial<AdminStageRow> & Pick<AdminStageRow, "title"> & { parentClientKey?: string | null }
): AdminStageRow {
  return {
    clientKey: partial.clientKey ?? newAdminStageKey(),
    parentClientKey: partial.parentClientKey ?? null,
    order: partial.order ?? 0,
    title: partial.title,
    iconKey: partial.iconKey ?? "circle",
    status: partial.status ?? "NOT_STARTED",
  };
}

/** Дерево этапов для отрисовки в админке (верхний уровень → подэтапы). */
export function orderedAdminStageIndices(rows: AdminStageRow[]): { index: number; depth: number }[] {
  const byParent = new Map<string | null, AdminStageRow[]>();
  const indexByKey = new Map(rows.map((r, i) => [r.clientKey, i]));

  for (const r of rows) {
    const list = byParent.get(r.parentClientKey) ?? [];
    list.push(r);
    byParent.set(r.parentClientKey, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.order - b.order);
  }

  const out: { index: number; depth: number }[] = [];
  const walk = (parentKey: string | null, depth: number) => {
    for (const r of byParent.get(parentKey) ?? []) {
      const index = indexByKey.get(r.clientKey);
      if (index === undefined) continue;
      out.push({ index, depth });
      walk(r.clientKey, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

export function removeAdminStageWithChildren(rows: AdminStageRow[], index: number): AdminStageRow[] {
  const key = rows[index]?.clientKey;
  if (!key) return rows;
  return rows.filter((r) => r.clientKey !== key && r.parentClientKey !== key);
}
