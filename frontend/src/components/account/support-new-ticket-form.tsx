"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SupportNewTicketForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/client/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Не удалось отправить");
        setLoading(false);
        return;
      }
      setSubject("");
      setMessage("");
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-5 space-y-4"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
    >
      <h2 className="font-heading font-bold text-lg">Задать вопрос</h2>
      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
          Тема
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
          Сообщение
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full rounded-xl border px-3 py-2 text-sm resize-y min-h-[100px]"
          style={{ borderColor: "var(--border)", background: "var(--bg)", color: "var(--text)" }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl px-5 py-2.5 text-sm font-bold uppercase tracking-wide disabled:opacity-50"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
      >
        {loading ? "Отправка…" : "Отправить"}
      </button>
    </form>
  );
}
