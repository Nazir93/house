import Link from "next/link";
import { CreditCard, MessageCircle, AlertCircle } from "lucide-react";
import { getAccountHeaderSignals } from "@/lib/account-header-signals";

export async function AccountAttentionStrip({ projectId }: { projectId: string }) {
  const s = await getAccountHeaderSignals(projectId);
  if (s.attentionCount === 0) return null;

  return (
    <section
      className="rounded-2xl border p-4 sm:p-5"
      style={{
        borderColor: "color-mix(in srgb, var(--sale) 35%, var(--border))",
        background: "color-mix(in srgb, var(--sale) 7%, var(--card-bg))",
      }}
      aria-labelledby="account-attention-heading"
    >
      <div className="flex flex-wrap items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "color-mix(in srgb, var(--sale) 15%, transparent)",
            color: "var(--sale)",
          }}
        >
          <AlertCircle className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="account-attention-heading" className="font-heading text-base font-bold">
            Требует внимания
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Проверьте платежи и открытые обращения — так вы ничего не пропустите по объекту.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
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
          </div>
        </div>
      </div>
    </section>
  );
}
