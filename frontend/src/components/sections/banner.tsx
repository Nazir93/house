"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Calculator,
  Home,
  LayoutGrid,
  MapPinned,
  Percent,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { useTheme } from "@/lib/theme-context";
import { useModal } from "@/lib/modal-context";
import { HOME_HERO_BANNER_ID } from "@/lib/site-anchors";
import { cn } from "@/lib/utils";

/** Полноэкранный фон главного баннера: тёмная тема — «ночной» кадр, светлая — дневной */
const HERO_THEME_BG = {
  dark: "/images/banner/hero-theme-night.png",
  light: "/images/banner/hero-theme-day.png",
} as const;

const BADGES = [
  {
    icon: MapPinned,
    text: "Находимся в\u00A06\u00A0регионах России",
  },
  {
    icon: Home,
    text: "Построили более\u00A0540\u00A0домов с\u00A02016\u00A0года",
  },
  {
    icon: Percent,
    text: "Ипотечное кредитование от\u00A03%",
  },
  {
    icon: ShieldCheck,
    text: "Предоставляем гарантии на\u00A0все\u00A0работы",
  },
] as const;

const HERO_SLIDES = [
  {
    image: "/images/banner/banner-hero-01.png",
    label: "Сумерки",
    title: "Дом среди деревьев",
    caption: "Подсветка, панорамные окна и уют террасы в сумерках.",
    href: "/projects",
  },
  {
    image: "/images/banner/banner-hero-02.png",
    label: "Современный фасад",
    title: "Строгие линии и свет",
    caption: "Крупное остекление, дорожки и ландшафт в единой стилистике.",
    href: "/projects",
  },
  {
    image: "/images/banner/banner-hero-03.png",
    label: "Участок и дом",
    title: "Продуманный облик",
    caption: "",
    href: "/projects",
  },
  {
    image: "/images/banner/banner-hero-04.png",
    label: "Тёплые материалы",
    title: "Дерево и камень",
    caption: "Контраст фактур и мягкая подсветка фасада в пасмурный день.",
    href: "/projects",
  },
  {
    image: "/images/banner/banner-hero-05.png",
    label: "Вечер на участке",
    title: "Свет из окон и терраса",
    caption: "Планировка в форме «Г», зона отдыха и природный антураж.",
    href: "/projects",
  },
  {
    image: "/images/banner/banner-hero-06.png",
    label: "Бассейн и лаунж",
    title: "Загородная жизнь",
    caption: "Вода у дома, зона отдыха и аккуратный ландшафт до лесной кромки.",
    href: "/projects",
  },
] as const;

/** Три вкладки — по два слайда в каждой (стрелки по-прежнему листают все 6). */
const HERO_TAB_GROUPS = [
  { labelShort: "Свет · фасад", labelFull: "Сумерки и фасад" },
  { labelShort: "Участок", labelFull: "Участок и материалы" },
  { labelShort: "Вечер · отдых", labelFull: "Вечер и лаунж" },
] as const;

/** Едва заметная «стеклянная» обводка на тёмном баннере — без жёсткого чёрного/белого контура */
const edgeGlass = "border border-white/[0.07]";
const edgeGlassStrong = "border border-white/[0.1]";

