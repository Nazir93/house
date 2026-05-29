"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { localizeTicketApiError } from "@/lib/client-ticket-labels";

type SupportNewTicketFormProps = {
  /** Компактный вид на главной кабинета */
  variant?: "default" | "compact";
};

export function SupportNewTicketForm({ variant = "default" }: SupportNewTicketFormProps) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSent(false);
    setLoading(true);
    try {
      const res = await fetch("/api/client/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(localizeTicketApiError(data?.error, "Не удалось отправить обращение"));
        setLoading(false);
        return;
      }
      setSubject("");
      setMessage("");
      setSent(true);
      router.refresh();
    } catch {
      setError("Не удалось связаться с сервером. Проверьте интернет и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  const isCompact = variant === "compact";

  return (
    <form
      id="support-new-ticket"
      onSubmit={handleSubmit}
      className={
        isCompact
          ? "space-y-3"
          : "rounded-2xl border p-5 space-y-4"
      }
      style={
        isCompact
          ? undefined
          : { borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }
      }
    >
      {!isCompact ? (
        <>
          <div>
            <h2 className="font-heading font-bold text-lg">Новое обращение</h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Опишите вопрос — ответ придёт в эту же переписку. Обычно отвечаем в рабочие часы.
            </p>
          </div>
        </>
      ) : (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Задайте вопрос по стройке, срокам или документам.
        </p>
      )}
      {sent ? (
        <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
          Обращение отправлено. Ответ появится ниже в истории.
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <div>
        <label
          htmlFor={isCompact ? "support-subject-compact" : "support-subject"}
          className="block text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Тема
        </label>
        <input
          id={isCompact ? "support-subject-compact" : "support-subject"}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          maxLength={500}
          placeholder="Например: срок сдачи кровли"
          className="w-full rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
        />
      </div>
      <div>
        <label
          htmlFor={isCompact ? "support-message-compact" : "support-message"}
          className="block text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: "var(--text-muted)" }}
        >
          Сообщение
        </label>
        <textarea
          id={isCompact ? "support-message-compact" : "support-message"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={isCompact ? 3 : 4}
          placeholder="Опишите суть вопроса подробнее…"
          className="w-full rounded-xl border px-3 py-2 text-sm resize-y min-h-[88px]"
          style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl px-5 py-2.5 text-sm font-bold uppercase tracking-wide disabled:opacity-50"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
      >
        {loading ? "Отправка…" : "Отправить обращение"}
      </button>
    </form>
  );
}
