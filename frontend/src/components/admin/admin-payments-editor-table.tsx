"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2, Plus, Trash2 } from "lucide-react";
import { AdminSelect } from "@/components/admin/admin-select";
import { CLIENT_PAYMENT_STATUS_OPTIONS } from "@/lib/client-payment-status";

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
  return { order, label: "", amountRubles: 0, dueDate: "", status: "EXPECTED", paidAt: "" };
}

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
            label: typeof r.label === "string" ? r.label : "Платёж",
            amountRubles: typeof r.amountRubles === "number" ? r.amountRubles : 0,
            dueDate: "",
            status: "EXPECTED",
            paidAt: "",
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
        if (!window.confirm("Заменить график?")) return;
      }
      fileInputRef.current?.click();
    },
    [rows.length]
  );

  function patchRow(index: number, patch: Partial<AdminPaymentRow>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...rows, createEmptyRow(rows.length)]);
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
          Заменить из файла
        </button>
        <button
          type="button"
          disabled={importing}
          onClick={() => pickImport("append")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-transparent px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/[0.04] disabled:opacity-50"
        >
          Добавить из файла
        </button>
      </div>
      {importNote ? <p className="text-xs text-white/35">{importNote}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-left text-[11px] uppercase tracking-wide text-white/45">
              <th className="px-2 py-2 font-semibold min-w-[9rem] max-w-[14rem]">Название / этап</th>
              <th className="px-2 py-2 font-semibold w-[7.5rem]">Сумма, ₽</th>
              <th className="px-2 py-2 font-semibold w-[9.5rem]">Дата</th>
              <th className="px-2 py-2 font-semibold w-[10.5rem]">Статус</th>
              <th className="px-2 py-2 w-10" aria-label="Действия" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-6 text-center text-white/40">
                  Нет платежей
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.05] align-top last:border-0">
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
