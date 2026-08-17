"use client";

import { useMemo, useId } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, LayoutGrid } from "lucide-react";

import { CmsImage } from "@/components/ui/cms-image";

import { minCatalogRubPerM2ByMaterial } from "@/lib/house-construction-calculator";
import {
  HOME_MATERIALS_SECTION_EYEBROW,
  HOME_MATERIALS_SECTION_SUBTITLE,
  HOME_MATERIALS_SECTION_TITLE,
  HOME_MATERIAL_CARDS,
} from "@/lib/home-materials-section";
import { useHouseConstructionCalculatorConfig } from "@/lib/use-house-construction-calculator-config";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

/** Фон секции: миллиметровка + схематичный план этажа и фасад (только декор). */
function MaterialsBlueprintBackdrop({ isDark }: { isDark: boolean }) {
  const gridId = useId().replace(/:/g, "");
  const gridStroke = isDark ? "rgba(255,255,255,0.055)" : "rgba(26,30,29,0.092)";
  const wall = isDark ? "rgba(255,255,255,0.14)" : "rgba(15,61,46,0.2)";
  const wallSoft = isDark ? "rgba(255,255,255,0.09)" : "rgba(15,61,46,0.13)";
  const dim = isDark ? "rgba(255,255,255,0.065)" : "rgba(26,30,29,0.1)";

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <svg
        className="h-full w-full min-h-[480px] opacity-[0.98]"
        viewBox="0 0 1200 720"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id={gridId} width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke={gridStroke} strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridId})`} />

        {/* Фасад (слева) */}
        <g transform="translate(72 140)" opacity={isDark ? 0.72 : 0.78}>
          <path
            d="M 24 200 V 95 L 132 12 L 240 95 V 200 H 24 Z"
            fill="none"
            stroke={wall}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <rect x="96" y="128" width="44" height="72" fill="none" stroke={wallSoft} strokeWidth="1" />
          <line x1="118" y1="128" x2="118" y2="200" stroke={wallSoft} strokeWidth="0.85" strokeDasharray="3 3" />
          <rect x="168" y="108" width="52" height="36" fill="none" stroke={wall} strokeWidth="1.35" />
          <rect x="44" y="118" width="40" height="32" fill="none" stroke={wall} strokeWidth="1.35" />
          <line x1="0" y1="212" x2="276" y2="212" stroke={dim} strokeWidth="0.8" strokeDasharray="4 6" />
          <text
            x="138"
            y="235"
            textAnchor="middle"
            fill={dim}
            style={{ fontSize: "11px", fontFamily: "ui-monospace, monospace", letterSpacing: "0.14em" }}
          >
            ФАСАД
          </text>
        </g>

        {/* План этажа (центр‑право) */}
        <g transform="translate(468 96)" opacity={isDark ? 0.88 : 0.9}>
          <rect x="0" y="48" width="420" height="248" fill="none" stroke={wall} strokeWidth="1.25" />
          <line x1="210" y1="48" x2="210" y2="296" stroke={wallSoft} strokeWidth="1" />
          <line x1="0" y1="172" x2="420" y2="172" stroke={wallSoft} strokeWidth="1" />
          <line x1="300" y1="172" x2="300" y2="296" stroke={wallSoft} strokeWidth="1" strokeDasharray="5 4" />
          <line x1="48" y1="48" x2="108" y2="48" stroke={wall} strokeWidth="2.2" />
          <line x1="290" y1="48" x2="372" y2="48" stroke={wall} strokeWidth="2.2" />
          <path
            d="M 182 296 L 182 268 A 14 14 0 0 1 210 268 L 210 296"
            fill="none"
            stroke={wall}
            strokeWidth="1.1"
          />
          <line x1="-24" y1="48" x2="-8" y2="48" stroke={dim} strokeWidth="0.75" />
          <line x1="-24" y1="296" x2="-8" y2="296" stroke={dim} strokeWidth="0.75" />
          <line x1="-16" y1="48" x2="-16" y2="296" stroke={dim} strokeWidth="0.75" strokeDasharray="3 4" />
          <line x1="424" y1="48" x2="440" y2="48" stroke={dim} strokeWidth="0.75" />
          <line x1="424" y1="296" x2="440" y2="296" stroke={dim} strokeWidth="0.75" />
          <line x1="432" y1="48" x2="432" y2="296" stroke={dim} strokeWidth="0.75" strokeDasharray="3 4" />
          <text
            x="210"
            y="28"
            textAnchor="middle"
            fill={dim}
            style={{ fontSize: "11px", fontFamily: "ui-monospace, monospace", letterSpacing: "0.14em" }}
          >
            ПЛАН 1‑ГО ЭТАЖА
          </text>
        </g>

        {/* Лёгкий второй контур справа (глубина) */}
        <g transform="translate(880 200)" opacity={isDark ? 0.35 : 0.42}>
          <rect x="0" y="0" width="200" height="140" fill="none" stroke={wallSoft} strokeWidth="0.9" strokeDasharray="6 5" />
          <line x1="0" y1="70" x2="200" y2="70" stroke={wallSoft} strokeWidth="0.75" strokeDasharray="4 5" />
        </g>
      </svg>
    </div>
  );
}

function formatPricePerM2(n: number) {
  return `от ${n.toLocaleString("ru-RU")} ₽ / м²`;
}

const MATERIAL_PRICE_KEY = {
  gazobeton: "gas",
  keramoblok: "ceramic",
  kirpich: "brick",
} as const;

export function ProjectsConstructorSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { config } = useHouseConstructionCalculatorConfig();
  const mins = useMemo(() => minCatalogRubPerM2ByMaterial(config), [config]);

  const materialCards = useMemo(
    () =>
      HOME_MATERIAL_CARDS.map((card) => ({
        ...card,
        pricePerM2: formatPricePerM2(mins[MATERIAL_PRICE_KEY[card.id]]),
      })),
    [mins],
  );

  return (
    <section
      id="projects-constructor"
      className="relative isolate overflow-hidden border-b border-[var(--border)] bg-[var(--bg)] py-10 transition-[background-color,border-color] duration-500 sm:py-12 md:py-14"
    >
      <MaterialsBlueprintBackdrop isDark={isDark} />

      {/* Лёгкий акцент поверх общего фона темы — без отдельного «зелёного/мятного» полотна */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          isDark
            ? "bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(61,143,110,0.09),transparent_52%)]"
            : "bg-[radial-gradient(ellipse_95%_55%_at_50%_-5%,rgba(15,61,46,0.045),transparent_48%)]",
        )}
        aria-hidden
      />

      <div className="section-inline-pad relative z-10 mx-auto max-w-[1280px]">
        <div className="mb-8 md:mb-10">
          <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 w-full flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                {HOME_MATERIALS_SECTION_EYEBROW}
              </p>
              <h2 className="mt-3 w-full max-w-none text-balance font-heading text-[clamp(1.05rem,2.85vw,1.85rem)] font-bold uppercase leading-[1.15] tracking-[-0.03em] text-[var(--text)] sm:text-[clamp(1.12rem,3vw,2.05rem)]">
                {HOME_MATERIALS_SECTION_TITLE}
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:mt-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-x-5 sm:gap-y-2">
              <Link
                href="/services"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[var(--text)] underline-offset-4 transition hover:text-[var(--accent)] hover:underline sm:text-[15px]"
              >
                Смотреть все услуги
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--text)]/88 dark:text-[var(--text-muted)] md:text-[15px]">
            {HOME_MATERIALS_SECTION_SUBTITLE}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {materialCards.map((card, i) => (
            <article
              key={card.id}
              className={cn(
                "flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-[0_12px_40px_rgba(15,61,46,0.08)] backdrop-blur-sm transition-colors duration-500 sm:rounded-[1.25rem]",
                "dark:border-white/[0.08] dark:bg-[var(--card-bg)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.35)]",
              )}
            >
              <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <CmsImage
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
                  className="object-contain object-center transition duration-700 ease-out hover:scale-[1.02]"
                  priority={i === 0}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/45 to-transparent"
                  aria-hidden
                />
                <div className="pointer-events-none absolute bottom-3 left-4 right-4 md:bottom-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.75)]">
                    Старт за м² · {card.labelShort}
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold tabular-nums tracking-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_2px_12px_rgba(0,0,0,0.55)] md:text-2xl">
                    {card.pricePerM2}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                <h3 className="font-heading text-base font-bold uppercase leading-snug tracking-tight text-[var(--text)] sm:text-[1.05rem]">
                  <Link
                    href={card.seoPath}
                    className="transition hover:text-[var(--accent)]"
                  >
                    {card.title}
                  </Link>
                </h3>
                <p className="flex-1 text-[13px] leading-snug text-[var(--text)]/85 dark:text-[var(--text-muted)]">
                  {card.description}
                </p>
                <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Link
                    href={card.projectsHref}
                    className={cn(
                      "inline-flex min-h-[42px] flex-1 items-center justify-center gap-1 rounded-full px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.06em] whitespace-nowrap shadow-sm transition sm:min-w-[140px]",
                      "bg-[#e8f3eb] text-[#0f3d2e] hover:bg-[#dcefe2]",
                      "dark:bg-emerald-950/55 dark:text-emerald-50 dark:shadow-none dark:ring-1 dark:ring-white/10 dark:hover:bg-emerald-900/65",
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                    Проекты домов
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-95" strokeWidth={2.25} aria-hidden />
                  </Link>
                  <Link
                    href={card.completionHref}
                    className={cn(
                      "inline-flex min-h-[42px] flex-1 items-center justify-center gap-1 rounded-full border px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.06em] whitespace-nowrap shadow-sm transition sm:min-w-[140px]",
                      "border-black/[0.08] bg-[var(--bg)] text-[var(--text)] dark:border-white/12 dark:bg-transparent",
                      "hover:border-black/14 hover:bg-[#f4f8f6] dark:hover:bg-white/[0.06]",
                    )}
                  >
                    Комплектация
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2.25} aria-hidden />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
