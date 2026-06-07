"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { SiteSearchAccountAside } from "@/components/layout/site-search-account-aside";
import {
  getSiteSearchLinks,
  groupSearchLinksBySection,
  type SiteSearchLink,
} from "@/lib/site-search-links";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

/** Тёмная тема: «окна» поверх тёмного баннера */
const glassPaneDark =
  "rounded-2xl border border-black/35 bg-black/42 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_48px_rgba(0,0,0,0.45)] backdrop-blur-md sm:rounded-[1.35rem]";

const glassCardDark =
  "rounded-2xl border border-black/35 bg-black/30 shadow-lg shadow-black/25 backdrop-blur-md";

/** Светлая тема: те же контуры блоков на фоне страницы (var(--bg), карточки) */
const glassPaneLight =
  "rounded-2xl border border-[rgba(26,30,29,0.14)] bg-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_48px_rgba(15,61,46,0.09)] backdrop-blur-md sm:rounded-[1.35rem]";

const glassCardLight =
  "rounded-2xl border border-[rgba(26,30,29,0.12)] bg-[var(--card-bg)]/93 shadow-[0_10px_32px_rgba(15,61,46,0.07)] backdrop-blur-md";

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
  const { theme } = useTheme();

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);

  const allLinks = useMemo(() => getSiteSearchLinks(), []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => filterLinks(allLinks, query), [allLinks, query]);
  const grouped = useMemo(() => groupSearchLinksBySection(filtered), [filtered]);
  const sections = useMemo(
    () => Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0], "ru")),
    [grouped]
  );

  if (!open) return null;

  const isLight = theme === "light";
  const glassPane = isLight ? glassPaneLight : glassPaneDark;
  const glassCard = isLight ? glassCardLight : glassCardDark;

  return (
    <div
      className="fixed inset-x-0 z-[56] flex flex-col overflow-hidden overscroll-none"
      style={{
        top: "var(--site-header-sticky-offset)",
        height: "calc(100dvh - var(--site-header-sticky-offset))",
      }}
      role="presentation"
    >
      {/* Фон страницы: светлый — как у body / дневного баннера; тёмный — атмосфера hero */}
      <div
        className={cn("absolute inset-0", isLight ? "bg-[var(--bg)]" : "bg-[#07110e]")}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          isLight
            ? "bg-gradient-to-r from-emerald-900/[0.06] via-transparent to-emerald-800/[0.05]"
            : "bg-gradient-to-r from-black/82 via-black/52 to-black/16",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          isLight
            ? "bg-gradient-to-t from-[var(--bg-secondary)]/[0.55] via-transparent to-white/40"
            : "bg-gradient-to-t from-black/72 via-black/10 to-black/42",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          isLight
            ? "bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.78),transparent_42%),radial-gradient(circle_at_82%_78%,rgba(15,61,46,0.16),transparent_44%)]"
            : "bg-[radial-gradient(circle_at_20%_20%,rgba(246,246,244,0.14),transparent_32%),radial-gradient(circle_at_78%_72%,rgba(15,61,46,0.32),transparent_36%)]",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 flex h-full min-h-0 flex-col",
          isLight ? "text-[var(--text)]" : "text-white",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Поиск и разделы сайта"
      >
        <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 flex-col px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] md:px-8 md:pt-5 md:pb-5 lg:px-12">
          {/* Как блок заголовка на баннере: одно «окно» */}
          <div className={cn(glassPane, "shrink-0 px-4 py-3 sm:px-5 sm:py-3.5")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.18em]",
                    isLight ? "text-[color:var(--accent)]" : "text-emerald-300/88",
                  )}
                >
                  Поиск по сайту
                </p>
                <h2
                  className={cn(
                    "mt-1 font-heading text-xl font-bold tracking-tight md:text-2xl",
                    isLight ? "text-[var(--text)]" : "text-white",
                  )}
                >
                  Разделы и страницы
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition",
                  isLight
                    ? "border-[rgba(26,30,29,0.18)] text-[var(--text)] hover:bg-black/[0.05]"
                    : "border-white/22 text-white/95 hover:bg-white/12",
                )}
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="relative mt-4">
              <Search
                className={cn(
                  "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2",
                  isLight ? "text-[var(--text-subtle)]" : "text-white/45",
                )}
                strokeWidth={2}
                aria-hidden
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Фильтр по разделам и страницам…"
                className={cn(
                  "funnel-text-input w-full !rounded-2xl border py-3.5 pl-12 pr-4 text-[15px] leading-snug outline-none backdrop-blur-sm transition focus-visible:ring-2 focus-visible:ring-emerald-400/35",
                  isLight
                    ? "border-[rgba(26,30,29,0.16)] bg-white/92 text-[var(--text)] placeholder:text-[color:rgba(26,30,29,0.45)] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
                    : "border-black/40 bg-black/50 text-neutral-100 placeholder:text-white/42",
                )}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <div
            className={cn(
              "mt-4 grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden",
              "grid-rows-[minmax(0,1fr)_auto]",
              "lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:grid-rows-1 lg:items-stretch lg:gap-8 lg:pb-2",
            )}
          >
            <div className="order-1 flex min-h-0 min-w-0 flex-col overflow-hidden lg:order-1">
              {sections.length === 0 ? (
                <div
                  className={cn(
                    glassPane,
                    "flex min-h-0 flex-1 items-center justify-center px-6 py-10 text-center text-sm",
                    isLight ? "text-[color:var(--text-subtle)]" : "text-neutral-300",
                  )}
                >
                  Ничего не найдено. Измените запрос.
                </div>
              ) : (
                <div
                  className={cn(
                    "grid min-h-0 flex-1 auto-rows-max content-start gap-2.5 overflow-y-auto overscroll-contain touch-pan-y pr-0.5 [-webkit-overflow-scrolling:touch] sm:grid-cols-2 lg:grid-cols-3 lg:gap-3 lg:pr-1 xl:grid-cols-3",
                  )}
                  style={{ scrollbarGutter: "stable" }}
                >
                  {sections.map(([sectionTitle, links]) => (
                    <div key={sectionTitle} className={cn(glassCard, "p-3 md:p-3.5")}>
                      <p
                        className={cn(
                          "mb-2 truncate text-[10px] font-bold uppercase tracking-[0.14em]",
                          isLight ? "text-[color:var(--accent)]" : "text-emerald-300/85",
                        )}
                      >
                        {sectionTitle}
                      </p>
                      <ul className="space-y-0.5">
                        {links.map((row) => (
                          <li key={`${row.href}-${row.label}`}>
                            <Link
                              href={row.href}
                              onClick={onClose}
                              className={cn(
                                "group flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm transition",
                                isLight
                                  ? "text-[var(--text)] hover:bg-black/[0.06]"
                                  : "text-white/95 hover:bg-black/35",
                              )}
                            >
                              <span className="min-w-0 leading-snug">{row.label}</span>
                              <ArrowRight
                                className={cn(
                                  "h-4 w-4 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-90",
                                  isLight ? "text-[var(--text-subtle)]" : "text-white/30",
                                )}
                                aria-hidden
                              />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <SiteSearchAccountAside
              open={open}
              onClose={onClose}
              openModal={openModal}
              isLight={isLight}
              glassPane={glassPane}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
