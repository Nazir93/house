"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, LayoutGrid, Menu, Phone, ShieldCheck, X } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { CmsImage } from "@/components/ui/cms-image";
import {
  ADVERTISING_LP_NAV,
  type AdvertisingLandingConfig,
} from "@/lib/advertising-landing";
import { formatRub } from "@/lib/construction-shared";
import { PHONE, PHONE_RAW, WORKING_HOURS } from "@/lib/constants";
import { resolveLpThemeSpec, type LpThemeSpec } from "@/lib/lp-themes";
import { cn } from "@/lib/utils";

/** Матовый стеклянный фон героя — inline, чтобы opacity не ломалась в Tailwind. */
const matteGlassStyle = {
  backgroundColor: "rgba(8, 16, 13, 0.64)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 24px 70px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
} as const;

type HeroProps = {
  config: AdvertisingLandingConfig;
  heroImage: string;
  theme: LpThemeSpec;
  /** Минимальная цена проекта в каталоге (руб.) для подписи «от …». */
  priceFromRub?: number | null;
};

function HeroPriceLine({
  config,
  priceFromRub,
  light,
}: {
  config: AdvertisingLandingConfig;
  priceFromRub?: number | null;
  light?: boolean;
}) {
  const hint =
    config.heroPriceHint?.trim() ||
    (priceFromRub && priceFromRub > 0 ? `Типовые проекты под ключ — от ${formatRub(priceFromRub)}` : null);
  if (!hint) return null;
  return (
    <p
      className={cn(
        "mt-3 text-sm font-semibold md:text-[15px]",
        light ? "text-[var(--accent)]" : "text-emerald-200/95",
      )}
    >
      {hint}
    </p>
  );
}

