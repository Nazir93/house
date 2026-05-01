"use client";

import { useState, type CSSProperties, type FormEvent } from "react";

export function LeadMiniForm({
  source,
  service,
  calcData,
  variant = "light",
  submitLabel,
  bare,
}: {
  source: string;
  service?: string;
  calcData?: unknown;
  /** light — светлая карточка на фоне страницы; dark — форма на зелёном фоне (#0F3D2E) */
  variant?: "light" | "dark";
  submitLabel?: string;
  /** Без обводки карточки — для встраивания в блок калькулятора */
  bare?: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const dark = variant === "dark";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("Отправляем...");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        service,
        source,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        calcData,
      }),
    });
    const data = await res.json();
    if (res.ok && data.redirectUrl) {
      window.location.href = data.redirectUrl;
      return;
    }
    setStatus(data?.error || "Не удалось отправить заявку.");
  }

  const inputClass = dark
    ? "rounded-xl border-0 border-b border-white/35 bg-transparent px-0 py-3 text-base placeholder:text-white/55 outline-none focus:border-[var(--accent-contrast)]"
    : "rounded-2xl border bg-[var(--bg)] px-4 py-3 text-base";

  const inputStyle = dark
    ? ({ borderColor: "transparent", color: "var(--accent-contrast)" } satisfies CSSProperties)
    : ({ borderColor: "var(--border)", color: "var(--text)" } satisfies CSSProperties);

  return (
    <form
      onSubmit={submit}
      className={`grid gap-4 ${dark ? "mt-8 max-w-md" : bare ? "gap-3" : "gap-3 rounded-[28px] p-5"}`}
      style={dark ? undefined : bare ? undefined : { backgroundColor: "var(--bg-secondary)" }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Ваше имя"
        className={inputClass}
        style={inputStyle}
        autoComplete="name"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        placeholder="Телефон"
        className={inputClass}
        style={inputStyle}
        autoComplete="tel"
      />
      <button
        type="submit"
        className={`rounded-xl px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-95 ${dark ? "text-[var(--accent)]" : "text-white"}`}
        style={{ backgroundColor: dark ? "var(--accent-contrast)" : "var(--sale)" }}
      >
        {submitLabel ?? (dark ? "Заказать звонок" : "Оставить заявку")}
      </button>
      {status ? (
        <p className="text-sm" style={{ color: dark ? "rgba(246,246,244,0.85)" : "var(--text-muted)" }}>
          {status}
        </p>
      ) : null}
    </form>
  );
}
