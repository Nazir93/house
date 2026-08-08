"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileUp, Loader2, Plus, Trash2 } from "lucide-react";
import { AdminSelect } from "@/components/admin/admin-select";
import { CLIENT_PAYMENT_STATUS_OPTIONS } from "@/lib/client-payment-status";
import { movePaymentScheduleRow, reindexPaymentScheduleRows } from "@/lib/payment-schedule-order";

export type AdminPaymentRow = {
  order: number;
  label: string;
  amountRubles: number;
  dueDate: string;
  status: string;
  paidAt: string;
};

const inp =
  "w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#0F3D2E]";

const selectTrigger =
  "rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#0F3D2E]";

function createEmptyRow(order: number): AdminPaymentRow {
  return { order, label: "", amountRubles: 0, dueDate: "", status: "NOT_ISSUED", paidAt: "" };
}

const IMPORTED_PAYMENT_DEFAULTS = {
  dueDate: "",
  status: "NOT_ISSUED",
  paidAt: "",
} as const;

export function AdminPaymentsEditorTable({
  rows,
  onChange,
  headerActions,
  surfaceClass = "",
  onImportError,
  onImported,
}: {
  rows: AdminPaymentRow[];
  onChange: (rows: AdminPaymentRow[]) => void;
  headerActions?: ReactNode;
  surfaceClass?: string;
  onImportError?: (message: string) => void;
  onImported?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importModeRef = useRef<"replace" | "append">("replace");
  const [importing, setImporting] = useState(false);
  const [importNote, setImportNote] = useState<string | null>(null);

  const runImport = useCallback(
    async (file: File, mode: "replace" | "append") => {
      setImporting(true);
      setImportNote(null);
      const fd = new FormData();
      fd.set("file", file);
      try {
        const res = await fetch("/api/admin/payment-schedule-import", { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = typeof data?.error === "string" ? data.error : "Ошибка";
          onImportError?.(msg);
          return;
        }
        const rawRows = Array.isArray(data.rows) ? data.rows : [];
        const mapped: AdminPaymentRow[] = rawRows.map(
          (r: { label?: string; amountRubles?: number }, i: number) => ({
            order: i,
            label: typeof r.label === "string" && r.label.trim() ? r.label.trim() : "Платёж",
            amountRubles: typeof r.amountRubles === "number" ? r.amountRubles : 0,
            ...IMPORTED_PAYMENT_DEFAULTS,
          })
        );
        if (mapped.length === 0) {
          const msg =
            typeof data?.warnings?.[0] === "string" ? String(data.warnings[0]) : "Нет сумм";
          onImportError?.(msg);
          return;
        }
        if (mode === "replace") {
          onChange(mapped.map((r, i) => ({ ...r, order: i })));
        } else {
          onChange([...rows, ...mapped].map((r, i) => ({ ...r, order: i })));
        }
        onImported?.();
        const warns: unknown = data.warnings;
        if (Array.isArray(warns) && warns.length > 0) {
          const t = warns.filter((w) => typeof w === "string").join(" · ");
          if (t) setImportNote(t);
        }
      } catch {
        onImportError?.("Сеть");
      } finally {
        setImporting(false);
      }
    },
    [onChange, onImportError, onImported, rows]
  );

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      void runImport(file, importModeRef.current);
    },
    [runImport]
  );

  const pickImport = useCallback(
    (mode: "replace" | "append") => {
      importModeRef.current = mode;
      if (mode === "replace" && rows.length > 0) {
        if (
          !window.confirm(
            "Текущий график платежей будет полностью заменён строками из файла. Продолжить?"
          )
        ) {
          return;
        }
      }
      fileInputRef.current?.click();
    },
    [rows.length]
  );

  function commit(next: AdminPaymentRow[]) {
    onChange(reindexPaymentScheduleRows(next));
  }

  function patchRow(index: number, patch: Partial<AdminPaymentRow>) {
    commit(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    commit(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    commit([...rows, createEmptyRow(rows.length)]);
  }

  function moveRow(index: number, direction: -1 | 1) {
    commit(movePaymentScheduleRow(rows, index, direction));
  }

  return (
    <section
      className={`space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-shadow ${surfaceClass}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">График платежей</h2>
        <div className="flex items-center gap-2">
          {headerActions}
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <Plus size={14} /> Добавить строку
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.docx,.txt,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv"
        onChange={onFileChange}
      />
      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          disabled={importing}
          onClick={() => pickImport("replace")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/[0.1] disabled:opacity-50"
        >
          {importing ? <Loader2 className="animate-spin" size={14} /> : <FileUp size={14} />}
          Загрузить из файла (заменить график)
        </button>
        <button
          type="button"
          disabled={importing}
          onClick={() => pickImport("append")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-transparent px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.04] disabled:opacity-50"
          title="Добавить строки из файла в конец текущего графика"
        >
          Добавить в конец из файла
        </button>
      </div>
      {importNote ? <p className="text-xs text-white/35">{importNote}</p> : null}
      {rows.length > 1 ? (
        <p className="text-[11px] text-white/30 leading-relaxed">
          Порядок строк в кабинете клиента — как в таблице. Стрелки ↑↓ поднимают и опускают строку (удобно после
          импорта).
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-left text-[11px] uppercase tracking-wide text-white/45">
              <th className="px-1.5 py-2 font-semibold w-12 text-center" title="Порядок">
                №
              </th>
              <th className="px-2 py-2 font-semibold min-w-[9rem] max-w-[14rem]">Название / этап</th>
              <th className="px-2 py-2 font-semibold w-[7.5rem]">Сумма, ₽</th>
              <th className="px-2 py-2 font-semibold w-[9.5rem]">Дата</th>
              <th className="px-2 py-2 font-semibold w-[10.5rem]">Статус</th>
              <th className="px-2 py-2 w-[4.5rem]" aria-label="Действия" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-2 py-6 text-center text-white/40">
                  Нет платежей
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.05] align-top last:border-0">
                  <td className="px-1 py-1.5">
                    <div className="flex flex-col items-center gap-0.5 pt-0.5">
                      <span className="text-[10px] tabular-nums text-white/35">{i + 1}</span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => moveRow(i, -1)}
                          className="inline-flex rounded-md p-1 text-white/50 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                          aria-label={`Поднять строку ${i + 1}`}
                          title="Выше"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={i >= rows.length - 1}
                          onClick={() => moveRow(i, 1)}
                          className="inline-flex rounded-md p-1 text-white/50 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                          aria-label={`Опустить строку ${i + 1}`}
                          title="Ниже"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 min-w-[9rem] max-w-[14rem] w-[30%]">
                    <textarea
                      rows={2}
                      className={
                        inp +
                        " min-h-[2.25rem] max-h-16 resize-none overflow-y-auto break-words leading-snug [field-sizing:content]"
                      }
                      value={row.label}
                      onChange={(e) => patchRow(i, { label: e.target.value })}
                      placeholder="Этап"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      className={inp + " tabular-nums"}
                      type="number"
                      min={0}
                      step={1}
                      value={row.amountRubles || ""}
                      onChange={(e) => patchRow(i, { amountRubles: parseFloat(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      className={inp + " tabular-nums"}
                      value={row.dueDate}
                      onChange={(e) => patchRow(i, { dueDate: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <AdminSelect
                      className="w-full min-w-0"
                      triggerClassName={selectTrigger}
                      value={row.status}
                      onValueChange={(v) => patchRow(i, { status: v })}
                      options={CLIENT_PAYMENT_STATUS_OPTIONS}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      className="inline-flex p-1.5 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-white/[0.04]"
                      onClick={() => removeRow(i)}
                      aria-label="Удалить платёж"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