function LpHeroHeader({ scrolled }: { scrolled: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  const barBg = scrolled ? "#0e1814" : "rgba(14, 24, 20, 0.94)";

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
      <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-4 lg:px-5">
        <div
          className={cn(
            "relative flex items-center justify-between gap-2 rounded-2xl px-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.38)] backdrop-blur-xl transition-all duration-300 sm:gap-3 sm:px-4",
            scrolled ? "min-h-[56px] sm:min-h-[60px]" : "min-h-[60px] sm:min-h-[68px] lg:min-h-[72px]",
          )}
          style={{ backgroundColor: barBg, color: "#ffffff" }}
        >
          <div
            className="pointer-events-none absolute inset-x-5 bottom-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
            }}
            aria-hidden
          />

          <Link href="/" className="relative z-10 shrink-0 pl-0.5" aria-label="Часть души — на главную">
            <BrandLogo height={30} brightOnBackdrop className="sm:h-[34px] lg:h-[36px]" />
          </Link>

          <nav
            className="relative z-10 hidden items-center gap-0.5 rounded-full px-1 py-1 lg:flex"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            aria-label="Разделы страницы"
          >
            {ADVERTISING_LP_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-2.5 py-2 text-[12px] font-semibold tracking-wide transition hover:bg-white/15 xl:px-3.5"
                style={{ color: "#f5f7f6" }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <a
              href={`tel:${PHONE_RAW}`}
              className="hidden items-center gap-2 rounded-xl px-2 py-1.5 text-right transition hover:bg-white/10 md:flex"
              style={{ color: "#ffffff" }}
            >
              <Phone className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              <span>
                <span className="block text-sm font-bold leading-tight">{PHONE}</span>
                <span className="block text-[11px] leading-tight opacity-75">{WORKING_HOURS}</span>
              </span>
            </a>
            <a
              href={`tel:${PHONE_RAW}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white/15 md:hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#ffffff" }}
              aria-label={`Позвонить ${PHONE}`}
            >
              <Phone className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="#lead-form"
              className="inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-[10px] font-bold uppercase tracking-[0.08em] shadow-[0_10px_28px_rgba(15,61,46,0.35)] transition hover:-translate-y-0.5 hover:opacity-95 sm:min-h-11 sm:px-5 sm:text-xs"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
              onClick={() => setMenuOpen(false)}
            >
              <span className="sm:hidden">Звонок</span>
              <span className="hidden sm:inline">Перезвоните мне</span>
            </a>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white/15 lg:hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#ffffff" }}
              aria-expanded={menuOpen}
              aria-controls="lp-mobile-nav"
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div
            id="lp-mobile-nav"
            className="mt-2 overflow-hidden rounded-2xl p-3 shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:hidden"
            style={{ backgroundColor: "#0e1814", color: "#ffffff" }}
          >
            <nav className="grid gap-1" aria-label="Мобильная навигация">
              {ADVERTISING_LP_NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
                  style={{ color: "#f5f7f6" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <a
              href={`tel:${PHONE_RAW}`}
              className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 md:hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#ffffff" }}
              onClick={() => setMenuOpen(false)}
            >
              <Phone className="h-4 w-4 opacity-90" aria-hidden />
              <span>
                <span className="block text-sm font-bold">{PHONE}</span>
                <span className="block text-xs opacity-70">{WORKING_HOURS}</span>
              </span>
            </a>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function HeroCtas({
  config,
  heroMainCta,
  heroMainHref,
  light,
}: {
  config: AdvertisingLandingConfig;
  heroMainCta: string;
  heroMainHref: string;
  light?: boolean;
}) {
  if (light) {
    return (
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a
          href="#lead-form"
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold uppercase tracking-[0.1em] text-white shadow-lg transition hover:-translate-y-0.5 sm:w-auto"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <Calculator className="h-4 w-4 shrink-0" aria-hidden />
          {config.primaryCta}
        </a>
        <a
          href={heroMainHref}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--bg)] px-5 text-xs font-bold uppercase tracking-[0.1em] shadow-[0_10px_28px_rgba(15,61,46,0.08)] transition hover:-translate-y-0.5 sm:w-auto"
          style={{ color: "var(--text)" }}
        >
          <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
          {heroMainCta}
        </a>
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row sm:flex-wrap">
      <a
        href="#lead-form"
        className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] shadow-[0_12px_32px_rgba(15,61,46,0.35)] transition hover:-translate-y-0.5 sm:w-auto md:px-5"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
      >
        <Calculator className="h-4 w-4 shrink-0" aria-hidden />
        {config.primaryCta}
      </a>
      <a
        href={heroMainHref}
        className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition hover:-translate-y-0.5 hover:bg-white/15 sm:w-auto md:px-5"
        style={{ backgroundColor: "rgba(0,0,0,0.42)", border: "1px solid rgba(255,255,255,0.14)" }}
      >
        <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
        {heroMainCta}
      </a>
    </div>
  );
}

function DarkHeroBackdrop({ heroImage, theme }: { heroImage: string; theme: LpThemeSpec }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <CmsImage src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/52 to-black/16" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-black/42" />
      <div
        className="absolute inset-0"
        style={{
          background: theme.heroWarmTint
            ? `radial-gradient(circle at 20% 20%, rgba(246,246,244,0.14), transparent 32%), radial-gradient(circle at 78% 72%, rgba(15,61,46,0.32), transparent 36%), radial-gradient(circle at 50% 100%, ${theme.heroWarmTint}, transparent 55%)`
            : "radial-gradient(circle at 20% 20%, rgba(246,246,244,0.14), transparent 32%), radial-gradient(circle at 78% 72%, rgba(15,61,46,0.32), transparent 36%)",
        }}
      />
    </div>
  );
}

function CinematicCenterHero({ config, heroImage, theme, priceFromRub }: HeroProps) {
  const heroSubtitle =
    config.heroSubtitle ??
    "Проекты, комплектация и строительство под ключ в Санкт-Петербурге и Ленинградской области";
  const heroMainCta = config.heroMainCta ?? config.secondaryCta;
  const heroMainHref = config.heroMainHref ?? "#projects";

  return (
    <section className="relative isolate min-h-[100svh] min-h-[100dvh] w-full overflow-hidden bg-[#07110e]">
      <DarkHeroBackdrop heroImage={heroImage} theme={theme} />
      <div className="container relative z-10 mx-auto flex min-h-[100svh] min-h-[100dvh] flex-col items-center justify-center px-4 pb-[max(5.5rem,env(safe-area-inset-bottom,0px))] pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:px-5 sm:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:pt-[calc(6rem+env(safe-area-inset-top,0px))]">
        <div
          className="pointer-events-auto w-full max-w-3xl rounded-2xl p-5 text-center sm:rounded-[1.35rem] sm:p-7"
          style={matteGlassStyle}
          data-reveal="section"
        >
          {config.eyebrow ? (
            <span
              className="mb-4 inline-block rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] sm:text-xs"
              style={{ backgroundColor: "rgba(0,0,0,0.35)", color: "rgba(245,247,246,0.92)" }}
            >
              {config.eyebrow}
            </span>
          ) : null}
          <h1 className="text-balance font-heading text-[clamp(1.2rem,3.2vw,2.4rem)] font-bold uppercase leading-[1.1] tracking-[-0.03em] text-white">
            {config.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-sm leading-relaxed text-neutral-100 md:text-[15px]">
            {heroSubtitle}
          </p>
          <HeroPriceLine config={config} priceFromRub={priceFromRub} />
          <HeroCtas config={config} heroMainCta={heroMainCta} heroMainHref={heroMainHref} />
        </div>
      </div>
    </section>
  );
}

function FlagshipSplitHero({ config, heroImage, theme, priceFromRub }: HeroProps) {
  const heroSubtitle =
    config.heroSubtitle ??
    "Подберём проект, материал и комплектацию — от первого расчёта до сдачи дома на участке";
  const heroMainCta = config.heroMainCta ?? config.secondaryCta;
  const heroMainHref = config.heroMainHref ?? "#projects";

  return (
    <section className="relative isolate min-h-[100svh] min-h-[100dvh] w-full overflow-hidden bg-[#07110e]">
      <DarkHeroBackdrop heroImage={heroImage} theme={theme} />
      <div className="container relative z-10 mx-auto grid min-h-[100svh] min-h-[100dvh] items-center gap-5 px-4 pb-[max(5.5rem,env(safe-area-inset-bottom,0px))] pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:gap-8 sm:px-5 sm:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] lg:grid-cols-[1.05fr_0.95fr] lg:pt-[calc(6rem+env(safe-area-inset-top,0px))]">
        <div data-reveal="section">
          <div
            className="max-w-2xl rounded-2xl p-4 sm:rounded-[1.35rem] sm:p-6"
            style={matteGlassStyle}
          >
            {config.eyebrow ? (
              <span
                className="mb-3 inline-block rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] sm:mb-4 sm:text-xs"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                  color: "rgba(245, 247, 246, 0.92)",
                }}
              >
                {config.eyebrow}
              </span>
            ) : null}
            <h1 className="text-balance font-heading text-[clamp(1.05rem,4.2vw,1.85rem)] font-bold uppercase leading-[1.15] tracking-[-0.02em] text-white">
              {config.h1}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-100 md:text-[15px]">{heroSubtitle}</p>
            <HeroPriceLine config={config} priceFromRub={priceFromRub} />
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a href="#lead-form" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold uppercase tracking-[0.1em] shadow-[0_12px_32px_rgba(15,61,46,0.35)]" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
                <Calculator className="h-4 w-4" aria-hidden />
                {config.primaryCta}
              </a>
              <a
                href={heroMainHref}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_32px_rgba(0,0,0,0.22)] transition hover:bg-white/15"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.42)", border: "1px solid rgba(255,255,255,0.14)" }}
              >
                <LayoutGrid className="h-4 w-4" aria-hidden />
                {heroMainCta}
              </a>
            </div>
          </div>
        </div>
        <div
          className="rounded-[1.35rem] p-5 sm:rounded-[1.75rem] sm:p-8"
          style={matteGlassStyle}
          data-reveal="card"
        >
          <ShieldCheck className="h-8 w-8 text-white/90" aria-hidden />
          <p className="mt-4 font-heading text-xl font-bold text-white sm:text-2xl">Дом под ключ — без сюрпризов в смете</p>
          <ul className="mt-5 space-y-3 text-sm text-neutral-200">
            {config.includes.slice(0, 4).map((item) => (
              <li key={item} className="flex gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <a href="#lead-form" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-xs font-bold uppercase tracking-[0.1em]" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
            {config.primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

function CalculatorLightHero({ config }: HeroProps) {
  const heroSubtitle =
    config.heroSubtitle ??
    "Соберём ориентир за несколько шагов — материал, площадь, этажность и бюджет влияют на итог";
  const heroMainCta = config.heroMainCta ?? config.secondaryCta;
  const heroMainHref = config.heroMainHref ?? "#includes";

  return (
    <section className="relative overflow-hidden pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:pt-[calc(6rem+env(safe-area-inset-top,0px))]" style={{ backgroundColor: "var(--bg)" }}>
      <div className="pointer-events-none absolute inset-0" aria-hidden style={{ background: "radial-gradient(circle at 80% 20%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 45%)" }} />
      <div className="container relative z-10 mx-auto px-4 py-12 sm:px-5 sm:py-16 md:py-20 lg:py-24" data-reveal="section">
        <div className="mx-auto max-w-3xl text-center">
          {config.eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
              {config.eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-heading text-[clamp(1.5rem,4vw,3rem)] font-bold uppercase leading-[1.05] tracking-[-0.03em]">
            {config.h1}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
            {heroSubtitle}
          </p>
          <HeroCtas config={config} heroMainCta={heroMainCta} heroMainHref={heroMainHref} light />
        </div>
        <div
          className="mx-auto mt-10 max-w-xl rounded-[1.75rem] p-5 md:p-6"
          style={{
            backgroundColor: "color-mix(in srgb, var(--bg) 92%, transparent)",
            boxShadow: "0 18px 48px rgba(15,61,46,0.08)",
            border: "1px solid color-mix(in srgb, var(--accent) 8%, transparent)",
          }}
          data-reveal="card"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>
            Мини-квиз · 6 шагов
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Материал → площадь → этажность → бюджет → ипотека → контакты. Результат передадим менеджеру для уточнения сметы.
          </p>
          <a href="#lead-form" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-bold" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
            {config.primaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

function ModernWideHero({ config, heroImage, theme, priceFromRub }: HeroProps) {
  const heroMainCta = config.heroMainCta ?? config.secondaryCta;
  const heroMainHref = config.heroMainHref ?? "#projects";

  return (
    <section className="relative isolate min-h-[88svh] w-full overflow-hidden bg-[#07110e]">
      <DarkHeroBackdrop heroImage={heroImage} theme={theme} />
      <div className="container relative z-10 mx-auto flex min-h-[88svh] flex-col justify-end px-4 pb-[max(5.5rem,env(safe-area-inset-bottom,0px))] pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:px-5 sm:pb-12 md:pb-16">
        <div className="max-w-2xl rounded-2xl p-5 sm:rounded-[1.35rem] sm:p-6" style={matteGlassStyle} data-reveal="section">
          {config.eyebrow ? (
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ backgroundColor: "rgba(0,0,0,0.35)", color: "rgba(245,247,246,0.92)" }}
            >
              {config.eyebrow}
            </span>
          ) : null}
          <h1 className="font-heading text-[clamp(1.35rem,3.8vw,2.6rem)] font-bold uppercase leading-[1.1] tracking-[-0.03em] text-white">
            {config.h1}
          </h1>
          {config.heroSubtitle ? (
            <p className="mt-3 max-w-xl text-sm text-neutral-200 md:text-base">{config.heroSubtitle}</p>
          ) : null}
          <HeroPriceLine config={config} priceFromRub={priceFromRub} />
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <a href="#lead-form" className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-xs font-bold uppercase tracking-[0.1em]" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
              {config.primaryCta}
            </a>
            <a
              href={heroMainHref}
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-xs font-bold uppercase tracking-[0.1em] text-white"
              style={{ backgroundColor: "rgba(0,0,0,0.42)", border: "1px solid rgba(255,255,255,0.14)" }}
            >
              {heroMainCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LayoutSplitHero({ config, heroImage, theme, priceFromRub }: HeroProps) {
  const heroSubtitle =
    config.heroSubtitle ??
    "Без лестниц — удобные планировки для семьи, прозрачная смета и выбор материала в одном квизе";
  const heroMainCta = config.heroMainCta ?? config.secondaryCta;
  const heroMainHref = config.heroMainHref ?? "#projects";

  return (
    <section className="relative isolate min-h-[100svh] min-h-[100dvh] w-full overflow-hidden bg-[#07110e]">
      <DarkHeroBackdrop heroImage={heroImage} theme={theme} />
      <div className="container relative z-10 mx-auto grid min-h-[100svh] min-h-[100dvh] items-center gap-5 px-4 pb-[max(5.5rem,env(safe-area-inset-bottom,0px))] pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:gap-8 sm:px-5 sm:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] lg:grid-cols-2 lg:pt-[calc(6rem+env(safe-area-inset-top,0px))]">
        <div className="rounded-2xl p-5 sm:rounded-[1.35rem] sm:p-6" style={matteGlassStyle} data-reveal="section">
          {config.eyebrow ? (
            <span
              className="mb-4 inline-block rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em]"
              style={{ backgroundColor: "rgba(0,0,0,0.35)", color: "rgba(245,247,246,0.92)" }}
            >
              {config.eyebrow}
            </span>
          ) : null}
          <h1 className="font-heading text-[clamp(1.2rem,3.4vw,2.4rem)] font-bold uppercase leading-[1.1] tracking-[-0.03em] text-white">
            {config.h1}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-200 md:text-base">{heroSubtitle}</p>
          <HeroPriceLine config={config} priceFromRub={priceFromRub} />
          <HeroCtas config={config} heroMainCta={heroMainCta} heroMainHref={heroMainHref} />
        </div>
        <div
          className="relative min-h-56 overflow-hidden rounded-[1.35rem] sm:min-h-64 sm:rounded-[1.75rem] lg:min-h-80"
          style={matteGlassStyle}
          data-reveal="card"
        >
          <CmsImage src={heroImage} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          <div className="absolute bottom-0 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">Планировка · 1 этаж</p>
            <p className="mt-1 font-heading text-xl font-bold">Горизонтальная жизнь без компромиссов</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumAsymmetricHero({ config, heroImage, theme, priceFromRub }: HeroProps) {
  const heroSubtitle =
    config.heroSubtitle ??
    "Каменная инерция и скорость блоковой кладки — подберём проект и комплектацию под ваш участок";
  const heroMainCta = config.heroMainCta ?? config.secondaryCta;
  const heroMainHref = config.heroMainHref ?? "#projects";

  return (
    <section className="relative isolate min-h-[100svh] min-h-[100dvh] w-full overflow-hidden bg-[#051510]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <CmsImage src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-[60%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#051510]/95 via-[#051510]/55 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(15,61,46,0.45),transparent_50%)]" />
      </div>
      <div className="container relative z-10 mx-auto flex min-h-[100svh] min-h-[100dvh] max-w-4xl flex-col justify-center px-4 pb-[max(5.5rem,env(safe-area-inset-bottom,0px))] pt-[calc(5.25rem+env(safe-area-inset-top,0px))] sm:px-5 sm:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] lg:max-w-[60%] lg:pl-8 lg:pt-[calc(6rem+env(safe-area-inset-top,0px))]">
        <div className="rounded-2xl p-5 sm:rounded-[1.35rem] sm:p-7" style={matteGlassStyle} data-reveal="section">
          {config.eyebrow ? (
            <span
              className="mb-4 inline-block w-fit rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em]"
              style={{ backgroundColor: "rgba(0,0,0,0.35)", color: "rgba(245,247,246,0.92)" }}
            >
              {config.eyebrow}
            </span>
          ) : null}
          <h1 className="font-heading text-[clamp(1.2rem,3.2vw,2.4rem)] font-bold uppercase leading-[1.1] tracking-[-0.03em] text-white">
            {config.h1}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-200 md:text-base">{heroSubtitle}</p>
          <HeroPriceLine config={config} priceFromRub={priceFromRub} />
          <HeroCtas config={config} heroMainCta={heroMainCta} heroMainHref={heroMainHref} />
        </div>
      </div>
    </section>
  );
}

function HeroBody({ config, heroImage, theme, priceFromRub }: HeroProps) {
  switch (theme.heroVariant) {
    case "flagship-split":
      return (
        <FlagshipSplitHero config={config} heroImage={heroImage} theme={theme} priceFromRub={priceFromRub} />
      );
    case "calculator-light":
      return <CalculatorLightHero config={config} heroImage={heroImage} theme={theme} />;
    case "modern-wide":
      return <ModernWideHero config={config} heroImage={heroImage} theme={theme} priceFromRub={priceFromRub} />;
    case "layout-split":
      return <LayoutSplitHero config={config} heroImage={heroImage} theme={theme} priceFromRub={priceFromRub} />;
    case "premium-asymmetric":
      return <PremiumAsymmetricHero config={config} heroImage={heroImage} theme={theme} priceFromRub={priceFromRub} />;
    default:
      return <CinematicCenterHero config={config} heroImage={heroImage} theme={theme} priceFromRub={priceFromRub} />;
  }
}

export function AdvertisingLandingHero({
  config,
  heroImage,
  priceFromRub,
}: {
  config: AdvertisingLandingConfig;
  heroImage: string;
  priceFromRub?: number | null;
}) {
  const [scrolled, setScrolled] = useState(false);
  const theme = resolveLpThemeSpec(config);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 48);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <LpHeroHeader scrolled={scrolled} />
      <HeroBody config={config} heroImage={heroImage} theme={theme} priceFromRub={priceFromRub} />
    </>
  );
}
