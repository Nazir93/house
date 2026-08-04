"use client";

import Link from "next/link";
import {
  Award,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Home,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CmsImage } from "@/components/ui/cms-image";
import { useTheme } from "@/lib/theme-context";
import { useModal } from "@/lib/modal-context";
import { HOME_HERO_BANNER_ID } from "@/lib/site-anchors";
import type { HomeHeroBanner } from "@/lib/home-hero-banner-schema";
import { HOME_HERO_LCP_QUALITY, HOME_HERO_LCP_WIDTH } from "@/lib/home-hero-lcp";
import { buildImagePrefetchSrc } from "@/lib/image-loading";
import { cn } from "@/lib/utils";

const BADGE_ICONS = [Award, Home, ShieldCheck, ClipboardCheck] as const;

/** Едва заметная «стеклянная» обводка на тёмном баннере */
const edgeGlass = "border border-white/[0.07]";
const edgeGlassStrong = "border border-white/[0.1]";

/** Интервал автопрокрутки промо-карусели на баннере. */
const PROMO_AUTO_ADVANCE_MS = 6000;

export function BannerSection({ config }: { config: HomeHeroBanner }) {
  const { theme } = useTheme();
  const { openModalToEstimate } = useModal();
  const promos = config.promos;
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [autoCycleKey, setAutoCycleKey] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const slideIndex = promos.length > 0 ? activeSlide % promos.length : 0;
  const slide = promos[slideIndex];

  const bumpAutoCycle = useCallback(() => {
    setAutoCycleKey((k) => k + 1);
  }, []);

  const goPrev = useCallback(
    (manual = false) => {
      if (promos.length <= 1) return;
      setActiveSlide((i) => (i - 1 + promos.length) % promos.length);
      if (manual) bumpAutoCycle();
    },
    [bumpAutoCycle, promos.length],
  );

  const goNext = useCallback(
    (manual = false) => {
      if (promos.length <= 1) return;
      setActiveSlide((i) => (i + 1) % promos.length);
      if (manual) bumpAutoCycle();
    },
    [bumpAutoCycle, promos.length],
  );

  useEffect(() => {
    if (promos.length <= 1 || carouselPaused) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => goNext(false), PROMO_AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [carouselPaused, goNext, promos.length, autoCycleKey]);

  useEffect(() => {
    // Фон уже priority в <CmsImage> + <link rel=preload> на главной.
    // Здесь только соседний промо-слайд через /_next/image — без полноразмерного webp.
    if (promos.length <= 1) return;
    const next = promos[(slideIndex + 1) % promos.length];
    if (!next?.image?.trim()) return;
    const img = new window.Image();
    img.decoding = "async";
    img.fetchPriority = "low";
    img.src = buildImagePrefetchSrc(next.image, 640, 75);
  }, [promos, slideIndex]);

  if (!slide) return null;

  return (
    <section
      id={HOME_HERO_BANNER_ID}
      className={cn(
        "relative isolate z-0 -mt-[var(--site-header-banner-overlap)] min-h-[100svh] min-h-[100dvh] w-full overflow-hidden transition-colors duration-500 pointer-events-none",
        theme === "dark" ? "bg-[#07110e]" : "bg-[#dfe8e3]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-colors duration-500",
          theme === "dark" ? "bg-[#07110e]" : "bg-[#dfe8e3]",
        )}
        aria-hidden
      >
        {/* Только активная тема — не грузим оба полноэкранных фона сразу (бьёт по LCP). */}
        <CmsImage
          key={theme === "dark" ? config.backgrounds.dark : config.backgrounds.light}
          src={theme === "dark" ? config.backgrounds.dark : config.backgrounds.light}
          alt=""
          fill
          priority
          fetchPriority="high"
          quality={HOME_HERO_LCP_QUALITY}
          sizes={`(max-width: ${HOME_HERO_LCP_WIDTH}px) 100vw, 100vw`}
          className="object-cover object-center"
        />
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            theme === "dark"
              ? "bg-gradient-to-r from-black/82 via-black/52 to-black/16"
              : "bg-gradient-to-r from-black/48 via-black/22 to-black/8",
          )}
        />
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            theme === "dark"
              ? "bg-gradient-to-t from-black/72 via-black/10 to-black/42"
              : "bg-gradient-to-t from-black/38 via-transparent to-black/22",
          )}
        />
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            theme === "dark"
              ? "bg-[radial-gradient(circle_at_20%_20%,rgba(246,246,244,0.16),transparent_32%),radial-gradient(circle_at_78%_72%,rgba(15,61,46,0.32),transparent_36%)]"
              : "bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.14),transparent_38%),radial-gradient(circle_at_76%_70%,rgba(15,61,46,0.18),transparent_40%)]",
          )}
        />
      </div>

      <div className="section-inline-pad relative z-10 flex w-full min-h-[100svh] min-h-[100dvh] flex-col pointer-events-none pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-[calc(var(--site-header-sticky-offset)+var(--site-header-banner-overlap)+0.75rem+env(safe-area-inset-top,0px))] md:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:pt-[calc(var(--site-header-sticky-offset)+var(--site-header-banner-overlap)+1rem+env(safe-area-inset-top,0px))]">
        <div className="grid w-full flex-1 gap-4 pointer-events-none min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(260px,min(520px,40vw))] min-[1100px]:items-end min-[1100px]:gap-6 min-[1100px]:pb-2 xl:gap-8">
          <div className="pointer-events-auto max-w-3xl justify-self-start self-end pt-0 min-[1100px]:pr-4">
            <div
              className={cn(
                "max-w-4xl rounded-2xl bg-black/42 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_48px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:rounded-[1.35rem] sm:px-5 sm:py-4",
                edgeGlass,
              )}
            >
              <h1 className="text-balance font-heading text-[clamp(1.35rem,3.35vw,3.05rem)] font-bold uppercase leading-[0.92] tracking-[-0.04em] text-white [text-shadow:0_0_1px_rgba(0,0,0,0.95),0_1px_2px_rgba(0,0,0,0.92),0_2px_16px_rgba(0,0,0,0.72),0_4px_36px_rgba(0,0,0,0.45)]">
                {config.headlineLines[0]}
                {config.headlineLines.slice(1).map((line, index) => (
                  <span
                    key={`${index}-${line}`}
                    className="block text-white/95 [text-shadow:0_0_1px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.88),0_3px_22px_rgba(0,0,0,0.65)]"
                  >
                    {line}
                  </span>
                ))}
              </h1>
            </div>
            <p
              className={cn(
                "mt-2.5 max-w-2xl text-balance rounded-lg bg-black/50 px-3 py-2 text-[13px] font-medium leading-relaxed text-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:mt-3 md:px-3.5 md:py-2.5 md:text-[15px]",
                edgeGlass,
              )}
            >
              {config.subheadline}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href="/projects"
                className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0f3d2e] shadow-[0_12px_36px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-white/95 md:px-5"
              >
                <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
                Смотреть проекты
              </Link>
              <button
                type="button"
                onClick={() => openModalToEstimate()}
                aria-label="Открыть ориентировочный расчёт стоимости строительства"
                className={cn(
                  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl bg-black/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_36px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-black/70 md:px-5",
                  edgeGlassStrong,
                  "hover:border-white/[0.14]",
                )}
              >
                <Calculator className="h-4 w-4 shrink-0" aria-hidden />
                Рассчитать стоимость
              </button>
            </div>

            <div
              className={cn(
                "mt-4 grid max-w-2xl grid-cols-1 gap-2 rounded-2xl bg-black/30 p-1.5 shadow-lg shadow-black/20 backdrop-blur-sm min-[420px]:grid-cols-3 min-[420px]:gap-1.5 sm:gap-2 sm:p-1.5",
                edgeGlass,
              )}
            >
              {config.steps.map(({ num, text }) => (
                <div key={num} className="rounded-xl bg-black/25 px-2 py-2 sm:px-2.5 sm:py-2.5">
                  <p
                    className={cn(
                      "text-[9px] font-bold tabular-nums tracking-[0.12em] sm:text-[10px]",
                      theme === "light" ? "text-white" : "text-white/82",
                    )}
                  >
                    {num}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold leading-snug text-white/95 sm:text-xs">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-auto w-full min-w-0 min-[1100px]:w-full min-[1100px]:max-w-[min(520px,40vw)] min-[1100px]:justify-self-end min-[1100px]:self-end">
            <div
              ref={carouselRef}
              role="region"
              aria-roledescription="карусель"
              aria-label="Подборка образов домов и участков"
              aria-live="polite"
              tabIndex={0}
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}
              onFocus={() => setCarouselPaused(true)}
              onBlur={(e) => {
                if (!carouselRef.current?.contains(e.relatedTarget as Node | null)) {
                  setCarouselPaused(false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  goNext(true);
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  goPrev(true);
                }
              }}
              className={cn(
                "rounded-2xl bg-black/58 shadow-[0_24px_72px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-white/15 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:rounded-[1.25rem]",
                edgeGlass,
              )}
            >
              <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4 md:pr-5 lg:pr-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4 lg:gap-5">
                  <div className="flex min-w-0 flex-1 flex-col justify-between md:max-w-[240px] md:basis-[46%] md:min-w-0 md:flex-none md:pr-1.5 lg:pr-2">
                    <div className="min-h-[5.75rem] sm:min-h-[6rem]">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/45">
                        {String(slideIndex + 1).padStart(2, "0")} · {slide.label}
                      </p>
                      <h2 className="mt-1 font-heading text-[0.9rem] font-bold leading-[1.2] tracking-tight text-white sm:text-[0.95rem] md:text-[1rem]">
                        {slide.title}
                      </h2>
                      <p className="mt-1 line-clamp-3 text-[12px] leading-snug text-white/[0.62]">
                        {slide.caption.trim()
                          ? slide.caption
                          : `Фрагмент серии — ${slide.label.toLowerCase()}.`}
                      </p>
                    </div>
                    <Link
                      href={slide.href}
                      className="mt-3 inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-white transition hover:text-white/85 md:mt-5"
                    >
                      Подробнее
                      <span aria-hidden className="-mt-px text-sm font-light leading-none">
                        →
                      </span>
                    </Link>
                  </div>
                  <div
                    className={cn(
                      "hero-carousel-media relative h-[min(48vw,280px)] w-full min-h-[200px] min-w-0 shrink-0 overflow-hidden rounded-xl bg-black/35 sm:h-[260px] sm:min-h-[230px]",
                      "md:h-[200px] md:min-h-[200px] md:max-h-[200px] md:min-w-[54%] md:flex-1",
                      "border border-white/[0.05]",
                    )}
                  >
                    {promos.map((promo, index) => {
                      const isActive = index === slideIndex;
                      const isAdjacent =
                        index === (slideIndex + 1) % promos.length ||
                        index === (slideIndex - 1 + promos.length) % promos.length;
                      // Не монтируем дальние слайды — иначе на 4G качаются все промо сразу.
                      if (!isActive && !isAdjacent) return null;
                      return (
                        <CmsImage
                          key={promo.image}
                          src={promo.image}
                          alt={isActive ? promo.label : ""}
                          fill
                          quality={75}
                          sizes="(max-width: 1023px) 96vw, 380px"
                          priority={isActive}
                          fetchPriority={isActive ? "high" : "low"}
                          loading={isActive ? "eager" : "lazy"}
                          aria-hidden={!isActive}
                          className={cn(
                            "object-cover object-center transition-opacity duration-500 ease-out",
                            isActive ? "opacity-100" : "pointer-events-none opacity-0",
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <nav
              className="mt-3 flex items-center justify-center gap-3 min-[1100px]:justify-end sm:mt-4"
              aria-label="Промо на баннере"
            >
              <div
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full bg-black/48 px-2 py-1.5 backdrop-blur-sm sm:gap-3 sm:px-3 sm:py-2",
                  edgeGlass,
                )}
              >
                <button
                  type="button"
                  onClick={() => goPrev(true)}
                  disabled={promos.length <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-35"
                  aria-label="Предыдущая акция"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
                <span className="min-w-[3.5rem] text-center text-[11px] font-medium tabular-nums text-white/70">
                  {slideIndex + 1} / {promos.length}
                </span>
                <button
                  type="button"
                  onClick={() => goNext(true)}
                  disabled={promos.length <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/10 disabled:opacity-35"
                  aria-label="Следующая акция"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </nav>
          </div>
        </div>

        <div className="pointer-events-auto mt-auto grid grid-cols-1 gap-2 pt-3 min-[400px]:grid-cols-2 sm:gap-2 lg:grid-cols-4 lg:gap-2.5">
          {config.badges.map((text, index) => {
            const Icon = BADGE_ICONS[index] ?? Award;
            return (
            <div
              key={text}
              className={cn(
                "flex min-h-[44px] min-w-0 items-center gap-2.5 overflow-hidden rounded-xl bg-black/35 px-3 py-2 shadow-md shadow-black/25 backdrop-blur-sm sm:min-h-[48px] sm:gap-3 sm:px-3.5 sm:py-2.5",
                edgeGlass,
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-950/35 sm:h-8 sm:w-8">
                <Icon className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" aria-hidden />
              </span>
              <p className="min-w-0 flex-1 hyphens-none text-left text-[11px] font-medium leading-snug tracking-tight text-white sm:text-[12px] lg:text-[11px] xl:text-[12px]">
                {text}
              </p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
