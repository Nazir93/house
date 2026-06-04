"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Percent, Search, Send, UserRound, X } from "lucide-react";
import { SITE_NAME, HEADER_TAGLINE, ACCOUNT_PORTAL_PATH, YANDEX_REVIEWS_URL } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { maxChatUrlFromRawPhone, telegramChatUrlFromRawPhone } from "@/lib/messenger-links";
import { NAV_SECTIONS, type NavSection } from "@/lib/nav-sections";
import { NavDropdownPanel } from "@/components/layout/nav-dropdown-panel";
import { useModal } from "@/lib/modal-context";
import { useTheme } from "@/lib/theme-context";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SiteSearchPanel } from "@/components/layout/site-search-panel";
import { YandexMapsRatingChip } from "@/components/layout/yandex-maps-rating-chip";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";
import { cn } from "@/lib/utils";

const MESSENGER_CHAT_PHONE = "+79046000099";

export function SiteHeaderBar() {
  const pathname = usePathname();
  const contact = useContactConfig();
  const telegramHref = telegramChatUrlFromRawPhone(MESSENGER_CHAT_PHONE);
  const maxHref = maxChatUrlFromRawPhone(MESSENGER_CHAT_PHONE);
  const { theme } = useTheme();
  const isHomeBanner = pathname === "/";
  const { openModal } = useModal();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onOpenMenu = () => {
      setMobileMenuOpen(true);
      setSearchOpen(false);
    };
    const onCloseMenu = () => setMobileMenuOpen(false);
    window.addEventListener("open-mobile-menu", onOpenMenu);
    window.addEventListener("close-mobile-menu", onCloseMenu);
    return () => {
      window.removeEventListener("open-mobile-menu", onOpenMenu);
      window.removeEventListener("close-mobile-menu", onCloseMenu);
    };
  }, []);

  /** Плотный фон только вне главной или при поиске/меню — на баннере шапка остаётся «стеклом». */
  const headerOpaqueChrome =
    !isHomeBanner || searchOpen || openSection !== null;

  /** Светлая тема сайта + «стеклянная» шапка на главной — текст и лого читаются на тёмном баннере */
  const heroGlassLightInk =
    theme === "light" && isHomeBanner && !headerOpaqueChrome;

  /** Тёмная тема + стекло на главной — шапка над баннером */
  const heroGlassDarkInk =
    theme === "dark" && isHomeBanner && !headerOpaqueChrome;

  /** Полупрозрачный фон «стекла» только на главной: темнее блок — текст читается поверх любого участка фото */
  const heroGlassBackdropBg = heroGlassLightInk
    ? "color-mix(in srgb, #0e1814 80%, transparent)"
    : "color-mix(in srgb, var(--header-bar-bg) 44%, transparent)";

  const orderedNav = useMemo(() => {
    const order = ["Проекты", "Портфолио", "Услуги", "О компании"];
    return order
      .map((label) => NAV_SECTIONS.find((s) => s.label === label))
      .filter((s): s is NavSection => Boolean(s));
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) {
      lockBodyScroll();
      document.body.classList.add("site-search-open");
    } else {
      unlockBodyScroll();
      document.body.classList.remove("site-search-open");
    }
    return () => {
      unlockBodyScroll();
      document.body.classList.remove("site-search-open");
    };
  }, [searchOpen]);

  const handleEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenSection(label);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenSection(null), 180);
  };

  function toggleSearch() {
    setOpenSection(null);
    setSearchOpen((v) => {
      if (!v) window.dispatchEvent(new Event("close-mobile-menu"));
      return !v;
    });
  }

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      {searchOpen ? (
        <div
          role="presentation"
          className={cn(
            "fixed inset-0 z-[55]",
            theme === "light" ? "bg-[#1a1e1d]/28" : "bg-black/50",
          )}
          onClick={closeSearch}
          aria-hidden
        />
      ) : null}

      <div className="sticky top-0 z-[60] isolate pointer-events-auto">
        <div className="relative">
          <div
            data-navbar
            className={cn(
              "site-header-bar transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out",
              headerOpaqueChrome
                ? "border-b"
                : cn(
                    "site-header-bar--glass border-b",
                    heroGlassLightInk ? "border-white/25" : "border-black/35 dark:border-black/45",
                  ),
            )}
            style={{
              backgroundColor: headerOpaqueChrome
                ? "var(--header-bar-bg)"
                : heroGlassBackdropBg,
              borderColor: headerOpaqueChrome
                ? "var(--header-bar-border)"
                : heroGlassLightInk
                  ? "rgba(255, 255, 255, 0.22)"
                  : "rgba(0, 0, 0, 0.32)",
              color: "var(--header-bar-text)",
              ...(heroGlassLightInk
                ? ({
                    "--header-bar-text": "#f3f7f6",
                    "--header-bar-muted": "rgba(243, 247, 246, 0.76)",
                    "--header-bar-border": "rgba(255, 255, 255, 0.34)",
                  } as CSSProperties)
                : {}),
            }}
          >
      {/* ——— Desktop ——— */}
      <div className="hidden lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center gap-x-2 overflow-visible py-1 pl-4 pr-3 xl:gap-x-3 xl:pl-8 xl:pr-5">
          <div className="flex min-w-0 shrink-0 items-stretch">
            <Link
              href="/"
              className="group relative z-[2] flex min-w-0 max-w-[min(100%,38vw)] shrink items-center gap-2 rounded-sm py-0.5 no-underline transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 xl:max-w-[min(100%,32rem)] xl:gap-3"
              style={{ outlineColor: "var(--accent)" }}
              aria-label={`${SITE_NAME} — на главную`}
            >
              <BrandLogo height={44} className="shrink-0" brightOnBackdrop={heroGlassLightInk} />
              <p
                className="header-tagline hidden min-w-0 font-medium uppercase leading-none whitespace-nowrap transition-colors min-[1100px]:block"
                style={{ color: "var(--header-bar-muted)" }}
              >
                {HEADER_TAGLINE}
              </p>
            </Link>
          </div>

          <nav
            className="ml-4 flex shrink-0 flex-nowrap items-center gap-x-2 overflow-visible sm:ml-5 xl:ml-7 xl:gap-x-3.5"
            aria-label="Основное меню"
          >
            {orderedNav.map((section) =>
              section.label === "Проекты" ? (
                <Link
                  key={section.label}
                  href="/projects"
                  onMouseEnter={() => setOpenSection(null)}
                  className="shrink-0 whitespace-nowrap py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em] transition-colors xl:text-[10px]"
                  style={{ color: "var(--header-bar-muted)" }}
                >
                  {section.label}
                </Link>
              ) : (
                <div
                  key={section.label}
                  className="relative shrink-0 overflow-visible"
                  onMouseEnter={() => handleEnter(section.label)}
                  onMouseLeave={handleLeave}
                >
                  <button
                    type="button"
                    className="flex items-center gap-0.5 whitespace-nowrap py-0.5 text-left text-[9px] font-semibold uppercase tracking-[0.06em] xl:gap-1 xl:text-[10px]"
                    style={{
                      color:
                        openSection === section.label
                          ? "var(--header-bar-text)"
                          : "var(--header-bar-muted)",
                    }}
                  >
                    {section.label}
                    <ChevronDown className="h-3 w-3 opacity-70 xl:h-3.5 xl:w-3.5" strokeWidth={2} />
                  </button>
                  <NavDropdownPanel
                    sectionLabel={section.label}
                    open={openSection === section.label}
                    onClose={() => setOpenSection(null)}
                    openModal={openModal}
                  />
                </div>
              )
            )}
          </nav>

          <div className="ml-auto flex min-w-0 shrink-0 flex-nowrap items-center justify-end gap-1 xl:gap-1.5">
            <Link
              href="/mortgage"
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 xl:gap-1.5 xl:px-3.5 xl:py-1.5 xl:text-[10px]",
                heroGlassLightInk &&
                  "border border-white/25 bg-white/95 text-[#0f3d2e] shadow-[0_8px_28px_rgba(0,0,0,0.22)] backdrop-blur-sm hover:bg-white hover:shadow-[0_10px_32px_rgba(0,0,0,0.26)] focus-visible:outline-white/80",
                heroGlassDarkInk &&
                  "border border-white/30 bg-black/45 text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md hover:border-white/40 hover:bg-black/55 focus-visible:outline-[var(--accent)]",
                !heroGlassLightInk &&
                  !heroGlassDarkInk &&
                  theme === "light" &&
                  "border border-[rgba(26,30,29,0.14)] bg-white text-[#1a1e1d] shadow-[0_1px_3px_rgba(15,61,46,0.08)] hover:border-[rgba(26,30,29,0.22)] hover:bg-[#fafaf8] focus-visible:outline-[var(--accent)]",
                !heroGlassLightInk &&
                  !heroGlassDarkInk &&
                  theme === "dark" &&
                  "border border-white/14 bg-white/[0.07] text-[#f1f5f3] shadow-none hover:border-white/22 hover:bg-white/[0.11] focus-visible:outline-[var(--accent)]",
              )}
            >
              <Percent className="h-3 w-3 shrink-0 opacity-95" strokeWidth={2} aria-hidden />
              Ипотека и финансы
            </Link>

            {(contact.phone.trim() && contact.phoneRaw.trim()) ||
            telegramHref ||
            maxHref ||
            YANDEX_REVIEWS_URL.trim() ? (
              <div className="ml-1 flex min-w-0 shrink flex-nowrap items-center justify-end gap-1.5 border-l border-[var(--header-bar-border)] pl-1.5 xl:ml-2 xl:gap-2 xl:pl-3">
                {contact.phone.trim() && contact.phoneRaw.trim() ? (
                  <a
                    href={`tel:${contact.phoneRaw}`}
                    title={`Позвонить: ${contact.phone}`}
                    className="shrink-0 whitespace-nowrap text-[10px] font-semibold tabular-nums tracking-tight transition hover:opacity-90 xl:text-[11px]"
                    style={{ color: "var(--header-bar-text)" }}
                  >
                    {contact.phone}
                  </a>
                ) : null}
                {(telegramHref || maxHref) && (
                  <div className="flex shrink-0 items-center gap-1">
                    {telegramHref ? (
                      <a
                        href={telegramHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Написать в Telegram"
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition hover:bg-black/[0.04] dark:hover:bg-white/10"
                        style={{
                          borderColor: "var(--header-bar-border)",
                          color: "var(--header-bar-text)",
                        }}
                        aria-label="Написать в Telegram"
                      >
                        <Send className="h-3 w-3" strokeWidth={2} aria-hidden />
                      </a>
                    ) : null}
                    {maxHref ? (
                      <a
                        href={maxHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Написать в Max"
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition hover:bg-black/[0.04] dark:hover:bg-white/10"
                        style={{
                          borderColor: "var(--header-bar-border)",
                          color: "var(--header-bar-text)",
                        }}
                        aria-label="Написать в Max"
                      >
                        <MaxMessengerIcon className="h-3.5 w-3.5 opacity-95" aria-hidden />
                      </a>
                    ) : null}
                  </div>
                )}
                <YandexMapsRatingChip />
              </div>
            ) : null}

            <div
              className="ml-1 flex shrink-0 flex-nowrap items-center gap-1 border-l pl-1.5 xl:ml-2 xl:gap-1.5 xl:pl-2"
              style={{ borderColor: "var(--header-bar-border)" }}
            >
              <button
                type="button"
                onClick={toggleSearch}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition hover:bg-black/[0.04] dark:hover:bg-white/10"
                style={{
                  borderColor: "var(--header-bar-border)",
                  color: "var(--header-bar-text)",
                }}
                aria-label={searchOpen ? "Закрыть поиск по сайту" : "Поиск по сайту"}
                aria-expanded={searchOpen}
              >
                <Search className="h-3 w-3" strokeWidth={2} aria-hidden />
              </button>

              <ThemeToggle variant="header" />

              <Link
                href={ACCOUNT_PORTAL_PATH}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition hover:bg-black/[0.04] dark:hover:bg-white/10"
                style={{
                  borderColor: "var(--header-bar-border)",
                  color: "var(--header-bar-text)",
                }}
                aria-label="Личный кабинет"
              >
                <UserRound className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ——— Mobile ——— */}
      <div
        className="flex items-center justify-between gap-1 border-b-0 py-1 pl-2 pr-2 min-[380px]:gap-2 min-[380px]:pl-4 min-[380px]:pr-3 lg:hidden"
        style={{ color: "var(--header-bar-text)" }}
      >
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center rounded-sm py-1 no-underline transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ outlineColor: "var(--accent)" }}
          aria-label={`${SITE_NAME} — на главную`}
        >
          <BrandLogo height={34} className="min-w-0 min-[380px]:h-[38px]" brightOnBackdrop={heroGlassLightInk} />
        </Link>
        <div className="flex min-w-0 shrink-0 items-center justify-end gap-0.5 min-[380px]:gap-1 sm:gap-1.5">
          {telegramHref ? (
            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition active:scale-[0.98] min-[380px]:h-8 min-[380px]:w-8 lg:hidden"
              style={{
                borderColor: "var(--header-bar-border)",
                color: "var(--header-bar-text)",
              }}
              aria-label="Написать в Telegram"
              title="Telegram"
            >
              <Send className="h-3 w-3 min-[380px]:h-3.5 min-[380px]:w-3.5" strokeWidth={2} aria-hidden />
            </a>
          ) : null}
          {maxHref ? (
            <a
              href={maxHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border transition active:scale-[0.98] min-[380px]:flex min-[380px]:h-8 min-[380px]:w-8 lg:hidden"
              style={{
                borderColor: "var(--header-bar-border)",
                color: "var(--header-bar-text)",
              }}
              aria-label="Написать в Max"
              title="Max"
            >
              <MaxMessengerIcon className="h-3.5 w-3.5 opacity-95 min-[380px]:h-4 min-[380px]:w-4" aria-hidden />
            </a>
          ) : null}
          <YandexMapsRatingChip compact className="h-7 px-1.5 min-[380px]:h-8 min-[380px]:px-2" />
          <div
            className="ml-0.5 flex shrink-0 items-center gap-0.5 border-l pl-1 min-[380px]:gap-1 min-[380px]:pl-1.5 sm:gap-1.5 sm:pl-2"
            style={{ borderColor: "var(--header-bar-border)" }}
          >
            <button
              type="button"
              onClick={toggleSearch}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition active:scale-[0.98] min-[380px]:h-8 min-[380px]:w-8"
              style={{
                borderColor: "var(--header-bar-border)",
                color: "var(--header-bar-text)",
              }}
              aria-label={searchOpen ? "Закрыть поиск" : "Поиск по сайту"}
              aria-expanded={searchOpen}
            >
              <Search className="h-3 w-3 min-[380px]:h-3.5 min-[380px]:w-3.5" strokeWidth={2} aria-hidden />
            </button>
            <ThemeToggle variant="header" className="h-7 w-7 min-[380px]:h-8 min-[380px]:w-8" />
            <Link
              href={ACCOUNT_PORTAL_PATH}
              className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border transition active:scale-[0.98] min-[380px]:flex min-[380px]:h-8 min-[380px]:w-8"
              style={{
                borderColor: "var(--header-bar-border)",
                color: "var(--header-bar-text)",
              }}
              aria-label="Личный кабинет"
            >
              <UserRound className="h-3 w-3 min-[380px]:h-3.5 min-[380px]:w-3.5" strokeWidth={2} aria-hidden />
            </Link>
          </div>
          <button
            type="button"
            onClick={() => {
              if (mobileMenuOpen) {
                window.dispatchEvent(new Event("close-mobile-menu"));
              } else {
                window.dispatchEvent(new Event("open-mobile-menu"));
              }
            }}
            className="flex h-7 w-7 shrink-0 flex-col items-center justify-center gap-[3px] pl-0.5 min-[380px]:h-8 min-[380px]:w-8 sm:pl-1"
            aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            ) : (
              <>
                <span className="block h-[2px] w-4 min-[380px]:w-5" style={{ backgroundColor: "var(--header-bar-text)" }} />
                <span className="block h-[2px] w-4 min-[380px]:w-5" style={{ backgroundColor: "var(--header-bar-text)" }} />
                <span className="block h-[2px] w-4 min-[380px]:w-5" style={{ backgroundColor: "var(--header-bar-text)" }} />
              </>
            )}
          </button>
        </div>
      </div>
          </div>
        </div>
      </div>

      <SiteSearchPanel open={searchOpen} onClose={closeSearch} openModal={openModal} />
    </>
  );
}
