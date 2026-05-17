"use client";

import { Plus, Trash2 } from "lucide-react";
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

/** Редактор графика платежей: одна строка таблицы = один платёж (п. 8 ТЗ). */
export function AdminPaymentsEditorTable({
  rows,
  onChange,
}: {
  rows: AdminPaymentRow[];
  onChange: (rows: AdminPaymentRow[]) => void;
}) {
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
    <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">График платежей</h2>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
        >
          <Plus size={14} /> Добавить строку
        </button>
      </div>

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
                  Нет платежей. Нажмите «Добавить строку».
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
                      placeholder="Напр. Фундамент"
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
