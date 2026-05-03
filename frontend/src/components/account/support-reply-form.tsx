"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SupportReplyForm({ ticketId, disabled }: { ticketId: string; disabled: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (disabled) return null;

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
        setError(data?.error || "Не удалось отправить");
        setLoading(false);
        return;
      }
      setMessage("");
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={2}
        placeholder="Ваш ответ…"
        className="w-full rounded-lg border px-3 py-2 text-sm"
        style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
      />
      <button
        type="submit"
        disabled={loading}
        className="text-xs font-bold uppercase tracking-wide rounded-lg px-3 py-2 disabled:opacity-50"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
      >
        {loading ? "…" : "Отправить"}
      </button>
    </form>
  );
}
