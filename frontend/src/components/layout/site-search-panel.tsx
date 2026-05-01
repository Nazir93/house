"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  LayoutGrid,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  getSiteSearchLinks,
  groupSearchLinksBySection,
  type SiteSearchLink,
} from "@/lib/site-search-links";
import { ACCOUNT_PORTAL_PATH } from "@/lib/constants";

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function filterLinks(links: SiteSearchLink[], q: string): SiteSearchLink[] {
  const n = norm(q);
  if (!n) return links;
  return links.filter((row) => {
    const hay = norm(`${row.label} ${row.href} ${row.section}`);
    return hay.includes(n);
  });
}

export function SiteSearchPanel({
  open,
  onClose,
  openModal,
}: {
  open: boolean;
  onClose: () => void;
  openModal: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const allLinks = useMemo(() => getSiteSearchLinks(), []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const filtered = useMemo(() => filterLinks(allLinks, query), [allLinks, query]);
  const grouped = useMemo(() => groupSearchLinksBySection(filtered), [filtered]);
  const sections = useMemo(
    () => Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0], "ru")),
    [grouped]
  );

  return (
    <div
      className={`relative z-[41] grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className="max-h-[min(85vh,920px)] overflow-y-auto overscroll-contain border-t shadow-[0_28px_56px_rgba(0,0,0,0.14)]"
          style={{
            borderColor: "var(--header-bar-border)",
            backgroundColor: "var(--bg)",
            color: "var(--text)",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Поиск и разделы сайта"
        >
          <div className="mx-auto max-w-[1240px] px-4 py-6 md:px-8 md:py-8">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5 md:pb-6" style={{ borderColor: "var(--border)" }}>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
                  Поиск по сайту
                </p>
                <h2 className="font-heading text-xl font-bold tracking-tight md:text-2xl">Разделы и страницы</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition hover:bg-black/[0.04] dark:hover:bg-white/10"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="relative mt-5 md:mt-6">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-45"
                strokeWidth={2}
                aria-hidden
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Например: ипотека, фундамент, проект…"
                className="w-full rounded-2xl border py-3.5 pl-12 pr-4 text-[15px] outline-none transition focus:ring-2 focus:ring-[var(--accent)]/25"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--card-bg)",
                  color: "var(--text)",
                }}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_minmax(280px,340px)] lg:gap-8">
              <div className="min-w-0 space-y-5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-subtle)" }}>
                  <LayoutGrid className="h-4 w-4 opacity-70" aria-hidden />
                  Навигация
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {sections.length === 0 ? (
                    <p className="col-span-full text-sm" style={{ color: "var(--text-muted)" }}>
                      Ничего не найдено. Попробуйте другой запрос.
                    </p>
                  ) : (
                    sections.map(([sectionTitle, links]) => (
                      <div
                        key={sectionTitle}
                        className="rounded-2xl border p-4 shadow-sm transition hover:shadow-md md:p-5"
                        style={{
                          borderColor: "var(--border)",
                          backgroundColor: "color-mix(in srgb, var(--card-bg) 88%, var(--bg))",
                        }}
                      >
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>
                          {sectionTitle}
                        </p>
                        <ul className="space-y-0.5">
                          {links.map((row) => (
                            <li key={`${row.href}-${row.label}`}>
                              <Link
                                href={row.href}
                                onClick={onClose}
                                className="group flex items-center justify-between gap-2 rounded-xl px-2 py-2 text-sm transition hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                                style={{ color: "var(--text)" }}
                              >
                                <span className="min-w-0 leading-snug">{row.label}</span>
                                <ArrowRight className="h-4 w-4 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-70" aria-hidden />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openModal();
                  }}
                  className="w-full rounded-2xl border px-4 py-3.5 text-left text-sm font-semibold transition hover:bg-black/[0.04] dark:hover:bg-white/[0.06] sm:w-auto sm:px-6"
                  style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                >
                  Оставить заявку — ответим и подберём решение
                </button>
              </div>

              <aside
                className="flex flex-col justify-between gap-4 rounded-2xl border-2 p-5 md:p-6"
                style={{
                  borderColor: "var(--accent)",
                  background: `linear-gradient(165deg, color-mix(in srgb, var(--accent) 12%, var(--bg)) 0%, var(--card-bg) 55%, var(--bg) 100%)`,
                }}
              >
                <div>
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                  >
                    <UserRound className="h-6 w-6" strokeWidth={2} aria-hidden />
                  </div>
                  <h3 className="font-heading text-lg font-bold tracking-tight md:text-xl">Личный кабинет</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Вход для клиентов: статус стройки, документы и переписка с менеджером — когда сервис будет подключён к сайту.
                  </p>
                </div>
                <Link
                  href={ACCOUNT_PORTAL_PATH}
                  onClick={onClose}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] transition hover:opacity-95"
                  style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                >
                  Войти в кабинет
                  <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </Link>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
