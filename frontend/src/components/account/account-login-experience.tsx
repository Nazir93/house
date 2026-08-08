"use client";

import Image from "next/image";
import Link from "next/link";
import { ACCOUNT_LOGIN_CONTACT_HREF } from "@/lib/account-login-links";
import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Home,
  Images,
  MessageCircle,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { SITE_NAME } from "@/lib/constants";
import { publicFormFieldClass, publicFormFieldStyle } from "@/lib/public-form-field";
import { ShowcaseCarouselNav } from "@/components/ui/showcase-carousel-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const CLIENT_SLIDES = [
  {
    title: "Этапы и сроки",
    text: "Видно, на чём идёт стройка: этапы, график и статусы — без лишних звонков вам.",
    image: "/images/banner/banner-hero-05.png",
    Icon: CalendarCheck,
    features: ["График работ", "Статусы этапов", "План ближайших задач"],
  },
  {
    title: "Документы и оплаты",
    text: "Договор, акты, график платежей — в одном месте, когда удобно вам.",
    image: "/images/banner/banner-hero-03.png",
    Icon: FileText,
    features: ["Договор и акты", "График платежей", "История оплат"],
  },
  {
    title: "Фотоотчёты и история работ",
    text: "Смотрите, как продвигается строительство: новые фото, подписи к этапам и вся история объекта в одном месте.",
    image: "/images/banner/banner-hero-06.png",
    Icon: Images,
    features: ["Фото по этапам", "Подписи прораба", "Архив прогресса"],
  },
  {
    title: "Вопросы и поддержка",
    text: "Напишите нам из кабинета — ответ по обращению уйдёт в ту же цепочку, что и с сайта.",
    image: "/images/banner/banner-hero-02.png",
    Icon: MessageCircle,
    features: ["Обращения", "Ответы в одной цепочке", "Уведомления"],
  },
] as const;

const AUTO_ADVANCE_MS = 7500;

function AccountLoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [contractNumber, setContractNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("client-contract", {
      contractNumber: contractNumber.trim(),
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Неверный номер договора или пароль");
      setLoading(false);
    } else if (result?.ok && result.url) {
      window.location.href = result.url;
    } else if (result?.ok) {
      window.location.href = callbackUrl;
    } else {
      setError("Не удалось войти");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div
          className="rounded-[1rem] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm"
          style={{ color: "var(--text)" }}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="account-login-contract"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]"
        >
          Номер договора
        </label>
        <input
          id="account-login-contract"
          type="text"
          autoComplete="username"
          value={contractNumber}
          onChange={(e) => setContractNumber(e.target.value)}
          required
          className={publicFormFieldClass}
          style={publicFormFieldStyle}
          placeholder="Например, Д-2025-001"
        />
      </div>

      <div>
        <label
          htmlFor="account-login-password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]"
        >
          Пароль
        </label>
        <div className="relative">
          <input
            id="account-login-password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={cn(publicFormFieldClass, "pr-12")}
            style={publicFormFieldStyle}
            placeholder="••••••••"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-subtle)] transition hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] hover:text-[var(--text)]"
            aria-label={showPw ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-[1rem] bg-[var(--accent)] py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-contrast)] shadow-[0_12px_40px_color-mix(in_srgb,var(--accent)_35%,transparent)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span className="relative z-10">{loading ? "Вход…" : "Войти"}</span>
        <span
          className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-[100%]"
          aria-hidden
        />
      </button>

      <p className="text-center text-[11px] leading-relaxed text-[var(--text-subtle)]">
        Данные выдаёт офис при заключении договора. Забыли пароль —{" "}
        <Link
          href={ACCOUNT_LOGIN_CONTACT_HREF}
          className="font-medium text-[var(--accent)] underline-offset-2 transition hover:underline"
        >
          напишите нам с сайта
        </Link>{" "}
        или позвоните.
      </p>
    </form>
  );
}

