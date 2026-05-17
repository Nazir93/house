import Link from "next/link";
import { Bell, CreditCard, MessageCircle } from "lucide-react";
import { getAccountHeaderSignals } from "@/lib/account-header-signals";

export async function AccountAttentionStrip({ projectId }: { projectId: string }) {
  const s = await getAccountHeaderSignals(projectId);
  if (s.attentionCount === 0) return null;

  return (
    <section
      className="rounded-2xl border p-3 sm:p-4 flex flex-wrap gap-2"
      style={{
        borderColor: "color-mix(in srgb, var(--sale) 35%, var(--border))",
        background: "color-mix(in srgb, var(--sale) 7%, var(--card-bg))",
      }}
    >
      {s.notificationsUnread > 0 ? (
        <Link
          href="/account/notifications"
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card-bg)",
            color: "var(--text)",
          }}
        >
          <Bell className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          Уведомления
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
              color: "var(--accent)",
            }}
          >
            {s.notificationsUnread}
          </span>
        </Link>
      ) : null}
      {s.paymentsDue > 0 ? (
        <Link
          href="/account/payments"
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card-bg)",
            color: "var(--text)",
          }}
        >
          <CreditCard className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          Платежи
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums"
            style={{
              backgroundColor: "color-mix(in srgb, var(--sale) 18%, transparent)",
              color: "var(--sale)",
            }}
          >
            {s.paymentsDue}
          </span>
        </Link>
      ) : null}
      {s.ticketsActive > 0 ? (
        <Link
          href="/account/support"
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card-bg)",
            color: "var(--text)",
          }}
        >
          <MessageCircle className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          Обращения
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
              color: "var(--accent)",
            }}
          >
            {s.ticketsActive}
          </span>
        </Link>
      ) : null}
    </section>
  );
}
