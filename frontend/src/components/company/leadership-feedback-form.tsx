"use client";

import { useCallback, useState } from "react";
import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";

export function LeadershipFeedbackForm() {
  const getCaptchaToken = useSmartCaptchaToken();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setErrorMessage(null);
    if (message.trim().length < 10) {
      setErrorMessage("Напишите сообщение хотя бы из нескольких слов.");
      return;
    }
    if (name.trim().length < 2) {
      setErrorMessage("Укажите, как к вам обращаться.");
      return;
    }
    if (phone.trim().length < 10) {
      setErrorMessage("Укажите телефон для обратной связи.");
      return;
    }

    setStatus("loading");
    try {
      const recaptchaToken = await getCaptchaToken();
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message: `Обращение руководству (страница О нас): ${message.trim()}`,
          source: "about-leadership-feedback",
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          recaptchaToken: recaptchaToken || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(typeof data?.error === "string" ? data.error : "Не удалось отправить. Попробуйте позже.");
        setStatus("error");
        return;
      }
      setStatus("success");
      setMessage("");
      setName("");
      setPhone("");
    } catch {
      setErrorMessage("Ошибка сети.");
      setStatus("error");
    }
  }, [getCaptchaToken, message, name, phone]);

  if (status === "success") {
    return (
      <p className="rounded-2xl border px-5 py-6 text-center text-[15px] font-medium" style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text)" }}>
        Спасибо! Мы передали сообщение руководству.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Хочу поделиться с руководителем…"
        className="min-h-[88px] flex-1 rounded-2xl border px-4 py-3 text-[15px] leading-relaxed outline-none ring-[var(--accent)] focus-visible:ring-2"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
      />
      <div className="flex flex-col gap-2 sm:w-[min(100%,280px)]">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
          className="rounded-xl border px-3 py-2.5 text-sm"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Телефон"
          className="rounded-xl border px-3 py-2.5 text-sm"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
        />
        <button
          type="button"
          disabled={status === "loading"}
          onClick={() => void submit()}
          className="rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--on-sale)] transition hover:opacity-95 disabled:opacity-60"
          style={{ backgroundColor: "var(--sale)" }}
        >
          {status === "loading" ? "Отправка…" : "Отправить"}
        </button>
      </div>
      {errorMessage ? <p className="text-sm sm:col-span-full" style={{ color: "var(--sale)" }}>{errorMessage}</p> : null}
    </div>
  );
}
