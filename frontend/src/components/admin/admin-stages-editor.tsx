"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { StageIcon } from "@/components/account/stage-icon";
import { AdminSelect } from "@/components/admin/admin-select";
import {
  createAdminStageRow,
  removeAdminStageWithChildren,
  type AdminStageRow,
} from "@/lib/admin-client-stage-rows";
import { ADMIN_STAGE_ICON_SELECT_OPTIONS } from "@/lib/client-stage-icon-assets";
import { CLIENT_STAGE_STATUS_OPTIONS } from "@/lib/client-stage-status";
import { cn } from "@/lib/utils";

const inp =
  "w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#0F3D2E]";

const selectTrigger =
  "rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#0F3D2E]";

const labelCls = "block text-[10px] uppercase tracking-wide text-white/40 mb-0.5";

type AdminStagesEditorProps = {
  stages: AdminStageRow[];
  onChange: (stages: AdminStageRow[]) => void;
  progressHint?: string;
};

function topLevelEntries(stages: AdminStageRow[]): { index: number; row: AdminStageRow }[] {
  return stages
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !row.parentClientKey)
    .sort((a, b) => a.row.order - b.row.order);
}

function subStageEntries(
  stages: AdminStageRow[],
  parentClientKey: string
): { index: number; row: AdminStageRow }[] {
  return stages
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.parentClientKey === parentClientKey)
    .sort((a, b) => a.row.order - b.row.order);
}

function resolveIconSelectValue(iconKey: string): string {
  return ADMIN_STAGE_ICON_SELECT_OPTIONS.some((o) => o.value === iconKey) ? iconKey : "foundation";
}

/** Компактные карточки этапов (сетка 2 колонки) с подэтапами внутри родителя. */
export function AdminStagesEditor({ stages, onChange, progressHint }: AdminStagesEditorProps) {
  const topLevels = topLevelEntries(stages);

  function patchRow(index: number, patch: Partial<AdminStageRow>) {
    onChange(stages.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div className="space-y-3">
      {progressHint ? <p className="text-xs text-white/40">{progressHint}</p> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topLevels.map(({ index, row }) => {
          const subs = subStageEntries(stages, row.clientKey);
          const hasSubs = subs.length > 0;

          return (
            <article
              key={row.clientKey}
              className="relative flex flex-col gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    className={cn(inp, "w-11 shrink-0 tabular-nums text-center px-1")}
                    type="number"
                    min={0}
                    value={row.order}
                    onChange={(e) => patchRow(index, { order: parseInt(e.target.value, 10) || 0 })}
                    aria-label="Порядок этапа"
                  />
                  <StageIcon iconKey={row.iconKey} className="h-7 w-7 shrink-0" colored />
                </div>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-red-400/80 hover:bg-red-500/10 shrink-0"
                  onClick={() => onChange(removeAdminStageWithChildren(stages, index))}
                  aria-label="Удалить этап"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div>
                <label className={labelCls}>Название</label>
                <input
                  className={inp}
                  value={row.title}
                  onChange={(e) => patchRow(index, { title: e.target.value })}
                  placeholder="Название этапа"
                />
              </div>

              <div>
                <label className={labelCls}>Код / slug</label>
                <AdminSelect
                  className="w-full"
                  triggerClassName={selectTrigger + " font-mono text-xs"}
                  value={resolveIconSelectValue(row.iconKey)}
                  onValueChange={(iconKey) => patchRow(index, { iconKey })}
                  options={ADMIN_STAGE_ICON_SELECT_OPTIONS}
                />
              </div>

              <div>
                <label className={labelCls}>Статус</label>
                <AdminSelect
                  className="w-full"
                  triggerClassName={selectTrigger}
                  value={row.status}
                  onValueChange={(status) => patchRow(index, { status })}
                  options={CLIENT_STAGE_STATUS_OPTIONS}
                />
              </div>

              {hasSubs ? (
                <div className="mt-1 pt-2 border-t border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-white/50">
                    <span>Подэтапы</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400/90">
                      <Check size={12} aria-hidden />
                      {subs.length}
                    </span>
                  </div>
                  <ul className="space-y-1.5 list-none p-0 m-0">
                    {subs.map(({ index: subIndex, row: sub }) => (
                      <li
                        key={sub.clientKey}
                        className="rounded-lg border border-white/[0.06] bg-black/10 p-2 space-y-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <input
                            className={cn(inp, "w-9 shrink-0 tabular-nums text-center px-1 text-xs")}
                            type="number"
                            min={0}
                            value={sub.order}
                            onChange={(e) =>
                              patchRow(subIndex, { order: parseInt(e.target.value, 10) || 0 })
                            }
                            aria-label="Порядок подэтапа"
                          />
                          <input
                            className={cn(inp, "flex-1 min-w-0 text-xs py-1")}
                            value={sub.title}
                            onChange={(e) => patchRow(subIndex, { title: e.target.value })}
                            placeholder="Подэтап"
                          />
                          <button
                            type="button"
                            className="p-1 text-red-400/70 hover:text-red-300 shrink-0"
                            onClick={() => onChange(removeAdminStageWithChildren(stages, subIndex))}
                            aria-label="Удалить подэтап"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <AdminSelect
                          className="w-full"
                          triggerClassName={selectTrigger + " text-xs py-1"}
                          value={sub.status}
                          onValueChange={(status) => patchRow(subIndex, { status })}
                          options={CLIENT_STAGE_STATUS_OPTIONS}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  onChange([
                    ...stages,
                    createAdminStageRow({
                      title: "",
                      parentClientKey: row.clientKey,
                      order: subs.length,
                      iconKey: "electric",
                    }),
                  ]);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400/90 hover:text-emerald-300 mt-auto pt-1"
              >
                <Plus size={13} /> Подэтап
              </button>
            </article>
          );
        })}
      </div>

      {topLevels.length === 0 ? (
        <p className="text-sm text-white/40 py-4 text-center">
          Нет этапов. Нажмите «Этап» в заголовке блока.
        </p>
      ) : null}
    </div>
  );
}
