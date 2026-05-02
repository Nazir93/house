"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Home,
  LayoutGrid,
  MapPinned,
  Percent,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

/** Полноэкранный фон главного баннера: тёмная тема — «ночной» кадр, светлая — дневной */
const HERO_THEME_BG = {
  dark: "/images/banner/hero-theme-night.png",
  light: "/images/banner/hero-theme-day.png",
} as const;

const BADGES = [
  {
    icon: MapPinned,
    text: "Находимся в 6 регионах России",
  },
  {
    icon: Home,
    text: "Построили более 540 домов с 2016 года",
  },
  {
    icon: Percent,
    text: "Ипотечное кредитование от 3%",
  },
  {
    icon: ShieldCheck,
    text: "Предоставляем гарантии на все работы",
  },
] as const;

const HERO_SLIDES = [
  {
    image: "/images/banner/banner-hero-01.png",
    label: "Сумерки",
    title: "Дом среди деревьев",
    caption: "Подсветка, панорамные окна и уют террасы в сумерках.",
  },
  {
    image: "/images/banner/banner-hero-02.png",
    label: "Современный фасад",
    title: "Строгие линии и свет",
    caption: "Крупное остекление, дорожки и ландшафт в единой стилистике.",
  },
  {
    image: "/images/banner/banner-hero-03.png",
    label: "Участок и дом",
    title: "Продуманный облик",
    caption: "",
  },
  {
    image: "/images/banner/banner-hero-04.png",
    label: "Тёплые материалы",
    title: "Дерево и камень",
    caption: "Контраст фактур и мягкая подсветка фасада в пасмурный день.",
  },
  {
    image: "/images/banner/banner-hero-05.png",
    label: "Вечер на участке",
    title: "Свет из окон и терраса",
    caption: "Планировка в форме «Г», зона отдыха и природный антураж.",
  },
  {
    image: "/images/banner/banner-hero-06.png",
    label: "Бассейн и лаунж",
    title: "Загородная жизнь",
    caption: "Вода у дома, зона отдыха и аккуратный ландшафт до лесной кромки.",
  },
] as const;

