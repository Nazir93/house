"use client";

import { Plus, Trash2 } from "lucide-react";
import type { BuiltObjectHistoryStageInput } from "@/lib/built-object-detail";

const fieldLabel = "block text-xs font-medium text-white/45 mb-1";
const inputClass =
  "w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/30";

export function BuiltObjectHistoryEditor({
  stages,
  onChange,
}: {
  stages: BuiltObjectHistoryStageInput[];
  onChange: (stages: BuiltObjectHistoryStageInput[]) => void;
}) {
  function patch(index: number, partial: Partial<BuiltObjectHistoryStageInput>) {
    onChange(stages.map((s, i) => (i === index ? { ...s, ...partial } : s)));
  }

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => (
        <div
          key={`${stage.id}-${index}`}
          className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-300/90 tabular-nums">
              Этап {String(index + 1).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => onChange(stages.filter((_, i) => i !== index))}
              className="p-1.5 text-red-300/80 hover:text-red-200"
              aria-label="Удалить этап"
              disabled={stages.length <= 1}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <label className="block">
            <span className={fieldLabel}>Название</span>
            <input
              value={stage.title}
              onChange={(e) => patch(index, { title: e.target.value })}
              className={inputClass}
              placeholder="Фундамент"
            />
          </label>
          <label className="block">
            <span className={fieldLabel}>Описание</span>
            <textarea
              value={stage.description}
              onChange={(e) => patch(index, { description: e.target.value })}
              rows={4}
              className={`${inputClass} min-h-[88px] resize-y`}
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...stages,
            { id: `custom-${Date.now()}`, title: "", description: "" },
          ])
        }
        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300/90 hover:text-emerald-200"
      >
        <Plus size={14} />
        Добавить этап
      </button>
    </div>
  );
}
