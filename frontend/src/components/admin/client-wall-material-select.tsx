"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AdminSelect } from "@/components/admin/admin-select";
import {
  buildWallMaterialSelectOptions,
  normalizeWallMaterialLabel,
  persistCustomWallMaterial,
  readCustomWallMaterials,
} from "@/lib/client-project-wall-materials";

const footerInput =
  "min-w-0 flex-1 rounded-lg border border-white/[0.12] bg-white/[0.06] px-2.5 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#0F3D2E]/60";

const addRowBtn =
  "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-emerald-300/90 transition-colors hover:bg-[#0F3D2E]/18";

export function ClientWallMaterialSelect({
  value,
  onValueChange,
  triggerClassName,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  triggerClassName?: string;
  className?: string;
}) {
  const [customLabels, setCustomLabels] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setCustomLabels(readCustomWallMaterials());
  }, []);

  const options = useMemo(
    () => buildWallMaterialSelectOptions(value, customLabels),
    [value, customLabels]
  );

  const commitCustom = useCallback(() => {
    const next = normalizeWallMaterialLabel(draft);
    if (!next) {
      setAdding(false);
      setDraft("");
      return;
    }
    const merged = persistCustomWallMaterial(next);
    setCustomLabels(merged);
    onValueChange(next);
    setAdding(false);
    setDraft("");
  }, [draft, onValueChange]);

  const listFooter = adding ? (
    <div className="flex flex-wrap gap-2 p-2">
      <input
        className={footerInput}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Новый материал"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitCustom();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setAdding(false);
            setDraft("");
          }
        }}
      />
      <button
        type="button"
        className="shrink-0 rounded-lg bg-[#0F3D2E] px-3 py-2 text-xs font-semibold text-white"
        onClick={commitCustom}
      >
        OK
      </button>
      <button
        type="button"
        className="shrink-0 rounded-lg px-2 py-2 text-xs text-white/50 hover:text-white/80"
        onClick={() => {
          setAdding(false);
          setDraft("");
        }}
      >
        Отмена
      </button>
    </div>
  ) : (
    <button type="button" className={addRowBtn} onClick={() => setAdding(true)}>
      <Plus size={16} aria-hidden />
      Добавить материал
    </button>
  );

  return (
    <AdminSelect
      className={className}
      triggerClassName={triggerClassName}
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder="Выберите материал…"
      listFooter={listFooter}
    />
  );
}
