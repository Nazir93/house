import { formatRub } from "@/lib/construction-shared";
import { formatDateRu, kopeksToRubles } from "@/lib/client-portal-labels";
import type { ClientPaymentScheduleItem } from "@/lib/client-payments-dashboard";

/** Карточка «Следующий платёж» / «Ближайший платёж». */
export function AccountPaymentsNextCard({
  payment,
  compact = false,
}: {
  payment: ClientPaymentScheduleItem;
  compact?: boolean;
}) {
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
        {formatRub(kopeksToRubles(payment.amountKopeks))}
      </p>
      <p className={`${compact ? "text-sm mt-1" : "mt-2"}`} style={{ color: "var(--text-muted)" }}>
        {payment.label}
        {payment.dueDate ? ` · до ${formatDateRu(payment.dueDate)}` : ""}
      </p>
    </div>
  );
}
