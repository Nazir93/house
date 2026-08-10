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
        className="pointer-events-auto w-full max-w-[17.5rem] rounded-xl border px-3.5 py-3.5 text-center shadow-[0_14px_36px_rgb(0_0_0/0.12)] backdrop-blur-md sm:max-w-[19rem] sm:px-4 sm:py-3.5"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bg) 92%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div
          className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
          aria-hidden
        >
          <Cookie className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} strokeWidth={1.75} />
        </div>

        <p
          className="text-[9px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "var(--accent)" }}
        >
          Файлы cookie
        </p>

        <div
          className="mx-auto mt-1.5 space-y-1.5 text-pretty text-balance text-[11px] leading-snug sm:text-xs sm:leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          <p>Мы используем cookie для работы сайта, сохранения настроек и аналитики посещений.</p>
          <p>
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
        </div>

        <button
          type="button"
          onClick={accept}
          className="mt-3 min-w-[7.5rem] rounded-full px-5 py-2 text-[10px] font-heading font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:opacity-90"
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
