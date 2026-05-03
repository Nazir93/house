import { redirect } from "next/navigation";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { formatRub } from "@/lib/construction-shared";
import { formatDateRu, kopeksToRubles, paymentStatusLabel } from "@/lib/client-portal-labels";

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

  const paymentsOpen = payments.filter((p) => p.status === "EXPECTED" || p.status === "NOT_ISSUED");
  const upcoming =
    paymentsOpen
      .filter((p) => p.dueDate)
      .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())[0]
      ?? paymentsOpen[0]
      ?? null;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-heading text-2xl font-bold">Платежи</h1>

      {upcoming ? (
        <div
          className="rounded-2xl p-6 border"
          style={{ borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 8%, var(--card-bg))" }}
        >
          <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>
            Следующий платёж
          </p>
          <p className="text-3xl font-bold mt-2">{formatRub(kopeksToRubles(upcoming.amountKopeks))}</p>
          <p className="mt-2" style={{ color: "var(--text-muted)" }}>
            {upcoming.label}
            {upcoming.dueDate ? ` · до ${formatDateRu(upcoming.dueDate)}` : ""}
          </p>
        </div>
      ) : null}

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-black/[0.02] dark:bg-white/[0.02]" style={{ borderColor: "var(--border)" }}>
                <th className="p-3 font-semibold">Основание</th>
                <th className="p-3 font-semibold">Сумма</th>
                <th className="p-3 font-semibold">Статус</th>
                <th className="p-3 font-semibold">Срок</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="p-3">{p.label}</td>
                  <td className="p-3 tabular-nums">{formatRub(kopeksToRubles(p.amountKopeks))}</td>
                  <td className="p-3">{paymentStatusLabel(p.status)}</td>
                  <td className="p-3">{formatDateRu(p.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {payments.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>График платежей не заведён.</p>
      ) : null}
    </div>
  );
}
