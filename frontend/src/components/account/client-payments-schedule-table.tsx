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
    return <p style={{ color: "var(--text-muted)" }}>График платежей не заведён.</p>;
  }

  const showPaidColumn = variant === "full";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className={showPaidColumn ? "w-[32%] min-w-[8rem]" : "w-[38%] min-w-[8rem]"} />
          <col className="w-[16%]" />
          <col className="w-[18%]" />
          <col className={showPaidColumn ? "w-[17%]" : "w-[28%]"} />
          {showPaidColumn ? <col className="w-[17%]" /> : null}
        </colgroup>
        <thead>
          <tr
            className="text-left border-b bg-black/[0.02] dark:bg-white/[0.02]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <th className="p-3 font-semibold">Этап / основание</th>
            <th className="p-3 font-semibold whitespace-nowrap">Сумма</th>
            <th className="p-3 font-semibold">Статус</th>
            <th className="p-3 font-semibold whitespace-nowrap">
              {showPaidColumn ? "Срок" : "Дата"}
            </th>
            {showPaidColumn ? (
              <th className="p-3 font-semibold whitespace-nowrap">Оплачен</th>
            ) : null}
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
              {showPaidColumn ? (
                <td className="p-3 tabular-nums whitespace-nowrap">{formatDateRu(p.paidAt)}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
