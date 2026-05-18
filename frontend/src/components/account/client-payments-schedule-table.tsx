import { formatRub } from "@/lib/construction-shared";
import { formatDateRu, kopeksToRubles, paymentStatusLabel } from "@/lib/client-portal-labels";
import type { ClientPaymentScheduleItem } from "@/lib/client-payments-dashboard";

export type ClientPaymentScheduleRow = ClientPaymentScheduleItem;

/** Таблица графика платежей в личном кабинете. */
export function ClientPaymentsScheduleTable({
  payments,
  variant = "full",
}: {
  payments: ClientPaymentScheduleRow[];
  /** full — страница «Платежи»; dashboard — краткий блок на главной */
  variant?: "full" | "dashboard";
}) {
  if (payments.length === 0) {
    return <p className="text-sm opacity-60 p-4">—</p>;
  }

  const labelColClass = variant === "dashboard" ? "w-[38%] min-w-[8rem]" : "w-[40%] min-w-[8rem]";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className={labelColClass} />
          <col className="w-[18%]" />
          <col className="w-[22%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead>
          <tr
            className="text-left border-b bg-black/[0.02] dark:bg-white/[0.02]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <th className="p-3 font-semibold">Этап / основание</th>
            <th className="p-3 font-semibold whitespace-nowrap">Сумма</th>
            <th className="p-3 font-semibold">Статус</th>
            <th className="p-3 font-semibold whitespace-nowrap">Дата</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-b align-top" style={{ borderColor: "var(--border)" }}>
              <td className="p-3 break-words leading-snug text-pretty hyphens-auto min-w-0">
                {p.label}
              </td>
              <td className="p-3 tabular-nums whitespace-nowrap">
                {formatRub(kopeksToRubles(p.amountKopeks))}
              </td>
              <td className="p-3 whitespace-nowrap">{paymentStatusLabel(p.status)}</td>
              <td className="p-3 tabular-nums whitespace-nowrap">{formatDateRu(p.dueDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
