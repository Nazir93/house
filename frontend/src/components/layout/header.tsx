"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Send, X } from "lucide-react";
import { SiteHeaderBar } from "./site-header-bar";
import { SITE_NAME } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { NAV_SECTIONS, isNavGroup, type NavSection } from "@/lib/nav-sections";
import { useModal } from "@/lib/modal-context";
import { maxChatUrlFromRawPhone, telegramChatUrlFromRawPhone } from "@/lib/messenger-links";

const MESSENGER_CHAT_PHONE = "+79046000099";

function buildGridPath(
  cols: number, rows: number, cellW: number, cellH: number,
  startCol: number, startRow: number, seed: number
): string {
  let c = startCol;
  let r = startRow;
  const pts: [number, number][] = [[c * cellW, r * cellH]];
  let rng = seed;
  const next = () => { rng = (rng * 16807 + 11) % 2147483647; return (rng & 0xffff) / 0xffff; };

  const steps = 14 + Math.floor(next() * 8);
  let dir: "h" | "v" = next() > 0.5 ? "h" : "v";
  for (let s = 0; s < steps; s++) {
    if (dir === "h") {
      const move = next() > 0.5 ? 1 : -1;
      const dist = 1 + Math.floor(next() * 3);
      for (let d = 0; d < dist; d++) {
        c += move;
        if (c < 0) c = 0;
        if (c > cols) c = cols;
        pts.push([c * cellW, r * cellH]);
      }
      dir = "v";
    } else {
      const move = next() > 0.5 ? 1 : -1;
      const dist = 1 + Math.floor(next() * 2);
      for (let d = 0; d < dist; d++) {
        r += move;
        if (r < 0) r = 0;
        if (r > rows) r = rows;
        pts.push([c * cellW, r * cellH]);
      }
      dir = "h";
    }
  }
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
}

const GRID_W = 600;
const GRID_H = 400;
const CELL = 40;
const COLS = GRID_W / CELL;
const ROWS = GRID_H / CELL;

const SPARK_PATHS = [
  buildGridPath(COLS, ROWS, CELL, CELL, 0, 2, 42),
  buildGridPath(COLS, ROWS, CELL, CELL, 2, 0, 137),
  buildGridPath(COLS, ROWS, CELL, CELL, COLS, 5, 271),
  buildGridPath(COLS, ROWS, CELL, CELL, 8, ROWS, 999),
  buildGridPath(COLS, ROWS, CELL, CELL, 5, 3, 555),
];

/** Общий список ссылок секции — для полноэкранного меню (моб. аккордеон и desktop-сетка). */
function FullscreenOverlayNavItems({
  section,
  onClose,
  openContactModal,
}: {
  section: NavSection;
  onClose: () => void;
  openContactModal: () => void;
}) {
  return (
    <>
      {section.items.map((item) =>
        isNavGroup(item) ? (
          <div key={item.label} className="w-full">
            <span
              className="mb-1 block text-xs uppercase tracking-[0.12em] max-lg:mb-0.5 sm:text-sm md:text-base"
              style={{ color: "var(--text-subtle)" }}
            >
              {item.label}
            </span>
            <div
              className="flex flex-col gap-0.5 border-l pl-3 max-lg:!gap-0 max-lg:pl-2.5 sm:gap-1 md:gap-1.5"
              style={{ borderColor: "var(--border)" }}
            >
              {item.children.map((child) =>
                "action" in child && child.action === "openModal" ? (
                  <button
                    key={child.label}
                    type="button"
                    onClick={() => {
                      onClose();
                      openContactModal();
                    }}
                    className="min-h-[44px] py-2 text-left text-sm transition-colors duration-300 hover:text-[var(--accent)] max-lg:min-h-0 max-lg:py-1 max-lg:leading-snug max-lg:text-[13px] sm:min-h-0 sm:py-1 sm:text-sm md:text-base lg:text-[15px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {child.label}
                  </button>
                ) : "href" in child ? (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    className="min-h-[44px] py-2 text-sm transition-colors duration-300 hover:text-[var(--accent)] max-lg:min-h-0 max-lg:py-1 max-lg:leading-snug max-lg:text-[13px] sm:min-h-0 sm:py-1 sm:text-sm md:text-base lg:text-[15px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {child.label}
                  </Link>
                ) : null
              )}
            </div>
          </div>
        ) : "action" in item && item.action === "openModal" ? (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              onClose();
              openContactModal();
            }}
            className="min-h-[44px] py-2 text-left text-sm transition-colors duration-300 hover:text-[var(--accent)] max-lg:min-h-0 max-lg:py-1 max-lg:leading-snug max-lg:text-[13px] sm:min-h-0 sm:py-1 sm:text-sm md:text-base lg:text-[15px]"
            style={{ color: "var(--text-muted)" }}
          >
            {item.label}
          </button>
        ) : "href" in item ? (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="min-h-[44px] py-2 text-sm transition-colors duration-300 hover:text-[var(--accent)] max-lg:min-h-0 max-lg:py-1 max-lg:leading-snug max-lg:text-[13px] sm:min-h-0 sm:py-1 sm:text-sm md:text-base lg:text-[15px]"
            style={{ color: "var(--text-muted)" }}
          >
            {item.label}
          </Link>
        ) : null
      )}
    </>
  );
}

function CircuitGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${GRID_W} ${GRID_H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="spark-glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
          </filter>
        </defs>

        {/* Grid lines — horizontal */}
        {Array.from({ length: ROWS + 1 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={0} y1={i * CELL} x2={GRID_W} y2={i * CELL}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.5"
          />
        ))}
        {/* Grid lines — vertical */}
        {Array.from({ length: COLS + 1 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * CELL} y1={0} x2={i * CELL} y2={GRID_H}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.5"
          />
        ))}

        {/* Spark paths */}
        {SPARK_PATHS.map((d, i) => (
          <g key={i}>
            {/* Glow */}
            <path
              d={d}
              fill="none"
              stroke="rgba(15,61,46,0.15)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#spark-glow)"
              strokeDasharray="80 1200"
              className="electric-snake"
              style={{
                animationDelay: `${i * 300}ms`,
                animationDuration: `${10 + i * 1.5}s`,
                ["--path-len" as string]: 1280,
              }}
            />
            {/* Core */}
            <path
              d={d}
              fill="none"
              stroke="rgba(232,212,139,0.25)"
              strokeWidth="0.8"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="80 1200"
              className="electric-snake"
              style={{
                animationDelay: `${i * 300}ms`,
                animationDuration: `${10 + i * 1.5}s`,
                ["--path-len" as string]: 1280,
              }}
            />
          </g>
        ))}

        {/* Small dots at some intersections */}
        {[
          [3, 2], [7, 4], [11, 6], [5, 8], [9, 1],
          [1, 5], [13, 3], [6, 7], [10, 9], [4, 4],
        ].map(([cx, cy], i) => (
          <circle
            key={`dot-${i}`}
            cx={cx * CELL}
            cy={cy * CELL}
            r="1.5"
            fill="rgba(15,61,46,0.08)"
          />
        ))}
      </svg>
    </div>
  );
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenuSection, setExpandedMenuSection] = useState<string | null>(null);
  const { openModal } = useModal();
  const contact = useContactConfig();
  const telegramMessengerHref = telegramChatUrlFromRawPhone(MESSENGER_CHAT_PHONE) ?? "";
  const maxMessengerHref = maxChatUrlFromRawPhone(MESSENGER_CHAT_PHONE) ?? "";

  useEffect(() => {
    const handleOpenMenu = () => setIsOpen(true);
    const handleCloseMenu = () => setIsOpen(false);
    window.addEventListener("open-mobile-menu", handleOpenMenu);
    window.addEventListener("close-mobile-menu", handleCloseMenu);
    return () => {
      window.removeEventListener("open-mobile-menu", handleOpenMenu);
      window.removeEventListener("close-mobile-menu", handleCloseMenu);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setExpandedMenuSection(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Полноэкранное меню (открывается с мобильной шапки и сайднава); верхняя полоса — в NavBar / SiteHeaderBar */}
      {/* Fullscreen menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[80] flex flex-col overflow-hidden"
          style={{ backgroundColor: "var(--bg)" }}
        >
          {/* Blueprint background */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 800 600"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
            >
              {/* Grid */}
              {Array.from({ length: 31 }, (_, i) => (
                <line key={`gh-${i}`} x1={0} y1={i * 20} x2={800} y2={i * 20} stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 41 }, (_, i) => (
                <line key={`gv-${i}`} x1={i * 20} y1={0} x2={i * 20} y2={600} stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
              ))}

              {/* DIN rail */}
              <rect x="80" y="80" width="640" height="8" rx="1" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" fill="none" />
              <rect x="80" y="200" width="640" height="8" rx="1" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" fill="none" />
              <rect x="80" y="380" width="640" height="8" rx="1" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" fill="none" />

              {/* Circuit breakers */}
              {[120, 180, 240, 300, 360, 420, 480, 540, 600, 660].map((x, i) => (
                <g key={`cb-${i}`} opacity={0.045}>
                  <rect x={x - 12} y={90} width={24} height={40} rx="2" stroke="rgba(15,61,46,1)" strokeWidth="0.8" />
                  <line x1={x} y1={90} x2={x} y2={80} stroke="rgba(15,61,46,1)" strokeWidth="0.5" />
                  <line x1={x} y1={130} x2={x} y2={145} stroke="rgba(15,61,46,1)" strokeWidth="0.5" />
                  <circle cx={x} cy={105} r="3" stroke="rgba(15,61,46,1)" strokeWidth="0.5" />
                  <line x1={x - 2} y1={103} x2={x + 2} y2={107} stroke="rgba(15,61,46,1)" strokeWidth="0.5" />
                </g>
              ))}

              {/* RCD symbols */}
              {[150, 350, 550].map((x, i) => (
                <g key={`rcd-${i}`} opacity={0.04}>
                  <rect x={x - 18} y={210} width={36} height={50} rx="3" stroke="rgba(15,61,46,1)" strokeWidth="0.8" />
                  <line x1={x} y1={200} x2={x} y2={210} stroke="rgba(15,61,46,1)" strokeWidth="0.5" />
                  <line x1={x} y1={260} x2={x} y2={280} stroke="rgba(15,61,46,1)" strokeWidth="0.5" />
                  <path d={`M${x - 8} 230 Q${x} 240 ${x + 8} 230`} stroke="rgba(15,61,46,1)" strokeWidth="0.6" />
                  <text x={x} y={253} textAnchor="middle" fill="rgba(15,61,46,1)" fontSize="6" fontFamily="monospace">T</text>
                </g>
              ))}

              {/* Wiring paths */}
              {[
                "M 120 145 L 120 200", "M 180 145 L 180 180 L 150 180 L 150 200",
                "M 300 145 L 300 200", "M 420 145 L 420 180 L 350 180 L 350 200",
                "M 540 145 L 540 180 L 550 180 L 550 200",
                "M 150 280 L 150 380", "M 350 280 L 350 340 L 400 340 L 400 380",
                "M 550 280 L 550 320 L 500 320 L 500 380",
                "M 240 145 L 240 300 L 280 300 L 280 380",
                "M 600 145 L 600 350 L 650 350 L 650 380",
              ].map((d, i) => (
                <path key={`w-${i}`} d={d} stroke="rgba(0,0,0,0.035)" strokeWidth="0.8" strokeLinejoin="round" />
              ))}

              {/* Ground symbol */}
              <g opacity={0.04}>
                <line x1={400} y1={500} x2={400} y2={520} stroke="rgba(15,61,46,1)" strokeWidth="0.8" />
                <line x1={388} y1={520} x2={412} y2={520} stroke="rgba(15,61,46,1)" strokeWidth="0.8" />
                <line x1={392} y1={525} x2={408} y2={525} stroke="rgba(15,61,46,1)" strokeWidth="0.6" />
                <line x1={396} y1={530} x2={404} y2={530} stroke="rgba(15,61,46,1)" strokeWidth="0.4" />
              </g>

              {/* Junction dots */}
              {[[120, 200], [300, 200], [150, 280], [350, 280], [550, 280], [280, 380], [400, 380], [500, 380], [650, 380]].map(([cx, cy], i) => (
                <circle key={`jd-${i}`} cx={cx} cy={cy} r="2" fill="rgba(0,0,0,0.04)" />
              ))}
            </svg>
          </div>

          {/* Один экран: без внутреннего скролла, контент уплотнён под viewport */}
          <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-[max(0.75rem,env(safe-area-inset-top,0px))] z-20 flex h-11 w-11 items-center justify-center rounded-full border bg-[var(--bg)]/90 shadow-lg backdrop-blur-md transition hover:border-[var(--accent)] hover:text-[var(--accent)] lg:right-6 lg:top-6"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
              aria-label="Закрыть меню"
            >
              <X className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </button>
            <div className="flex min-h-0 w-full flex-1 flex-row items-stretch">
            {/* Nav area — на мобильном крупнее шрифты и зоны нажатия */}
            <nav className="flex min-h-0 w-full min-w-0 flex-1 flex-col justify-between px-4 sm:px-8 md:px-10 lg:px-16 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
              {/* Экраны до lg: аккордеон */}
              <div className="flex min-h-0 flex-1 flex-col lg:hidden">
              <div className="scrollbar-none grid min-h-0 w-full flex-1 grid-cols-1 content-start gap-x-4 gap-y-1.5 overflow-y-auto overscroll-contain sm:gap-y-6 md:grid-cols-2 md:gap-x-10 md:gap-y-6 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-6 [@media(max-height:700px)]:gap-y-2 [@media(max-height:700px)]:gap-x-3">
                {NAV_SECTIONS.map((section, si) => {
                  const isExpanded = expandedMenuSection === section.label;
                  const panelId = `fs-menu-section-${si}`;
                  const triggerId = `fs-menu-trigger-${si}`;
                  return (
                  <div
                    key={section.label}
                    className="flex min-h-0 min-w-0 flex-col border-b border-[var(--border)] pb-2 sm:border-0 sm:pb-0 menu-stagger [@media(max-height:700px)]:pb-1.5"
                    style={{
                      animation: `menuFadeIn 0.6s ease-out ${si * 0.08}s both`,
                    }}
                  >
                    <button
                      type="button"
                      id={triggerId}
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      onClick={() =>
                        setExpandedMenuSection((prev) =>
                          prev === section.label ? null : section.label
                        )
                      }
                      className="touch-manipulation grid w-full min-w-0 grid-cols-[auto_1fr_auto] items-start gap-x-2 rounded-lg py-0.5 text-left outline-none ring-offset-2 ring-offset-[var(--bg)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:gap-x-3 sm:py-0"
                    >
                      <span
                        className="shrink-0 pt-1 font-heading text-xs tabular-nums tracking-[0.15em] sm:text-sm md:text-base lg:text-lg"
                        style={{ color: "var(--text-subtle)" }}
                        aria-hidden
                      >
                        {String(si + 1).padStart(2, "0")}
                      </span>
                      <h3
                        className="min-w-0 font-heading text-lg leading-[1.15] tracking-tight sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl [@media(max-height:700px)]:max-lg:text-base"
                        style={{ color: "var(--text)" }}
                      >
                        {section.label}
                      </h3>
                      <span className="shrink-0 pt-1" aria-hidden>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform duration-200 sm:h-5 sm:w-5 md:h-6 md:w-6 ${isExpanded ? "rotate-180" : ""}`}
                          style={{ color: "var(--text-subtle)" }}
                          strokeWidth={2}
                        />
                      </span>
                    </button>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      hidden={!isExpanded}
                      className={isExpanded ? "mt-1.5 max-lg:mt-1 sm:mt-3" : undefined}
                    >
                      {isExpanded && (
                      <div
                        className="flex min-w-0 flex-col gap-2 border-l pl-3 max-lg:gap-1 sm:gap-2 md:gap-2.5 lg:gap-3 [@media(max-height:700px)]:max-lg:gap-1 sm:pl-4 max-lg:pl-2.5"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <FullscreenOverlayNavItems
                          section={section}
                          onClose={() => setIsOpen(false)}
                          openContactModal={openModal}
                        />
                      </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
              </div>

              {/* lg+: прежняя сетка, все секции раскрыты */}
              <div className="hidden min-h-0 flex-1 flex-col lg:flex">
              <div className="scrollbar-none grid min-h-0 w-full flex-1 grid-cols-1 content-start gap-x-4 gap-y-6 overflow-y-auto overscroll-contain md:grid-cols-2 md:gap-x-10 md:gap-y-6 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-6 [@media(max-height:700px)]:gap-y-4 [@media(max-height:700px)]:gap-x-3">
                {NAV_SECTIONS.map((section, si) => (
                  <div
                    key={section.label}
                    className="flex min-h-0 min-w-0 flex-col border-b border-[var(--border)] pb-4 sm:border-0 sm:pb-0 menu-stagger [@media(max-height:700px)]:pb-3"
                    style={{
                      animation: `menuFadeIn 0.6s ease-out ${si * 0.08}s both`,
                    }}
                  >
                    <div className="grid min-w-0 grid-cols-[auto_1fr] gap-x-2 sm:gap-x-3">
                      <span
                        className="shrink-0 pt-1 font-heading text-xs tabular-nums tracking-[0.15em] sm:text-sm md:text-base lg:text-lg"
                        style={{ color: "var(--text-subtle)" }}
                        aria-hidden
                      >
                        {String(si + 1).padStart(2, "0")}
                      </span>
                      <h3
                        className="min-w-0 font-heading text-lg leading-[1.15] tracking-tight sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl [@media(max-height:700px)]:max-lg:text-base"
                        style={{ color: "var(--text)" }}
                      >
                        {section.label}
                      </h3>
                      <div className="col-start-2 flex min-w-0 flex-col gap-2 sm:gap-2 md:gap-2.5 lg:gap-3 [@media(max-height:700px)]:max-lg:gap-1.5">
                        <FullscreenOverlayNavItems
                          section={section}
                          onClose={() => setIsOpen(false)}
                          openContactModal={openModal}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </div>

              {/* Bottom: contacts + CTA */}
              <div
                className="shrink-0 pt-4 sm:pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-3 [@media(max-height:700px)]:pt-2 [@media(max-height:700px)]:gap-2"
                style={{ animation: "menuFadeIn 0.6s ease-out 0.4s both" }}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
                  {contact.phone.trim() && contact.phoneRaw.trim() ? (
                    <a
                      href={`tel:${contact.phoneRaw}`}
                      title="Городской телефон"
                      className="text-base font-medium tabular-nums transition-colors duration-300 hover:text-[var(--accent)] sm:text-sm md:text-base lg:text-lg"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {contact.phone}
                    </a>
                  ) : null}
                  {contact.phone2.trim() && contact.phone2Raw.trim() ? (
                    <a
                      href={`tel:${contact.phone2Raw}`}
                      title="Мобильный телефон"
                      className="text-base font-medium tabular-nums transition-colors duration-300 hover:text-[var(--accent)] sm:text-sm md:text-base lg:text-lg"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {contact.phone2}
                    </a>
                  ) : null}
                </div>
                <Link
                  href="/contacts"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-3 font-heading text-sm uppercase tracking-[0.1em] transition-all duration-500 hover:scale-[1.02] sm:min-h-0 sm:px-7 sm:py-2.5 sm:text-base md:text-lg [@media(max-height:700px)]:max-lg:py-2 [@media(max-height:700px)]:max-lg:px-5"
                  style={{ backgroundColor: "var(--sale)", color: "var(--accent-contrast)" }}
                >
                  Оставить заявку
                </Link>
              </div>
            </nav>

            {/* Right sidebar — social + vertical text */}
            <div
              className="hidden sm:flex flex-col items-center justify-between w-14 md:w-16 py-14 border-l shrink-0"
              style={{
                borderColor: "var(--border)",
                animation: "menuFadeIn 0.5s ease-out 0.3s both",
              }}
            >
              <div className="flex flex-col items-center gap-3">
                {telegramMessengerHref ? (
                  <a
                    href={telegramMessengerHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 hover:border-[var(--accent)]"
                    style={{ borderColor: "var(--border)" }}
                    aria-label="Написать в Telegram"
                    title="Telegram — чат по номеру"
                  >
                    <Send
                      size={16}
                      strokeWidth={1.75}
                      className="shrink-0 text-[var(--text-muted)] transition-colors duration-300 group-hover:text-[var(--accent)]"
                      aria-hidden
                    />
                  </a>
                ) : null}
                {maxMessengerHref ? (
                  <a
                    href={maxMessengerHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 hover:scale-110 hover:border-[var(--accent)]"
                    style={{ borderColor: "var(--border)" }}
                    aria-label="Написать в Max"
                    title="Max — чат по номеру"
                  >
                    <MaxMessengerIcon className="h-4 w-4 text-[var(--text-muted)] opacity-[0.92] transition-colors duration-300 group-hover:text-[var(--accent)] group-hover:opacity-100" aria-hidden />
                  </a>
                ) : null}
              </div>

              <span
                className="text-[8px] uppercase tracking-[0.25em] font-heading select-none"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  color: "var(--text-subtle)",
                }}
              >
                {SITE_NAME}
              </span>

              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--accent)", opacity: 0.5 }}
              />
            </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function NavBar() {
  return <SiteHeaderBar />;
}
