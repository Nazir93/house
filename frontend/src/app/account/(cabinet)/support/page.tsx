import { redirect } from "next/navigation";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { formatDateRu, ticketStatusLabel } from "@/lib/client-portal-labels";
import { SupportNewTicketForm } from "@/components/account/support-new-ticket-form";
import { SupportReplyForm } from "@/components/account/support-reply-form";

export const metadata = {
  title: "Обращения — личный кабинет",
  robots: { index: false, follow: true },
};

export default async function AccountSupportPage() {
  const projectId = await getClientProjectIdFromSession();
  if (!projectId) redirect("/account/login");

  const tickets = await prisma.clientSupportTicket.findMany({
    where: { projectId },
    orderBy: { updatedAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold">Обращения</h1>
      <SupportNewTicketForm />

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">История</h2>
        {tickets.length === 0 ? (
          <p className="text-sm opacity-60">—</p>
        ) : (
          <ul className="space-y-4">
            {tickets.map((t) => (
              <li
                key={t.id}
                className="rounded-2xl border p-4"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
              >
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <h3 className="font-semibold">{t.subject}</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border" style={{ borderColor: "var(--border)" }}>
                    {ticketStatusLabel(t.status)}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {formatDateRu(t.createdAt)}
                </p>
                <ul className="mt-4 space-y-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                  {t.messages.map((m) => (
                    <li
                      key={m.id}
                      className={`text-sm rounded-lg p-3 ${
                        m.authorType === "STAFF" ? "ml-4" : "mr-4"
                      }`}
                      style={{
                        background:
                          m.authorType === "STAFF"
                            ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                            : "color-mix(in srgb, var(--text) 6%, transparent)",
                      }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        {m.authorType === "STAFF" ? "Компания" : "Вы"}
                      </span>
                      <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
                      <p className="text-[10px] mt-2 opacity-60">{formatDateRu(m.createdAt)}</p>
                    </li>
                  ))}
                </ul>
                <SupportReplyForm ticketId={t.id} disabled={t.status === "CLOSED"} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
