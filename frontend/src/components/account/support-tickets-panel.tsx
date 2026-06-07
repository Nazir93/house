"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDateTimeRu, ticketStatusLabel } from "@/lib/client-portal-labels";
import { SupportTicketThread, type SupportTicketMessage } from "@/components/support/support-ticket-thread";
import { SupportReplyForm } from "@/components/account/support-reply-form";

const POLL_MS = 10_000;

type Ticket = {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportTicketMessage[];
};

export function SupportTicketsPanel({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initialTickets);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/client/tickets", { cache: "no-store" });
      if (!r.ok) return;
      const data = (await r.json()) as { tickets: Ticket[] };
      setTickets(data.tickets ?? []);
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  if (tickets.length === 0) {
    return (
      <p
        className="text-sm rounded-2xl border px-4 py-6 text-center"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        Пока нет обращений. Заполните форму выше — мы ответим в этой же переписке.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {tickets.map((t) => (
        <li
          key={t.id}
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-base leading-snug">{t.subject}</h3>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Создано {formatDateTimeRu(t.createdAt)}
                {t.updatedAt !== t.createdAt ? ` · обновлено ${formatDateTimeRu(t.updatedAt)}` : null}
              </p>
            </div>
            <span
              className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              {ticketStatusLabel(t.status)}
            </span>
          </div>

          <div className="mt-4">
            <SupportTicketThread messages={t.messages} perspective="cabinet" />
          </div>

          <SupportReplyForm
            ticketId={t.id}
            disabled={t.status === "CLOSED"}
            onSent={refresh}
          />
        </li>
      ))}
    </ul>
  );
}
