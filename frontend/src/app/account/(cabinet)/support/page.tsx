import { redirect } from "next/navigation";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { formatDateTimeRu, ticketStatusLabel } from "@/lib/client-portal-labels";
import { ticketAuthorLabel } from "@/lib/client-ticket-labels";
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
      <div>
        <h1 className="font-heading text-2xl font-bold">Обращения</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Переписка с командой по вашему объекту. Все сообщения сохраняются в истории.
        </p>
      </div>

      <SupportNewTicketForm />

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">История обращений</h2>
        {tickets.length === 0 ? (
          <p
            className="text-sm rounded-2xl border px-4 py-6 text-center"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Пока нет обращений. Заполните форму выше — мы ответим в этой же переписке.
          </p>
        ) : (
          <ul className="space-y-4">
            {tickets.map((t) => (
              <li
                key={t.id}
                className="rounded-2xl border p-4 sm:p-5"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
              >
                <div className="flex flex-wrap items-start gap-2 justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base leading-snug">{t.subject}</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      Создано {formatDateTimeRu(t.createdAt)}
                      {t.updatedAt.getTime() !== t.createdAt.getTime()
                        ? ` · обновлено ${formatDateTimeRu(t.updatedAt)}`
                        : null}
                    </p>
                  </div>
                  <span
                    className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {ticketStatusLabel(t.status)}
                  </span>
                </div>

                <ul className="mt-4 space-y-3" aria-label="Переписка">
                  {t.messages.map((m) => {
                    const isStaff = m.authorType === "STAFF";
                    return (
                      <li
                        key={m.id}
                        className={`text-sm rounded-xl p-3 max-w-[95%] ${isStaff ? "ml-auto" : "mr-auto"}`}
                        style={{
                          background: isStaff
                            ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                            : "color-mix(in srgb, var(--text) 6%, transparent)",
                        }}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                          {ticketAuthorLabel(m.authorType, "cabinet")}
                        </span>
                        <p className="mt-1 whitespace-pre-wrap leading-relaxed">{m.body}</p>
                        <p className="text-[10px] mt-2 opacity-60">{formatDateTimeRu(m.createdAt)}</p>
                      </li>
                    );
                  })}
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