function ClientShowcaseCarousel() {
  const [i, setI] = useState(0);
  const n = CLIENT_SLIDES.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      setI((prev) => (prev + dir + n) % n);
    },
    [n],
  );

  const slide = CLIENT_SLIDES[i]!;
  const Icon = slide.Icon;

  return (
    <div className="relative flex min-h-[300px] min-w-0 flex-1 flex-col justify-end lg:min-h-0">
      <div className="absolute inset-0 overflow-hidden rounded-2xl lg:rounded-3xl">
        <Image
          key={slide.image}
          src={slide.image}
          alt=""
          fill
          priority={i === 0}
          className="object-cover object-center transition-opacity duration-500"
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#020806] via-[#07120e]/82 to-[#0a1814]/55"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_70%_20%,rgba(61,143,110,0.18),transparent_55%)]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 flex min-h-[300px] min-w-0 flex-1 flex-col justify-between p-6 sm:min-h-[380px] sm:p-8 lg:min-h-0 lg:flex-1 lg:p-10">
        <div className="max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-100/85 shadow-[0_12px_36px_rgba(0,0,0,0.22)] backdrop-blur-md">
            <Icon className="h-3.5 w-3.5 text-emerald-200" strokeWidth={2.1} aria-hidden />
            Личный кабинет
          </div>
          <h2 className="mt-2 font-heading text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-3xl">
            {slide.title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/[0.82] sm:text-[15px]">{slide.text}</p>
          <div className="mt-5 grid max-w-md gap-2 sm:grid-cols-3">
            {slide.features.map((feature) => (
              <span
                key={feature}
                className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-2xl border border-white/10 bg-black/24 px-3 py-2 text-[11px] font-semibold leading-snug text-white/86 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-md"
              >
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-200" strokeWidth={2.1} aria-hidden />
                {feature}
              </span>
            ))}
          </div>
        </div>

        <ShowcaseCarouselNav
          slideCount={n}
          activeIndex={i}
          onSelectSlide={setI}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          autoAdvanceMs={AUTO_ADVANCE_MS}
          onProgressAnimationComplete={() => go(1)}
        />
      </div>
    </div>
  );
}

export function AccountLoginExperience({ callbackUrl }: { callbackUrl: string }) {
  return (
    <div className="app-branded-surface relative min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="pointer-events-none absolute right-4 top-4 z-50 sm:right-6 sm:top-6">
        <span className="pointer-events-auto inline-block rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] p-0.5 shadow-sm backdrop-blur-sm">
          <ThemeToggle variant="outline" />
        </span>
      </div>

      <div className="flex min-h-screen min-w-0 flex-col lg:flex-row">
        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-12 sm:px-10 lg:w-[min(100%,46rem)] lg:max-w-[46%] lg:flex-none lg:px-14 xl:px-20">
          <div
            className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] blur-3xl"
            aria-hidden
          />

          <div className="relative mx-auto w-full max-w-[400px]">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--text-muted)] transition hover:text-[var(--accent)]"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              На главную
            </Link>

            <div className="mb-10 flex items-start gap-3">
              <BrandLogo height={40} variant="app" className="shrink-0" />
              <div>
                <h1 className="font-heading text-xl font-bold uppercase tracking-tight text-[var(--text)] sm:text-2xl">
                  {SITE_NAME}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-[13px] text-[var(--text-muted)]">
                  Вход в личный кабинет
                  <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
                </p>
              </div>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-[var(--text-muted)]">
              Введите номер договора и пароль, которые вам выдали при работе с проектом. Это тот же доступ, что и у
              заказчика по договору строительства.
            </p>

            <AccountLoginForm callbackUrl={callbackUrl} />

            <div className="mt-8 flex items-start gap-3 rounded-[1rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_96%,var(--accent)_4%)] p-4 text-[11px] leading-relaxed text-[var(--text-muted)] shadow-sm">
              <Home className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-subtle)]" aria-hidden />
              <span>
                <strong className="text-[var(--text)]">Первый раз в кабинете?</strong> Убедитесь, что в договоре нет
                лишних пробелов при вводе номера. Копируйте номер из письма или скана, если сомневаетесь.
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[420px] min-w-0 flex-1 flex-col border-t border-[var(--border)] bg-[#0a1210] lg:min-h-screen lg:border-l lg:border-t-0">
          <div
            className="pointer-events-none absolute -left-px top-0 hidden h-full w-20 bg-gradient-to-r from-[var(--bg)] to-transparent lg:block"
            aria-hidden
          />
          <div className="relative flex min-h-[420px] min-w-0 flex-1 flex-col p-4 sm:p-6 lg:min-h-0 lg:flex-1 lg:p-8 lg:pl-12">
            <ClientShowcaseCarousel />
          </div>
        </div>
      </div>
    </div>
  );
}
