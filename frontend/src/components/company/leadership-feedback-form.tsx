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
      <p
        className="rounded-[1.25rem] border px-6 py-8 text-center text-[15px] font-medium leading-relaxed md:text-base"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text)" }}
      >
        Спасибо! Мы передали сообщение руководству.
      </p>
    );
  }

  const fieldClass =
    "w-full rounded-[1rem] border px-4 py-3.5 text-[15px] leading-snug outline-none transition-[box-shadow] placeholder:text-[var(--text-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]";

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(260px,300px)] lg:items-stretch lg:gap-5">
        <label className="sr-only" htmlFor="leadership-feedback-message">
          Сообщение руководству
        </label>
        <textarea
          id="leadership-feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Хочу поделиться с руководителем…"
          className={`${fieldClass} min-h-[140px] flex-1 resize-y lg:min-h-[200px]`}
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text)" }}
        />
        <div className="flex flex-col gap-3 lg:min-h-[200px]">
          <label className="sr-only" htmlFor="leadership-feedback-name">
            Имя
          </label>
          <input
            id="leadership-feedback-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя"
            autoComplete="name"
            className={fieldClass}
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text)" }}
          />
          <label className="sr-only" htmlFor="leadership-feedback-phone">
            Телефон
          </label>
          <input
            id="leadership-feedback-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Телефон"
            autoComplete="tel"
            className={fieldClass}
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text)" }}
          />
          <button
            type="button"
            disabled={status === "loading"}
            onClick={() => void submit()}
            className="mt-auto w-full rounded-[1rem] px-5 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--on-sale)] transition hover:opacity-95 disabled:opacity-60"
            style={{ backgroundColor: "var(--sale)" }}
          >
            {status === "loading" ? "Отправка…" : "Отправить"}
          </button>
        </div>
      </div>
      {errorMessage ? (
        <p className="text-center text-sm sm:text-left" style={{ color: "var(--sale)" }}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
