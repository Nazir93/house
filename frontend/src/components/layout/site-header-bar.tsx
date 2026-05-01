"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calculator,
  ChevronDown,
  Phone,
  Send,
  Star,
} from "lucide-react";
import {
  SITE_NAME,
  CITY,
  HEADER_TAGLINE,
  HEADER_PHONE_HINT,
  YANDEX_ORG_URL,
} from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { NAV_SECTIONS, isNavGroup, type NavSection } from "@/lib/nav-sections";
import { useModal } from "@/lib/modal-context";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const CITY_STORAGE = "site-header-city-confirmed";

function NavDropdownPanel({
  section,
  open,
  onClose,
  openModal,
}: {
  section: NavSection;
  open: boolean;
  onClose: () => void;
  openModal: () => void;
}) {
  if (!open) return null;
  return (
    <div className="absolute left-0 top-full z-50 pt-2 lg:left-1/2 lg:-translate-x-1/2">
      <div
        className="min-w-[260px] py-2 shadow-lg"
        style={{
          backgroundColor: "rgba(255,255,255,0.98)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
        }}
      >
        {section.items.map((item) =>
          isNavGroup(item) ? (
            <div key={item.label} className="border-t border-slate-100 py-1 first:border-0">
              <div
                className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: "#94a3b8" }}
              >
                {item.label}
              </div>
              {item.children.map((child) =>
                "action" in child && child.action === "openModal" ? (
                  <button
                    key={child.label}
                    type="button"
                    onClick={() => {
                      onClose();
                      openModal();
                    }}
                    className="w-full px-5 py-2 text-left text-xs uppercase tracking-[0.08em] transition-colors duration-200 hover:bg-black/[0.04]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {child.label}
                  </button>
                ) : "href" in child ? (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    className="block px-5 py-2 text-xs uppercase tracking-[0.08em] transition-colors duration-200 hover:bg-black/[0.04]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {child.label}
                  </Link>
                ) : null
              )}
            </div>
          ) : "action" in item && item.action === "openModal" ? (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onClose();
                openModal();
              }}
              className="w-full px-5 py-2.5 text-left text-xs uppercase tracking-[0.08em] transition-colors duration-200 hover:bg-black/[0.04]"
              style={{ color: "var(--text-muted)" }}
            >
              {item.label}
            </button>
          ) : "href" in item ? (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block px-5 py-2.5 text-xs uppercase tracking-[0.08em] transition-colors duration-200 hover:bg-black/[0.04]"
              style={{ color: "var(--text-muted)" }}
            >
              {item.label}
            </Link>
          ) : null
        )}
      </div>
    </div>
  );
}

