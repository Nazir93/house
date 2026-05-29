"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { localizeTicketApiError } from "@/lib/client-ticket-labels";

export function SupportReplyForm({ ticketId, disabled }: { ticketId: string; disabled: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (disabled) {
    return (
      <p className="mt-3 text-xs rounded-lg border px-3 py-2" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
        Обращение закрыто. Если вопрос снова актуален — создайте новое обращение выше.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/client/tickets/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(localizeTicketApiError(data?.error, "Не удалось отправить сообщение"));
        setLoading(false);
        return;
      }
      setMessage("");
      router.refresh();
    } catch {
      setError("Не удалось связаться с сервером. Проверьте интернет и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
      <label
        htmlFor={`support-reply-${ticketId}`}
        className="block text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--text-muted)" }}
      >
        Ваш ответ
      </label>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <textarea
        id={`support-reply-${ticketId}`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={3}
        placeholder="Дополните вопрос или уточните детали…"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
      />
      <button
        type="submit"
        disabled={loading}
        className="text-xs font-bold uppercase tracking-wide rounded-lg px-4 py-2 disabled:opacity-50"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
      >
        {loading ? "Отправка…" : "Отправить"}
      </button>
    </form>
  );
}