export function BannerSection() {
  const { theme } = useTheme();
  const { openModalToEstimate } = useModal();
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = HERO_SLIDES[activeSlide] ?? HERO_SLIDES[0];

  return (
    <section
      id={HOME_HERO_BANNER_ID}
      className={cn(
        "relative isolate -mt-[var(--site-header-banner-overlap)] min-h-[min(100svh,700px)] w-full overflow-hidden transition-colors duration-500",
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
        <Image
          src={HERO_THEME_BG.dark}
          alt=""
          fill
          priority={theme === "dark"}
          fetchPriority={theme === "dark" ? "high" : "low"}
          loading={theme === "dark" ? "eager" : "lazy"}
          sizes="100vw"
          quality={82}
          className={cn(
            "object-cover object-center transition-opacity duration-700 ease-out",
            theme === "dark" ? "opacity-100" : "opacity-0",
          )}
        />
        <Image
          src={HERO_THEME_BG.light}
          alt=""
          fill
          priority={theme === "light"}
          fetchPriority={theme === "light" ? "high" : "low"}
          loading={theme === "light" ? "eager" : "lazy"}
          sizes="100vw"
          quality={82}
          className={cn(
            "object-cover object-center transition-opacity duration-700 ease-out",
            theme === "light" ? "opacity-100" : "opacity-0",
          )}
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

      <div className="section-inline-pad relative z-10 flex w-full min-h-[min(100svh,720px)] flex-col pointer-events-none pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-[calc(4.5rem+var(--site-header-banner-overlap)+env(safe-area-inset-top,0px))] sm:min-h-[min(100svh,700px)] md:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:pt-[calc(5.25rem+var(--site-header-banner-overlap)+env(safe-area-inset-top,0px))] lg:pt-[calc(5.75rem+var(--site-header-banner-overlap)+env(safe-area-inset-top,0px))]">
        <div className="pointer-events-auto grid w-full flex-1 gap-4 min-[1100px]:grid-cols-[minmax(0,1fr)_minmax(260px,min(520px,40vw))] min-[1100px]:items-stretch min-[1100px]:gap-6 xl:gap-8">
          <div className="max-w-3xl justify-self-start self-start pt-0 min-[1100px]:pr-4">
            <div
              className={cn(
                "max-w-4xl rounded-2xl bg-black/42 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_48px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:rounded-[1.35rem] sm:px-5 sm:py-4",
                edgeGlass,
              )}
            >
              <h1 className="text-balance font-heading text-[clamp(1.35rem,3.35vw,3.05rem)] font-bold uppercase leading-[0.92] tracking-[-0.04em] text-white [text-shadow:0_0_1px_rgba(0,0,0,0.95),0_1px_2px_rgba(0,0,0,0.92),0_2px_16px_rgba(0,0,0,0.72),0_4px_36px_rgba(0,0,0,0.45)]">
                Строим дома,
                <span className="block text-white/95 [text-shadow:0_0_1px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.88),0_3px_22px_rgba(0,0,0,0.65)]">
                  в которые хочется
                </span>
                <span className="block text-white/95 [text-shadow:0_0_1px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.88),0_3px_22px_rgba(0,0,0,0.65)]">
                  возвращаться
                </span>
              </h1>
            </div>
            <p
              className={cn(
                "mt-2.5 max-w-2xl text-balance rounded-lg bg-black/50 px-3 py-2 text-[13px] font-medium leading-relaxed text-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:mt-3 md:px-3.5 md:py-2.5 md:text-[15px]",
                edgeGlass,
              )}
            >
              От идеи и выбора проекта до коробки, инженерии и отделки под ключ. Работаем с
              прозрачной сметой, понятными этапами и личным сопровождением.
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
              {[
                ["01", "Фиксируем смету"],
                ["02", "Проект + стройка"],
                ["03", "Гарантия по договору"],
              ].map(([num, text]) => (
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

          <div className="w-full min-w-0 min-[1100px]:w-full min-[1100px]:max-w-[min(520px,40vw)] min-[1100px]:justify-self-end min-[1100px]:self-end">
            <div
              role="region"
              aria-roledescription="карусель"
              aria-label="Подборка образов домов и участков"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  setActiveSlide((i) => (i + 1) % HERO_SLIDES.length);
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  setActiveSlide((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
                }
              }}
              className={cn(
                "rounded-2xl bg-black/58 shadow-[0_24px_72px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-white/15 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:rounded-[1.25rem]",
                edgeGlass,
              )}
            >
              <div className="flex flex-col gap-3 p-3 sm:gap-4 sm:p-4 md:pr-5 lg:pr-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 lg:gap-5">
                  <div className="flex min-w-0 flex-1 flex-col justify-between md:max-w-[240px] md:basis-[46%] md:min-w-0 md:flex-none md:pr-1.5 lg:pr-2">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/45">
                        {String(activeSlide + 1).padStart(2, "0")} · {slide.label}
                      </p>
                      <h2 className="mt-1 font-heading text-[0.9rem] font-bold leading-[1.2] tracking-tight text-white sm:text-[0.95rem] md:text-[1rem]">
                        {slide.title}
                      </h2>
                      <p className="mt-1 text-[12px] leading-snug text-white/[0.62]">
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
                    <Image
                      key={slide.image}
                      src={slide.image}
                      alt={slide.label}
                      fill
                      quality={85}
                      sizes="(max-width: 1023px) 96vw, 380px"
                      priority={activeSlide === 0}
                      fetchPriority={activeSlide === 0 ? "high" : "low"}
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            <nav
              className="pointer-events-auto mt-3 flex justify-center min-[1100px]:justify-end sm:mt-4"
              aria-label="Группы слайдов"
            >
              <div
                className={cn(
                  "flex shrink-0 flex-nowrap items-center justify-center gap-2 rounded-full bg-black/48 px-3.5 py-2 backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2",
                  edgeGlass,
                )}
              >
                {HERO_TAB_GROUPS.map((tab, dotIdx) => {
                  const groupStart = dotIdx * 2;
                  const inGroup =
                    activeSlide >= groupStart && activeSlide < groupStart + 2;
                  return (
                    <button
                      key={tab.labelFull}
                      type="button"
                      aria-label={tab.labelFull}
                      aria-current={inGroup ? "true" : undefined}
                      onClick={() =>
                        setActiveSlide((prev) =>
                          prev === groupStart ? groupStart + 1 : groupStart,
                        )
                      }
                      className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center sm:min-h-0 sm:min-w-0 sm:p-0"
                    >
                      <span
                        className={cn(
                          "block h-2 w-2 shrink-0 rounded-full transition-[background-color,opacity] duration-200",
                          inGroup ? "bg-white" : "bg-white/45 hover:bg-white/55",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>

        <div className="pointer-events-auto mt-auto grid grid-cols-1 gap-2 pt-3 min-[400px]:grid-cols-2 sm:gap-2 lg:grid-cols-4 lg:gap-2.5">
          {BADGES.map(({ icon: Icon, text }) => (
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
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg)] to-transparent" aria-hidden />
    </section>
  );
}
