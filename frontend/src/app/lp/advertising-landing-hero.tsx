"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, LayoutGrid, Phone, ShieldCheck } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { CmsImage } from "@/components/ui/cms-image";
import {
  ADVERTISING_LP_NAV,
  type AdvertisingLandingConfig,
} from "@/lib/advertising-landing";
import { PHONE, PHONE_RAW, WORKING_HOURS } from "@/lib/constants";
import { resolveLpThemeSpec, type LpThemeSpec } from "@/lib/lp-themes";
import { cn } from "@/lib/utils";

const edgeGlass = "border border-white/[0.07]";
const edgeGlassStrong = "border border-white/[0.1]";

type HeroProps = {
  config: AdvertisingLandingConfig;
  heroImage: string;
  theme: LpThemeSpec;
};

function LpHeroHeader({ config, headerGlass }: { config: AdvertisingLandingConfig; headerGlass: boolean }) {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        headerGlass
          ? "border-b border-white/[0.08] backdrop-blur-md"
          : "border-b bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] shadow-sm backdrop-blur-xl",
      )}
      style={{
        borderColor: headerGlass ? undefined : "var(--border)",
        backgroundColor: headerGlass ? "color-mix(in srgb, #0e1814 80%, transparent)" : undefined,
      }}
    >
      <div className="container mx-auto flex min-h-[72px] items-center justify-between gap-4 px-5 lg:min-h-[80px]">
        <Link href="/" className="shrink-0" aria-label="Часть души — на главную">
          <BrandLogo height={34} brightOnBackdrop={headerGlass} className="lg:h-[38px]" />
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Разделы страницы">
          {ADVERTISING_LP_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "text-[13px] font-semibold tracking-wide transition hover:opacity-85",
                headerGlass ? "text-white/90" : "text-[var(--text)]",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <a
            href={`tel:${PHONE_RAW}`}
            className={cn(
              "hidden items-center gap-2 text-right sm:flex",
              headerGlass ? "text-white" : "text-[var(--text)]",
            )}
          >
            <Phone className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            <span>
              <span className="block text-sm font-bold leading-tight">{PHONE}</span>
              <span
                className={cn(
                  "block text-[11px] leading-tight",
                  headerGlass ? "text-white/70" : "text-[var(--text-muted)]",
                )}
              >
                {WORKING_HOURS}
              </span>
            </span>
          </a>
          <a
            href="#lead-form"
            className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-[11px] font-bold uppercase tracking-[0.08em] transition hover:opacity-95 sm:min-h-11 sm:px-5 sm:text-xs"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
          >
            Перезвоните мне
          </a>
        </div>
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
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-5 text-xs font-bold uppercase tracking-[0.1em] transition hover:-translate-y-0.5 sm:w-auto"
          style={{ borderColor: "var(--border)", color: "var(--text)", backgroundColor: "var(--bg)" }}
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

function FlagshipSplitHero({ config, heroImage, theme }: HeroProps) {
  const heroSubtitle =
    config.heroSubtitle ??
    "Подберём проект, материал и комплектацию — от первого расчёта до сдачи дома на участке";
  const heroMainCta = config.heroMainCta ?? config.secondaryCta;
  const heroMainHref = config.heroMainHref ?? "#projects";

  return (
    <section className="relative isolate min-h-[100svh] min-h-[100dvh] w-full overflow-hidden bg-[#07110e]">
      <DarkHeroBackdrop heroImage={heroImage} theme={theme} />
      <div className="container relative z-10 mx-auto grid min-h-[100svh] min-h-[100dvh] items-center gap-8 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] lg:grid-cols-[1.05fr_0.95fr] lg:pt-[calc(6rem+env(safe-area-inset-top,0px))]">
        <div>
          {config.eyebrow ? (
            <span className={cn("mb-4 inline-block rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white/88", edgeGlass, "bg-black/35 backdrop-blur-sm")}>
              {config.eyebrow}
            </span>
          ) : null}
          <div className={cn("max-w-2xl rounded-2xl bg-black/42 p-5 backdrop-blur-sm sm:rounded-[1.35rem] sm:p-6", edgeGlass)}>
            <h1 className="font-heading text-[clamp(1.5rem,3.5vw,2.75rem)] font-bold uppercase leading-[0.95] tracking-[-0.03em] text-white">
              {config.h1}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-100 md:text-base">{heroSubtitle}</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a href={heroMainHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-bold uppercase tracking-[0.1em] text-[#0f3d2e]">
                <LayoutGrid className="h-4 w-4" aria-hidden />
                {heroMainCta}
              </a>
              <a href="#lead-form" className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-black/55 px-5 text-xs font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm", edgeGlassStrong)}>
                <Calculator className="h-4 w-4" aria-hidden />
                {config.primaryCta}
              </a>
            </div>
          </div>
        </div>
        <div className={cn("rounded-[1.75rem] p-6 backdrop-blur-sm sm:p-8", edgeGlass, "bg-black/40")}>
          <ShieldCheck className="h-8 w-8 text-white/90" aria-hidden />
          <p className="mt-4 font-heading text-2xl font-bold text-white">Дом под ключ — без сюрпризов в смете</p>
          <ul className="mt-5 space-y-3 text-sm text-neutral-200">
            {config.includes.slice(0, 3).map((item) => (
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
    <section className="relative overflow-hidden border-b pt-[calc(5.5rem+env(safe-area-inset-top,0px))] md:pt-[calc(6rem+env(safe-area-inset-top,0px))]" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="pointer-events-none absolute inset-0" aria-hidden style={{ background: "radial-gradient(circle at 80% 20%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 45%)" }} />
      <div className="container relative z-10 mx-auto px-5 py-14 md:py-20 lg:py-24">
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
        <div className="mx-auto mt-10 max-w-xl rounded-[1.75rem] border p-5 md:p-6" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
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

function HeroBody({ config, heroImage, theme }: HeroProps) {
  switch (theme.heroVariant) {
    case "flagship-split":
      return <FlagshipSplitHero config={config} heroImage={heroImage} theme={theme} />;
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
}: {
  config: AdvertisingLandingConfig;
  heroImage: string;
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

  const headerGlass = theme.heroDark ? !scrolled : !scrolled;

  return (
    <>
      <LpHeroHeader config={config} headerGlass={theme.heroDark ? headerGlass : false} />
      <HeroBody config={config} heroImage={heroImage} theme={theme} />
    </>
  );
}
