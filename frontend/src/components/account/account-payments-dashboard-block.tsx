import Link from "next/link";
import { ClientPaymentsScheduleTable } from "@/components/account/client-payments-schedule-table";
import {
  AccountPaymentsNextCard,
  AccountPaymentsNextEmpty,
} from "@/components/account/account-payments-next-card";
import {
  buildUpcomingPaymentSummary,
  pickDashboardPaymentPreview,
  type ClientPaymentScheduleItem,
} from "@/lib/client-payments-dashboard";

/** Краткий блок «Платежи» на главной ЛК (п. 10 ТЗ). */
export function AccountPaymentsDashboardBlock({
  payments,
}: {
  payments: ClientPaymentScheduleItem[];
}) {
  const upcoming = buildUpcomingPaymentSummary(payments);
  const previewRows = pickDashboardPaymentPreview(payments, 2);
  const totalCount = payments.length;

  return (
    <section
      className="rounded-2xl border p-4 sm:p-6"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
    >
      <h2 className="font-heading text-sm font-bold tracking-wide uppercase mb-4" style={{ color: "var(--text-muted)" }}>
        Платежи
      </h2>

      {upcoming ? (
        <AccountPaymentsNextCard summary={upcoming} compact />
      ) : (
        <AccountPaymentsNextEmpty compact />
      )}

      {previewRows.length > 0 ? (
        <ClientPaymentsScheduleTable payments={previewRows} variant="dashboard" />
      ) : (
        <p className="text-sm opacity-60">—</p>
      )}

      {totalCount > 0 ? (
        <Link
          href="/account/payments"
          className="inline-block mt-4 text-sm font-medium"
          style={{ color: "var(--accent)" }}
        >
          Все
        </Link>
      ) : null}
    </section>
  );
}
