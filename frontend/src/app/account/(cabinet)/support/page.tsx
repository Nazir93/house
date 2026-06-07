import { redirect } from "next/navigation";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { SupportNewTicketForm } from "@/components/account/support-new-ticket-form";
import { SupportTicketsPanel } from "@/components/account/support-tickets-panel";

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

  const initialTickets = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    messages: t.messages.map((m) => ({
      id: m.id,
      authorType: m.authorType,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold">Обращения</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Переписка с командой по вашему объекту. Ответы обновляются автоматически.
        </p>
      </div>

      <SupportNewTicketForm />

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">История обращений</h2>
        <SupportTicketsPanel initialTickets={initialTickets} />
      </div>
    </div>
  );
}
