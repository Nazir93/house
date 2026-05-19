import { formatRub } from "@/lib/construction-shared";
import { formatDateRu, kopeksToRubles } from "@/lib/client-portal-labels";
import type { UpcomingPaymentSummary } from "@/lib/client-payments-dashboard";

/** Карточка «Следующий платёж» / «Ближайший платёж». */
export function AccountPaymentsNextCard({
  summary,
  compact = false,
}: {
  summary: UpcomingPaymentSummary;
  compact?: boolean;
}) {
  const { totalAmountKopeks, payments } = summary;

  return (
    <div
      className={`rounded-xl border ${compact ? "p-4 mb-4" : "p-6"}`}
      style={{
        borderColor: "var(--accent)",
        background: "color-mix(in srgb, var(--accent) 8%, var(--card-bg))",
      }}
    >
      <p
        className="text-xs uppercase tracking-wider font-semibold"
        style={{ color: "var(--text-muted)" }}
      >
        {compact ? "Ближайший платёж" : "Следующий платёж"}
      </p>
      <p className={`font-bold mt-1 ${compact ? "text-2xl" : "text-3xl mt-2"}`}>
        {formatRub(kopeksToRubles(totalAmountKopeks))}
      </p>
      <ul className={`${compact ? "mt-2 space-y-1" : "mt-3 space-y-1.5"} list-none p-0 m-0`}>
        {payments.map((payment) => (
          <li
            key={payment.id}
            className={compact ? "text-sm" : "text-base"}
            style={{ color: "var(--text-muted)" }}
          >
            {payment.label}
            {payment.dueDate ? ` · до ${formatDateRu(payment.dueDate)}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Пустой блок «Ближайший платёж», когда нет EXPECTED. */
export function AccountPaymentsNextEmpty({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-xl border ${compact ? "p-4 mb-4" : "p-6"}`}
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--card-bg)",
      }}
    >
      <p
        className="text-xs uppercase tracking-wider font-semibold"
        style={{ color: "var(--text-muted)" }}
      >
        {compact ? "Ближайший платёж" : "Следующий платёж"}
      </p>
      <p className={`${compact ? "text-sm mt-2" : "mt-3"}`} style={{ color: "var(--text-muted)" }}>
        Нет платежей к оплате
      </p>
    </div>
  );
}
