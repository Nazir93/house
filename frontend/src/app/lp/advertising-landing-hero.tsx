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

const edgeGlass = "border border-white/[0.07]";
const edgeGlassStrong = "border border-white/[0.1]";

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

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
      <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-4 lg:px-5">
        <div
          className={cn(
            "relative flex items-center justify-between gap-2 rounded-2xl bg-[#0e1814]/92 px-2.5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.38)] backdrop-blur-xl transition-all duration-300 sm:gap-3 sm:px-4",
            scrolled ? "min-h-[56px] sm:min-h-[60px]" : "min-h-[60px] sm:min-h-[68px] lg:min-h-[72px]",
          )}
        >
          <div
            className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            aria-hidden
          />

          <Link href="/" className="relative z-10 shrink-0 pl-0.5" aria-label="Часть души — на главную">
            <BrandLogo height={30} brightOnBackdrop className="sm:h-[34px] lg:h-[36px]" />
          </Link>

          <nav
            className="relative z-10 hidden items-center gap-0.5 rounded-full bg-white/[0.08] px-1 py-1 lg:flex"
            aria-label="Разделы страницы"
          >
            {ADVERTISING_LP_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-2.5 py-2 text-[12px] font-semibold tracking-wide text-white/95 transition hover:bg-white/15 hover:text-white xl:px-3.5"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="relative z-10 flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <a
              href={`tel:${PHONE_RAW}`}
              className="hidden items-center gap-2 rounded-xl px-2 py-1.5 text-right text-white transition hover:bg-white/[0.08] md:flex"
            >
              <Phone className="h-4 w-4 shrink-0 text-white/85" aria-hidden />
              <span>
                <span className="block text-sm font-bold leading-tight text-white">{PHONE}</span>
                <span className="block text-[11px] leading-tight text-white/70">{WORKING_HOURS}</span>
              </span>
            </a>
            <a
              href={`tel:${PHONE_RAW}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.1] text-white transition hover:bg-white/[0.16] md:hidden"
              aria-label={`Позвонить ${PHONE}`}
            >
              <Phone className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="#lead-form"
              className="inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--accent-contrast)] shadow-[0_10px_28px_rgba(15,61,46,0.35)] transition hover:-translate-y-0.5 hover:opacity-95 sm:min-h-11 sm:px-5 sm:text-xs"
              style={{ backgroundColor: "var(--accent)" }}
              onClick={() => setMenuOpen(false)}
            >
              <span className="sm:hidden">Звонок</span>
              <span className="hidden sm:inline">Перезвоните мне</span>
            </a>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.1] text-white transition hover:bg-white/[0.16] lg:hidden"
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
            className="mt-2 overflow-hidden rounded-2xl bg-[#0e1814]/96 p-3 text-white shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:hidden"
          >
            <nav className="grid gap-1" aria-label="Мобильная навигация">
              {ADVERTISING_LP_NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-white/95 transition hover:bg-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <a
              href={`tel:${PHONE_RAW}`}
              className="mt-2 flex items-center gap-3 rounded-xl bg-white/[0.08] px-4 py-3 md:hidden"
              onClick={() => setMenuOpen(false)}
            >
              <Phone className="h-4 w-4 text-white/85" aria-hidden />
              <span>
                <span className="block text-sm font-bold">{PHONE}</span>
                <span className="block text-xs text-white/65">{WORKING_HOURS}</span>
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
        href={heroMainHref}
        className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0f3d2e] shadow-[0_12px_36px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-white/95 sm:w-auto md:px-5"
      >
        <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
        {heroMainCta}
      </a>
      <a
        href="#lead-form"
        className={cn(
          "inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl bg-black/55 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_36px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-black/70 sm:w-auto md:px-5",
          edgeGlassStrong,
          "hover:border-white/[0.14]",
        )}
      >
        <Calculator className="h-4 w-4 shrink-0" aria-hidden />
        {config.primaryCta}
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

function CinematicCenterHero({ config, heroImage, theme }: HeroProps) {
  const heroSubtitle =
    config.heroSubtitle ??
    "Проекты, комплектация и строительство под ключ в Санкт-Петербурге и Ленинградской области";
  const heroMainCta = config.heroMainCta ?? config.secondaryCta;
  const heroMainHref = config.heroMainHref ?? "#projects";

  return (
    <section className="relative isolate min-h-[100svh] min-h-[100dvh] w-full overflow-hidden bg-[#07110e]">
      <DarkHeroBackdrop heroImage={heroImage} theme={theme} />
      <div className="container relative z-10 mx-auto flex min-h-[100svh] min-h-[100dvh] flex-col items-center justify-center px-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:pt-[calc(6rem+env(safe-area-inset-top,0px))]">
        <div className="pointer-events-auto w-full max-w-3xl text-center">
          {config.eyebrow ? (
            <span
              className={cn(
                "mb-4 inline-block rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/88 sm:text-xs",
                edgeGlass,
                "bg-black/35 backdrop-blur-sm",
              )}
            >
              {config.eyebrow}
            </span>
          ) : null}
          <div
            className={cn(
              "mx-auto max-w-4xl rounded-2xl bg-black/42 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_48px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:rounded-[1.35rem] sm:px-5 sm:py-4",
              edgeGlass,
            )}
          >
            <h1 className="text-balance font-heading text-[clamp(1.35rem,3.35vw,3.05rem)] font-bold uppercase leading-[0.92] tracking-[-0.04em] text-white [text-shadow:0_0_1px_rgba(0,0,0,0.95),0_1px_2px_rgba(0,0,0,0.92),0_2px_16px_rgba(0,0,0,0.72),0_4px_36px_rgba(0,0,0,0.45)]">
              {config.h1}
            </h1>
          </div>
          <p
            className={cn(
              "mx-auto mt-3 max-w-2xl text-balance rounded-lg bg-black/50 px-3 py-2 text-[13px] font-medium leading-relaxed text-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm md:px-3.5 md:py-2.5 md:text-[15px]",
              edgeGlass,
            )}
          >
            {heroSubtitle}
          </p>
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
          {config.eyebrow ? (
            <span className="mb-3 inline-block rounded-full bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/88 backdrop-blur-sm sm:mb-4 sm:text-xs">
              {config.eyebrow}
            </span>
          ) : null}
          <div className="max-w-2xl rounded-2xl bg-black/38 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-md sm:rounded-[1.35rem] sm:p-6">
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
              <a href={heroMainHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-bold uppercase tracking-[0.1em] text-[#0f3d2e] shadow-[0_12px_32px_rgba(0,0,0,0.2)]">
                <LayoutGrid className="h-4 w-4" aria-hidden />
                {heroMainCta}
              </a>
            </div>
          </div>
        </div>
        <div className="rounded-[1.35rem] bg-black/36 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-md sm:rounded-[1.75rem] sm:p-8" data-reveal="card">
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
      <div className="container relative z-10 mx-auto px-5 py-14 md:py-20 lg:py-24" data-reveal="section">
        <div className="mx-auto max-w-3xl text-center">
          {config.eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
              {config.eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 font-heading text-[clamp(1.75rem,4vw,3.25rem)] font-bold uppercase leading-[0.95] tracking-[-0.03em]">
            {config.h1}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
            {heroSubtitle}
          </p>
          <HeroCtas config={config} heroMainCta={heroMainCta} heroMainHref={heroMainHref} light />
        </div>
        <div className="mx-auto mt-10 max-w-xl rounded-[1.75rem] bg-[var(--bg-secondary)] p-5 shadow-[0_18px_48px_rgba(15,61,46,0.07)] md:p-6" data-reveal="card">
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

function ModernWideHero({ config, heroImage, theme }: HeroProps) {
  const heroMainCta = config.heroMainCta ?? config.secondaryCta;
  const heroMainHref = config.heroMainHref ?? "#projects";

  return (
    <section className="relative isolate min-h-[88svh] w-full overflow-hidden bg-[#07110e]">
      <DarkHeroBackdrop heroImage={heroImage} theme={theme} />
      <div className="container relative z-10 mx-auto flex min-h-[88svh] flex-col justify-end px-5 pb-12 pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:pb-16">
        <div className="max-w-2xl">
          {config.eyebrow ? (
            <span className={cn("mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/88", edgeGlass, "bg-black/35")}>
              {config.eyebrow}
            </span>
          ) : null}
          <h1 className="font-heading text-[clamp(1.75rem,4vw,3rem)] font-bold uppercase leading-[0.95] tracking-[-0.03em] text-white">
            {config.h1}
          </h1>
          {config.heroSubtitle ? (
            <p className="mt-3 max-w-xl text-sm text-neutral-200 md:text-base">{config.heroSubtitle}</p>
          ) : null}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <a href="#lead-form" className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-xs font-bold uppercase tracking-[0.1em]" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
              {config.primaryCta}
            </a>
            <a href={heroMainHref} className={cn("inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-xs font-bold uppercase tracking-[0.1em] text-white", edgeGlassStrong, "bg-black/45 backdrop-blur-sm")}>
              {heroMainCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LayoutSplitHero({ config, heroImage, theme }: HeroProps) {
  const heroSubtitle =
    config.heroSubtitle ??
    "Без лестниц — удобные планировки для семьи, прозрачная смета и выбор материала в одном квизе";
  const heroMainCta = config.heroMainCta ?? config.secondaryCta;
  const heroMainHref = config.heroMainHref ?? "#projects";

  return (
    <section className="relative isolate min-h-[100svh] min-h-[100dvh] w-full overflow-hidden bg-[#07110e]">
      <DarkHeroBackdrop heroImage={heroImage} theme={theme} />
      <div className="container relative z-10 mx-auto grid min-h-[100svh] min-h-[100dvh] items-center gap-8 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] lg:grid-cols-2">
        <div>
          {config.eyebrow ? (
            <span className={cn("mb-4 inline-block rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/88", edgeGlass, "bg-black/35")}>
              {config.eyebrow}
            </span>
          ) : null}
          <h1 className="font-heading text-[clamp(1.5rem,3.5vw,2.85rem)] font-bold uppercase leading-[0.95] tracking-[-0.03em] text-white">
            {config.h1}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-200 md:text-base">{heroSubtitle}</p>
          <HeroCtas config={config} heroMainCta={heroMainCta} heroMainHref={heroMainHref} />
        </div>
        <div className={cn("relative min-h-64 overflow-hidden rounded-[1.75rem] lg:min-h-80", edgeGlass)}>
          <CmsImage src={heroImage} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">Планировка · 1 этаж</p>
            <p className="mt-1 font-heading text-xl font-bold">Горизонтальная жизнь без компромиссов</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PremiumAsymmetricHero({ config, heroImage, theme }: HeroProps) {
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
      <div className="container relative z-10 mx-auto flex min-h-[100svh] min-h-[100dvh] max-w-4xl flex-col justify-center px-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] lg:max-w-[60%] lg:pl-8">
        {config.eyebrow ? (
          <span className={cn("mb-4 inline-block w-fit rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/88", edgeGlass, "bg-black/35")}>
            {config.eyebrow}
          </span>
        ) : null}
        <div className={cn("rounded-2xl p-5 backdrop-blur-sm sm:p-7", edgeGlass, "bg-black/40")}>
          <h1 className="font-heading text-[clamp(1.5rem,3.2vw,2.65rem)] font-bold uppercase leading-[0.95] tracking-[-0.03em] text-white">
            {config.h1}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-200 md:text-base">{heroSubtitle}</p>
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
      return <ModernWideHero config={config} heroImage={heroImage} theme={theme} />;
    case "layout-split":
      return <LayoutSplitHero config={config} heroImage={heroImage} theme={theme} />;
    case "premium-asymmetric":
      return <PremiumAsymmetricHero config={config} heroImage={heroImage} theme={theme} />;
    default:
      return <CinematicCenterHero config={config} heroImage={heroImage} theme={theme} />;
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