export function SiteHeaderBar() {
  const contact = useContactConfig();
  const { openModal } = useModal();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cityTooltipOpen, setCityTooltipOpen] = useState(false);
  const cityWrapRef = useRef<HTMLDivElement>(null);

  const orderedNav = useMemo(() => {
    const order = ["Проекты", "Наши проекты", "Услуги", "О компании"];
    return order
      .map((label) => NAV_SECTIONS.find((s) => s.label === label))
      .filter((s): s is NavSection => Boolean(s));
  }, []);

  const mortgageSection = useMemo(
    () => NAV_SECTIONS.find((s) => s.label === "Ипотека"),
    []
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && !localStorage.getItem(CITY_STORAGE)) {
        setCityTooltipOpen(true);
      }
    } catch {
      setCityTooltipOpen(true);
    }
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!cityWrapRef.current?.contains(e.target as Node)) {
        setCityTooltipOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenSection(label);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenSection(null), 180);
  };

  const confirmCity = () => {
    try {
      localStorage.setItem(CITY_STORAGE, "1");
    } catch {
      /* ignore */
    }
    setCityTooltipOpen(false);
  };

  const ratingHref = YANDEX_ORG_URL || "/reviews";

  return (
    <div
      data-navbar
      className="site-header-bar sticky top-0 z-40 border-b"
      style={{
        backgroundColor: "var(--header-bar-bg)",
        borderColor: "var(--header-bar-border)",
        color: "var(--header-bar-text)",
      }}
    >
      {/* ——— Desktop ——— */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1440px] px-4 xl:px-8">
          <div className="flex flex-wrap items-center justify-between gap-y-3 py-3">
            {/* Logo + tagline */}
            <div className="flex min-w-0 flex-[1_1_280px] items-center gap-3">
              <Link href="/" className="flex min-w-0 shrink-0 items-center" aria-label={SITE_NAME}>
                <BrandLogo height={44} className="max-h-11 w-auto max-w-[min(100%,240px)]" />
              </Link>
              <p
                className="hidden max-w-[260px] text-[10px] font-medium uppercase leading-snug tracking-[0.12em] xl:block"
                style={{ color: "var(--header-bar-muted)" }}
              >
                {HEADER_TAGLINE}
              </p>
            </div>

            {/* Rating */}
            <a
              href={ratingHref}
              target={YANDEX_ORG_URL ? "_blank" : undefined}
              rel={YANDEX_ORG_URL ? "noopener noreferrer" : undefined}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-transparent px-2 py-1 transition-colors hover:border-black/12 hover:bg-black/[0.04] dark:hover:border-white/25 dark:hover:bg-white/10"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400 text-[11px] font-bold text-amber-950 shadow-sm">
                <Star className="mr-0.5 h-4 w-4 fill-amber-600 text-amber-700" strokeWidth={1.5} />
                5.0
              </span>
              <span
                className="max-w-[140px] text-[10px] font-medium leading-tight sm:text-[11px]"
                style={{ color: "var(--header-bar-muted)" }}
              >
                Рейтинг компании на площадке Яндекс
              </span>
            </a>

            <ThemeToggle />

            {/* Primary CTA */}
            <Link
              href="/contacts"
              className="inline-flex shrink-0 items-center gap-2 rounded-md px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] shadow-md transition hover:opacity-[0.92]"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              <Calculator className="h-4 w-4 opacity-95" strokeWidth={2} />
              Рассчитать стоимость
            </Link>

            {/* Messengers + callback */}
            <div
              className="flex flex-[1_1_200px] flex-wrap items-center justify-end gap-3 xl:flex-nowrap"
            >
              <span
                className="flex items-center gap-1.5 text-[11px]"
                style={{ color: "var(--header-bar-muted)" }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Пишите, мы онлайн
              </span>
              <div className="flex items-center gap-2">
                {contact.social.telegram ? (
                  <a
                    href={contact.social.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-sm transition hover:scale-105"
                    aria-label="Telegram"
                  >
                    <Send className="h-4 w-4" strokeWidth={2} />
                  </a>
                ) : null}
                {contact.social.max ? (
                  <a
                    href={contact.social.max}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm transition hover:scale-105"
                    aria-label="Max"
                  >
                    <MaxMessengerIcon className="h-4 w-4 text-white" aria-hidden />
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => openModal()}
                  className="rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition hover:bg-black/[0.04] dark:hover:bg-white/10"
                  style={{ borderColor: "var(--header-bar-border)", color: "var(--header-bar-text)" }}
                >
                  Заказать звонок
                </button>
              </div>
            </div>

            {/* Phone + city */}
            <div ref={cityWrapRef} className="relative flex shrink-0 flex-col items-end text-right">
              {contact.phone.trim() && contact.phoneRaw.trim() ? (
                <a
                  href={`tel:${contact.phoneRaw}`}
                  className="font-heading text-lg font-bold tracking-tight transition hover:opacity-90 xl:text-xl"
                  style={{ color: "var(--header-bar-text)" }}
                >
                  {contact.phone}
                </a>
              ) : (
                <span
                  className="font-heading text-sm font-semibold tracking-tight xl:text-base"
                  style={{ color: "var(--header-bar-muted)" }}
                >
                  Телефон уточняется
                </span>
              )}
              <span
                className="mt-0.5 block text-[11px] leading-tight"
                style={{ color: "var(--header-bar-muted)" }}
              >
                {HEADER_PHONE_HINT}
              </span>
              <button
                type="button"
                className="mt-1 text-[10px] underline-offset-2 hover:underline xl:text-[11px]"
                style={{ color: "var(--header-bar-muted)" }}
                onClick={() => setCityTooltipOpen(true)}
              >
                {CITY}
              </button>
              {cityTooltipOpen ? (
                <div
                  className="absolute right-0 top-full z-[60] mt-2 w-[min(92vw,280px)] rounded-lg border border-slate-200 bg-white p-4 text-left shadow-xl"
                  role="dialog"
                  aria-label="Подтверждение города"
                >
                  <p className="text-sm font-medium text-slate-800">
                    Ваш город {CITY}?
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={confirmCity}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--accent-contrast)]"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      Да, верно
                    </button>
                    <button
                      type="button"
                      onClick={() => setCityTooltipOpen(false)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      Выбрать другой
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="h-px w-full" style={{ backgroundColor: "var(--header-bar-border)" }} />

        {/* Bottom nav row */}
        <div className="mx-auto max-w-[1440px] px-4 xl:px-8">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 py-2.5">
            <nav className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-1 lg:gap-x-8">
              {orderedNav.map((section) => (
                <div
                  key={section.label}
                  className="relative"
                  onMouseEnter={() => handleEnter(section.label)}
                  onMouseLeave={handleLeave}
                >
                  <button
                    type="button"
                    className="flex items-center gap-1 py-2 text-left text-[12px] font-semibold uppercase tracking-[0.06em] xl:text-[13px]"
                    style={{
                      color:
                        openSection === section.label
                          ? "var(--header-bar-text)"
                          : "var(--header-bar-muted)",
                    }}
                  >
                    {section.label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" strokeWidth={2} />
                  </button>
                  <NavDropdownPanel
                    section={section}
                    open={openSection === section.label}
                    onClose={() => setOpenSection(null)}
                    openModal={openModal}
                  />
                </div>
              ))}
            </nav>

            {mortgageSection ? (
              <Link
                href="/mortgage"
                className="ml-auto inline-flex shrink-0 items-center rounded-md px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm transition hover:opacity-90 xl:text-[11px]"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
                  color: "var(--header-bar-text)",
                  border: "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
                }}
              >
                Ипотека / господдержка
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* ——— Mobile ——— */}
      <div
        className="flex items-center justify-between gap-2 border-b px-4 py-2.5 lg:hidden"
        style={{ borderColor: "var(--header-bar-border)", color: "var(--header-bar-text)" }}
      >
        <Link href="/" className="flex min-w-0 flex-1 items-center" aria-label={SITE_NAME}>
          <BrandLogo height={36} className="max-h-9 w-auto max-w-[min(100%,200px)]" />
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {contact.phone.trim() && contact.phoneRaw.trim() ? (
            <a
              href={`tel:${contact.phoneRaw}`}
              className="hidden min-[400px]:flex items-center gap-1 text-[12px] font-semibold tabular-nums"
              style={{ color: "var(--header-bar-text)" }}
            >
              <Phone className="h-3.5 w-3.5 shrink-0 opacity-80" />
              {contact.phone}
            </a>
          ) : null}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-mobile-menu"))}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[4px]"
            aria-label="Открыть меню"
          >
            <span className="block h-[2px] w-5" style={{ backgroundColor: "var(--header-bar-text)" }} />
            <span className="block h-[2px] w-5" style={{ backgroundColor: "var(--header-bar-text)" }} />
            <span
              className="block h-[2px] w-3.5 self-start ml-[3px]"
              style={{ backgroundColor: "var(--header-bar-text)" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
