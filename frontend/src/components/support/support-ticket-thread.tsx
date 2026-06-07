import { formatDateTimeRu } from "@/lib/client-portal-labels";
import { ticketAuthorLabel, type TicketAuthorPerspective } from "@/lib/client-ticket-labels";

export type SupportTicketMessage = {
  id: string;
  authorType: string;
  body: string;
  createdAt: string;
};

export function SupportTicketThread({
  messages,
  perspective,
}: {
  messages: SupportTicketMessage[];
  perspective: TicketAuthorPerspective;
}) {
  return (
    <ul className="space-y-3" aria-label="Переписка">
      {messages.map((m) => {
        const isStaff = m.authorType === "STAFF";
        const alignStaffRight = perspective === "cabinet" ? isStaff : !isStaff;
        return (
          <li
            key={m.id}
            className={`max-w-[92%] rounded-xl p-3 text-sm sm:max-w-[85%] ${
              alignStaffRight ? "ml-auto" : "mr-auto"
            }`}
            style={{
              background: alignStaffRight
                ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                : "color-mix(in srgb, var(--text) 6%, transparent)",
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              {ticketAuthorLabel(m.authorType, perspective)}
            </span>
            <p className="mt-1 whitespace-pre-wrap leading-relaxed">{m.body}</p>
            <p className="mt-2 text-[10px] opacity-60">{formatDateTimeRu(m.createdAt)}</p>
          </li>
        );
      })}
    </ul>
  );
}
