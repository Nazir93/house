import { redirect } from "next/navigation";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { AccountPaymentsNextCard } from "@/components/account/account-payments-next-card";
import { ClientPaymentsScheduleTable } from "@/components/account/client-payments-schedule-table";
import { pickNextUnpaidPayment } from "@/lib/client-payments-dashboard";

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

  const upcoming = pickNextUnpaidPayment(payments);

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-heading text-2xl font-bold">Платежи</h1>

      {upcoming ? <AccountPaymentsNextCard payment={upcoming} /> : null}

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
      >
        <ClientPaymentsScheduleTable payments={payments} variant="full" />
      </div>
    </div>
  );
}
