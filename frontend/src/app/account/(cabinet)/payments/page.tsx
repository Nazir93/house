import { redirect } from "next/navigation";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import {
  AccountPaymentsNextCard,
  AccountPaymentsNextEmpty,
} from "@/components/account/account-payments-next-card";
import { ClientPaymentsScheduleTable } from "@/components/account/client-payments-schedule-table";
import { buildUpcomingPaymentSummary } from "@/lib/client-payments-dashboard";

export const metadata = {
  title: "Платежи — личный кабинет",
  robots: { index: false, follow: true },
};

export default async function AccountPaymentsPage() {
  const projectId = await getClientProjectIdFromSession();
  if (!projectId) redirect("/account/login");

  const payments = await prisma.clientPayment.findMany({
    where: { projectId },
    orderBy: [{ order: "asc" }, { dueDate: "asc" }],
  });

  const upcoming = buildUpcomingPaymentSummary(payments);

  return (
    <div className="space-y-5 sm:space-y-6 w-full min-w-0">
      <h1 className="font-heading text-xl font-bold sm:text-2xl">Платежи</h1>

      {upcoming ? (
        <AccountPaymentsNextCard summary={upcoming} />
      ) : (
        <AccountPaymentsNextEmpty />
      )}

      <div
        className="rounded-xl sm:rounded-2xl border overflow-hidden min-w-0"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
      >
        <div className="border-b px-4 py-3 sm:px-5" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-sm font-semibold sm:text-base">График платежей</h2>
        </div>
        <ClientPaymentsScheduleTable payments={payments} variant="full" />
      </div>
    </div>
  );
}
