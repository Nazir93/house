"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, MessageCircle, Send } from "lucide-react";
import { formatDateTimeRu, ticketStatusLabel } from "@/lib/client-portal-labels";
import { localizeTicketApiError } from "@/lib/client-ticket-labels";
import { SupportTicketThread, type SupportTicketMessage } from "@/components/support/support-ticket-thread";
import { cn } from "@/lib/utils";

const POLL_MS = 8_000;

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Открыто" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "CLOSED", label: "Закрыто" },
] as const;

type AdminTicket = {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  needsStaffReply: boolean;
  project: {
    id: string;
    contractNumber: string;
    clientName: string | null;
    title: string;
  };
  lastMessage: { body: string; authorType: string; createdAt: string } | null;
  messages: SupportTicketMessage[];
};

export function AdminTicketsChat() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedFromUrl = searchParams.get("ticket");
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(selectedFromUrl);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<string>("IN_PROGRESS");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const threadEndRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/tickets", { cache: "no-store" });
      if (!r.ok) return;
      const data = (await r.json()) as { tickets: AdminTicket[] };
      setTickets(data.tickets ?? []);
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
    const id = setInterval(() => void loadTickets(), POLL_MS);
    return () => clearInterval(id);
  }, [loadTickets]);

  useEffect(() => {
    if (selectedFromUrl) setSelectedId(selectedFromUrl);
  }, [selectedFromUrl]);

  const selected = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? null,
    [tickets, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    setStatus(selected.status);
    void fetch(`/api/admin/tickets/${selected.id}/read`, { method: "POST" });
  }, [selected?.id, selected?.updatedAt]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [selected?.messages.length, selected?.id]);

  function selectTicket(id: string) {
    setSelectedId(id);
    setReply("");
    setError("");
    router.replace(`/admin/tickets?ticket=${encodeURIComponent(id)}`, { scroll: false });
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const text = reply.trim();
    if (!text) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/tickets/${selected.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(localizeTicketApiError(data?.error, "Не удалось отправить ответ"));
        return;
      }
      setReply("");
      await loadTickets();
    } catch {
      setError("Не удалось связаться с сервером");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] min-h-[520px] flex-col gap-4 lg:flex-row">
      <aside
        className="flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border lg:w-[min(360px,38%)]"
        style={{ borderColor: "var(--adm-card-border)", backgroundColor: "var(--adm-card-bg)" }}
      >
        <div
          className="flex items-center gap-2 border-b px-4 py-3"
          style={{ borderColor: "var(--adm-card-border)" }}
        >
          <MessageCircle size={18} className="text-emerald-400" aria-hidden />
          <h2 className="text-sm font-semibold text-white">Чат с клиентами</h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && tickets.length === 0 ? (
            <p className="p-4 text-sm text-white/40">Загрузка…</p>
          ) : tickets.length === 0 ? (
            <p className="p-4 text-sm text-white/45">Пока нет обращений из личного кабинета.</p>
          ) : (
            <ul>
              {tickets.map((t) => {
                const active = t.id === selectedId;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => selectTicket(t.id)}
                      className={cn(
                        "w-full border-b px-4 py-3 text-left transition",
                        active ? "bg-emerald-500/10" : "hover:bg-white/[0.04]"
                      )}
                      style={{ borderColor: "var(--adm-card-border)" }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-semibold text-white">
                          {t.project.clientName?.trim() || t.project.contractNumber}
                        </span>
                        {t.needsStaffReply ? (
                          <span className="shrink-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                            Новое
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-white/45">{t.subject}</p>
                      {t.lastMessage ? (
                        <p className="mt-1 line-clamp-2 text-xs text-white/55">{t.lastMessage.body}</p>
                      ) : null}
                      <p className="mt-1 text-[10px] text-white/35">
                        {formatDateTimeRu(t.updatedAt)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--adm-card-border)", backgroundColor: "var(--adm-card-bg)" }}
      >
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-white/40">
            <MessageCircle size={40} strokeWidth={1.25} aria-hidden />
            <p className="text-sm">Выберите обращение слева, чтобы открыть переписку</p>
          </div>
        ) : (
          <>
            <header
              className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3 sm:px-5"
              style={{ borderColor: "var(--adm-card-border)" }}
            >
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white">{selected.subject}</h3>
                <p className="mt-1 text-xs text-white/50">
                  {selected.project.contractNumber}
                  {selected.project.clientName ? ` · ${selected.project.clientName}` : ""}
                </p>
                <p className="text-xs text-white/40">{selected.project.title}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-white/15 px-2 py-0.5 text-[10px] font-bold uppercase text-white/70">
                  {ticketStatusLabel(selected.status)}
                </span>
                <Link
                  href={`/admin/client-projects/${selected.project.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1 text-xs text-white/75 transition hover:border-emerald-400/40 hover:text-white"
                >
                  Карточка
                  <ExternalLink size={12} aria-hidden />
                </Link>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <SupportTicketThread messages={selected.messages} perspective="admin" />
              <div ref={threadEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="shrink-0 space-y-2 border-t px-4 py-3 sm:px-5"
              style={{ borderColor: "var(--adm-card-border)" }}
            >
              {error ? <p className="text-xs text-red-400">{error}</p> : null}
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                  Статус
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1 text-xs text-white"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Ответ клиенту — появится в личном кабинете…"
                className="w-full resize-y rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/35"
                required
              />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                <Send size={14} aria-hidden />
                {sending ? "Отправка…" : "Отправить"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
