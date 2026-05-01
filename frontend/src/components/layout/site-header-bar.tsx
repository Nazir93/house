"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Home,
  Phone,
  Send,
  Star,
} from "lucide-react";
import { SITE_NAME, CITY, HEADER_TAGLINE, YANDEX_ORG_URL } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { NAV_SECTIONS, isNavGroup, type NavSection } from "@/lib/nav-sections";
import { useModal } from "@/lib/modal-context";

/** Текст и обводки на фоне шапки #0F3D2E (--accent) */
const HDR = {
  text: "var(--on-accent)",
  muted: "var(--on-accent-muted)",
  border: "var(--header-border)",
} as const;

const CITY_STORAGE = "site-header-city-confirmed";

function HouseLogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 4L4 16h4v14h8v-8h8v8h8V16h4L20 4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="14" y="18" width="5" height="4" rx="0.5" fill="currentColor" opacity="0.85" />
      <rect x="21" y="18" width="5" height="4" rx="0.5" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

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
    const order = ["О компании", "Наши проекты", "Услуги", "Портфолио"];
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
  const brandWords = SITE_NAME.split(/\s+/).filter(Boolean);

  return (
    <div
      data-navbar
      className="sticky top-0 z-40 border-b shadow-[0_4px_24px_rgba(15,61,46,0.18)]"
      style={{
        backgroundColor: "var(--accent)",
        borderColor: HDR.border,
        color: HDR.text,
      }}
    >
      {/* ——— Desktop ——— */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1440px] px-4 xl:px-8">
          <div className="flex flex-wrap items-center justify-between gap-y-3 py-3">
            {/* Logo + tagline */}
            <div className="flex min-w-0 flex-[1_1_280px] items-start gap-3">
              <Link href="/" className="flex shrink-0 items-center gap-2.5 text-[var(--on-accent)]" aria-label={SITE_NAME}>
                <HouseLogoMark className="h-9 w-10 shrink-0" />
                <span
                  className="font-heading text-[13px] font-bold uppercase leading-[1.1] tracking-[0.06em] sm:text-sm"
                  style={{ color: HDR.text }}
                >
                  {brandWords.map((w) => (
                    <span key={w} className="block">
                      {w}
                    </span>
                  ))}
                </span>
              </Link>
              <p
                className="hidden max-w-[240px] text-[11px] leading-snug xl:block"
                style={{ color: HDR.muted }}
              >
                {HEADER_TAGLINE}
              </p>
            </div>

            {/* Rating */}
            <a
              href={ratingHref}
              target={YANDEX_ORG_URL ? "_blank" : undefined}
              rel={YANDEX_ORG_URL ? "noopener noreferrer" : undefined}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-transparent px-2 py-1 transition-colors hover:border-white/25 hover:bg-white/10"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400 text-[11px] font-bold text-amber-950 shadow-sm">
                <Star className="mr-0.5 h-4 w-4 fill-amber-600 text-amber-700" strokeWidth={1.5} />
                5.0
              </span>
              <span
                className="max-w-[140px] text-[10px] font-medium leading-tight sm:text-[11px]"
                style={{ color: HDR.muted }}
              >
                Рейтинг компании на площадке Яндекс
              </span>
            </a>

            {/* Primary CTA */}
            <Link
              href="/contacts"
              className="inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wide shadow-md transition hover:opacity-[0.94]"
              style={{ backgroundColor: "var(--sale)", color: "var(--on-sale)" }}
            >
              <Home className="h-4 w-4 opacity-90" strokeWidth={2} />
              Отправить проект на просчёт
            </Link>

            {/* Messengers + callback */}
            <div
              className="flex flex-[1_1_200px] flex-wrap items-center justify-end gap-3 xl:flex-nowrap"
            >
              <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(180, 220, 190, 0.95)" }}>
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
                  className="rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition hover:bg-white/10"
                  style={{ borderColor: HDR.border, color: HDR.text }}
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
                  style={{ color: HDR.text }}
                >
                  {contact.phone}
                </a>
              ) : (
                <span
                  className="font-heading text-sm font-semibold tracking-tight text-white/70 xl:text-base"
                  style={{ color: HDR.muted }}
                >
                  Телефон уточняется
                </span>
              )}
              <button
                type="button"
                className="mt-0.5 text-[11px] underline-offset-2 hover:underline"
                style={{ color: HDR.muted }}
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

        <div className="h-px w-full" style={{ backgroundColor: HDR.border }} />

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
                      color: openSection === section.label ? HDR.text : HDR.muted,
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
                className="ml-auto inline-flex shrink-0 items-center rounded-md px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm transition hover:bg-white/20 xl:text-[11px]"
                style={{ backgroundColor: "rgba(255,255,255,0.12)", color: HDR.text }}
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
        style={{ borderColor: HDR.border, color: HDR.text }}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2 text-[var(--on-accent)]" aria-label={SITE_NAME}>
          <HouseLogoMark className="h-8 w-9 shrink-0" />
          <span
            className="truncate font-heading text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: HDR.text }}
          >
            {SITE_NAME}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {contact.phone.trim() && contact.phoneRaw.trim() ? (
            <a
              href={`tel:${contact.phoneRaw}`}
              className="hidden min-[400px]:flex items-center gap-1 text-[12px] font-semibold tabular-nums"
              style={{ color: HDR.text }}
            >
              <Phone className="h-3.5 w-3.5 shrink-0 opacity-80" />
              {contact.phone}
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-mobile-menu"))}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[4px]"
            aria-label="Открыть меню"
          >
            <span className="block h-[2px] w-5" style={{ backgroundColor: HDR.text }} />
            <span className="block h-[2px] w-5" style={{ backgroundColor: HDR.text }} />
            <span className="block h-[2px] w-3.5 self-start ml-[3px]" style={{ backgroundColor: HDR.text }} />
          </button>
        </div>
      </div>
    </div>
  );
}
