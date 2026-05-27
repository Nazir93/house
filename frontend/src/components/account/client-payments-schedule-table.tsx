import type { ClientPaymentStatus } from "@prisma/client";
import { formatRub } from "@/lib/construction-shared";
import { formatDateRu, kopeksToRubles, paymentStatusLabel } from "@/lib/client-portal-labels";
import type { ClientPaymentScheduleItem } from "@/lib/client-payments-dashboard";

export type ClientPaymentScheduleRow = ClientPaymentScheduleItem;

function PaymentStatusBadge({ status }: { status: ClientPaymentStatus }) {
  const label = paymentStatusLabel(status);
  const isPaid = status === "PAID";
  const isAwaiting = status === "EXPECTED";
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold leading-tight"
      style={{
        backgroundColor: isPaid
          ? "color-mix(in srgb, var(--accent) 14%, transparent)"
          : isAwaiting
            ? "color-mix(in srgb, var(--sale) 14%, transparent)"
            : "color-mix(in srgb, var(--text) 8%, transparent)",
        color: isPaid ? "var(--accent)" : isAwaiting ? "var(--sale)" : "var(--text-muted)",
      }}
    >
      {label}
    </span>
  );
}

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

  const mobilePayments = variant === "dashboard" ? payments.slice(0, 2) : payments;

  return (
    <>
      {/* Мобильная и узкая планшетная вёрстка — карточки */}
      <ul className="md:hidden divide-y" style={{ borderColor: "var(--border)" }}>
        {mobilePayments.map((p) => (
          <li key={p.id} className="p-4 space-y-3">
            <p className="text-sm font-semibold leading-snug text-pretty">{p.label}</p>
            <dl className="grid grid-cols-[minmax(0,5.5rem)_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="text-[var(--text-muted)]">Сумма</dt>
              <dd className="font-semibold tabular-nums">{formatRub(kopeksToRubles(p.amountKopeks))}</dd>
              <dt className="text-[var(--text-muted)]">Статус</dt>
              <dd>
                <PaymentStatusBadge status={p.status} />
              </dd>
              <dt className="text-[var(--text-muted)]">Дата</dt>
              <dd className="tabular-nums">{formatDateRu(p.dueDate)}</dd>
            </dl>
          </li>
        ))}
      </ul>

      {/* Десктоп — таблица */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr
              className="text-left border-b"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-muted)",
                backgroundColor: "color-mix(in srgb, var(--bg) 92%, var(--border) 8%)",
              }}
            >
              <th className="p-3 font-semibold min-w-[12rem]">Этап / основание</th>
              <th className="p-3 font-semibold whitespace-nowrap">Сумма</th>
              <th className="p-3 font-semibold">Статус</th>
              <th className="p-3 font-semibold whitespace-nowrap">Дата</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b align-top" style={{ borderColor: "var(--border)" }}>
                <td className="p-3 break-words leading-snug text-pretty min-w-0 max-w-[20rem]">{p.label}</td>
                <td className="p-3 tabular-nums whitespace-nowrap">{formatRub(kopeksToRubles(p.amountKopeks))}</td>
                <td className="p-3 whitespace-nowrap">
                  <PaymentStatusBadge status={p.status} />
                </td>
                <td className="p-3 tabular-nums whitespace-nowrap">{formatDateRu(p.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