export function BannerSection() {
  const { theme } = useTheme();
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = HERO_SLIDES[activeSlide] ?? HERO_SLIDES[0];

  return (
    <section
      className={cn(
        "relative isolate -mt-[var(--site-header-banner-overlap)] min-h-[min(100svh,820px)] w-full overflow-hidden transition-colors duration-500",
        theme === "dark" ? "bg-[#07110e]" : "bg-[#dfe8e3]",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-500",
          theme === "dark" ? "bg-[#07110e]" : "bg-[#dfe8e3]",
        )}
        aria-hidden
      >
        <Image
          src={HERO_THEME_BG.dark}
          alt=""
          fill
          priority={theme === "dark"}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-700 ease-out",
            theme === "dark" ? "opacity-100" : "opacity-0",
          )}
        />
        <Image
          src={HERO_THEME_BG.light}
          alt=""
          fill
          priority={theme === "light"}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-700 ease-out",
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

      <div className="relative z-10 mx-auto flex min-h-[min(100svh,820px)] max-w-[1440px] flex-col px-4 pb-5 pt-[calc(5.25rem+var(--site-header-banner-overlap))] md:px-8 md:pb-7 md:pt-[calc(6rem+var(--site-header-banner-overlap))] lg:px-12 lg:pt-[calc(6.75rem+var(--site-header-banner-overlap))]">
        <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,380px)] lg:items-start lg:gap-8">
          <div className="max-w-3xl pt-0">
            <div className="max-w-4xl rounded-2xl border border-black/35 bg-black/42 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_48px_rgba(0,0,0,0.55)] backdrop-blur-md sm:rounded-[1.35rem] sm:px-5 sm:py-4">
              <h1 className="text-balance font-heading text-[clamp(1.65rem,4.2vw,3.85rem)] font-bold uppercase leading-[0.92] tracking-[-0.04em] text-white [text-shadow:0_0_1px_rgba(0,0,0,0.95),0_1px_2px_rgba(0,0,0,0.92),0_2px_16px_rgba(0,0,0,0.72),0_4px_36px_rgba(0,0,0,0.45)]">
                Строим дома,
                <span className="block text-white/95 [text-shadow:0_0_1px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.88),0_3px_22px_rgba(0,0,0,0.65)]">
                  в которые хочется
                </span>
                <span className="block text-white/95 [text-shadow:0_0_1px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.88),0_3px_22px_rgba(0,0,0,0.65)]">
                  возвращаться
                </span>
              </h1>
            </div>
            <p className="mt-3 max-w-2xl text-balance rounded-lg border border-black/40 bg-black/50 px-3 py-2.5 text-sm font-medium leading-relaxed text-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md md:mt-4 md:px-4 md:py-3 md:text-base">
              От идеи и выбора проекта до коробки, инженерии и отделки под ключ. Работаем с
              прозрачной сметой, понятными этапами и личным сопровождением.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href="/projects"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#0f3d2e] shadow-[0_12px_36px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-white/95 md:px-6"
              >
                <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
                Смотреть проекты
              </Link>
              <Link
                href="/mortgage"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-black/40 bg-black/55 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_36px_rgba(0,0,0,0.25)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-emerald-800/35 hover:bg-black/70 md:px-6"
              >
                <Percent className="h-4 w-4 shrink-0" aria-hidden />
                Ипотека и финансы
              </Link>
            </div>

            <div className="mt-5 grid max-w-2xl grid-cols-3 gap-1.5 rounded-2xl border border-black/35 bg-black/30 p-1.5 shadow-lg shadow-black/20 backdrop-blur-md sm:gap-2 sm:p-2">
              {[
                ["01", "Фиксируем смету"],
                ["02", "Проект + стройка"],
                ["03", "Гарантия по договору"],
              ].map(([num, text]) => (
                <div key={num} className="rounded-xl bg-black/25 px-2 py-2 sm:px-2.5 sm:py-2.5">
                  <p className="text-[9px] font-bold text-white/42 sm:text-[10px]">{num}</p>
                  <p className="mt-0.5 text-[11px] font-semibold leading-snug text-white/95 sm:text-xs">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md justify-self-end lg:max-w-none">
            <div className="mb-3 overflow-hidden rounded-2xl border border-black/40 bg-black/35 p-1.5 shadow-xl shadow-black/35 backdrop-blur-md sm:rounded-[1.35rem] sm:p-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.1rem] bg-black/30 sm:rounded-[1.2rem]">
                <Image
                  src={slide.image}
                  alt={slide.label}
                  fill
                  sizes="(max-width: 1024px) 90vw, 380px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-3.5">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/70 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] sm:text-[10px]">
                    {slide.label}
                  </p>
                  <p className="mt-0.5 font-heading text-base font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-lg">
                    {slide.title}
                  </p>
                  {slide.caption ? (
                    <p className="mt-1.5 rounded-lg bg-black/55 px-2.5 py-2 text-[11px] font-medium leading-snug text-white shadow-[0_4px_24px_rgba(0,0,0,0.55)] backdrop-blur-md [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] sm:text-xs">
                      {slide.caption}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:mt-2 sm:gap-2">
                {HERO_SLIDES.map((item, idx) => (
                  <button
                    key={item.image}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={cn(
                      "relative h-14 overflow-hidden rounded-xl border text-left transition sm:h-16",
                      idx === activeSlide
                        ? theme === "dark"
                          ? "border-transparent opacity-100 ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[#07110e]"
                          : "border-transparent opacity-100 ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[#dfe8e3]"
                        : "border-black/40 opacity-64 hover:border-black/50 hover:opacity-90",
                    )}
                    aria-label={`Показать слайд: ${item.label}`}
                  >
                    <Image src={item.image} alt="" fill sizes="140px" className="object-cover" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-semibold uppercase leading-tight tracking-[0.08em] text-white sm:bottom-1.5 sm:text-[10px]">
                      {String(idx + 1).padStart(2, "0")} · {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto grid gap-2 pt-4 sm:grid-cols-2 sm:gap-2.5 lg:grid-cols-4 lg:gap-3">
          {BADGES.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2.5 rounded-xl border border-black/35 bg-black/35 px-3 py-2 shadow-md shadow-black/25 backdrop-blur-md sm:gap-3 sm:px-3.5 sm:py-2.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-950/35 sm:h-9 sm:w-9">
                <Icon className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]" aria-hidden />
              </span>
              <p className="text-xs font-medium leading-snug text-white sm:text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--bg)] to-transparent" aria-hidden />
    </section>
  );
}
