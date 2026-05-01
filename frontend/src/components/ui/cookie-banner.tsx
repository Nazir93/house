"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
      className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:right-[80px] z-[60] animate-slideUp"
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="max-w-xl mx-auto lg:mx-0 rounded-2xl border px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 shadow-2xl"
        style={{
          backgroundColor: "var(--bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Мы используем файлы cookie для аналитики и улучшения работы сайта.
            Продолжая использовать сайт, вы соглашаетесь с{" "}
            <Link
              href="/privacy"
              className="underline transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--text)" }}
            >
              Политикой&nbsp;конфиденциальности
            </Link>
            .
          </p>
        </div>
        <button
          onClick={accept}
          className="shrink-0 px-6 py-2.5 text-xs font-heading uppercase tracking-[0.1em] rounded-full transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--bg)",
          }}
        >
          Принять
        </button>
      </div>
    </div>
  );
}
