"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          setVisible(true);
        }
      } catch {
        setVisible(true);
      }
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Уведомление об использовании cookie"
      className="fixed inset-x-0 z-[60] flex justify-center px-4 pb-4 pointer-events-none mobile-above-bottom-nav lg:bottom-6 animate-slideUp"
    >
      <div
        className="pointer-events-auto w-full max-w-md rounded-2xl border px-5 py-5 text-center shadow-[0_18px_50px_rgb(0_0_0/0.14)] backdrop-blur-md sm:max-w-lg sm:px-6 sm:py-5"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg) 92%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div
          className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
          aria-hidden
        >
          <Cookie className="h-5 w-5" style={{ color: "var(--accent)" }} strokeWidth={1.75} />
        </div>

        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--accent)" }}
        >
          Файлы cookie
        </p>

        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Мы используем cookie для работы сайта, сохранения настроек и аналитики посещений.
          Нажимая «Принять», вы соглашаетесь с{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--text)" }}
          >
            Политикой конфиденциальности
          </Link>{" "}
          и{" "}
          <Link
            href="/consent"
            className="underline underline-offset-2 transition-colors hover:text-[var(--accent)]"
            style={{ color: "var(--text)" }}
          >
            Согласием на обработку персональных данных
          </Link>
          .
        </p>

        <button
          type="button"
          onClick={accept}
          className="mt-4 min-w-[9.5rem] rounded-full px-7 py-2.5 text-xs font-heading font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:opacity-90"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-contrast)",
          }}
        >
          Принять
        </button>
      </div>
    </div>
  );
};
