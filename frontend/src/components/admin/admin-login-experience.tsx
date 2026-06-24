"use client";

import Image from "next/image";
import { Suspense, useCallback, useState, useSyncExternalStore } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { SITE_NAME } from "@/lib/constants";
import { publicFormFieldClass, publicFormFieldStyle } from "@/lib/public-form-field";
import { ShowcaseCarouselNav } from "@/components/ui/showcase-carousel-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { safeAdminCallbackUrl } from "@/lib/safe-admin-callback-url";

type AuthTab = "email" | "login";

/** Карусель на мобильных ниже формы — без priority, иначе preload «не использован» в консоли Chrome. */
function useMinWidthLg() {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () =>
      typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches,
    () => false
  );
}

const ADMIN_SLIDES = [
  {
    title: "Заявки и лиды",
    text: "Входящие с форм сайта, калькулятора и уведомления в Telegram — всё в одном потоке.",
    image: "/images/banner/banner-hero-01.png",
  },
  {
    title: "Каталог домов",
    text: "Проекты, медиа, чертежи и публикация на сайте без лишних шагов.",
    image: "/images/banner/banner-hero-02.png",
  },
  {
    title: "Настройки и прайс",
    text: "Контакты, Telegram, JSON калькулятора строительства — обновляете сами.",
    image: "/images/banner/banner-hero-03.png",
  },
  {
    title: "Клиентские кабинеты",
    text: "Договоры, этапы стройки, документы и оплаты — доступ для заказчика.",
    image: "/images/banner/banner-hero-04.png",
  },
  {
    title: "Контент и отзывы",
    text: "Блог, страницы услуг, построенные дома — текст и картинки под вашим контролем.",
    image: "/images/banner/banner-hero-05.png",
  },
] as const;

const AUTO_ADVANCE_MS = 7500;

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = safeAdminCallbackUrl(searchParams.get("callbackUrl"));

  const [tab, setTab] = useState<AuthTab>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result: Awaited<ReturnType<typeof signIn>>;
    try {
      result = await signIn("admin", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
      });
    } catch {
      setError("Ошибка сети или сервера. Попробуйте ещё раз.");
      setLoading(false);
      return;
    }

    if (result?.error) {
      setError("Неверный email или пароль");
      setLoading(false);
      return;
    }

    /** Только реальный успех: иначе NextAuth может дать URL на другой хост (/api/auth/signin?csrf) при ошибочном NEXTAUTH_URL. */
    if (result?.ok) {
      let target = callbackUrl;
      if (result.url) {
        try {
          const u = new URL(result.url);
          const here = window.location.origin;
          const bad =
            u.origin !== here || u.pathname.includes("/api/auth/signin");
          if (!bad) target = result.url;
        } catch {
          /* оставить fallback */
        }
      }
      window.location.href = target;
      return;
    }

    setError("Не удалось войти. Попробуйте ещё раз или обратитесь к администратору сайта.");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <div
          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div
        className="inline-flex rounded-full border p-1"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "color-mix(in srgb, var(--card-bg) 88%, var(--accent) 12%)",
        }}
      >
        <button
          type="button"
          onClick={() => setTab("email")}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300",
            tab === "email"
              ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]",
          )}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => setTab("login")}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300",
            tab === "login"
              ? "bg-[var(--accent)] text-[var(--on-accent)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]",
          )}
        >
          Логин
        </button>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          {tab === "email" ? "Email" : "Логин"}
        </label>
        <input
          type={tab === "email" ? "email" : "text"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          autoFocus
          className={cn(publicFormFieldClass, "!rounded-2xl")}
          style={publicFormFieldStyle}
          placeholder={tab === "email" ? "admin@example.com" : "Введите логин"}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-subtle)]">
          Пароль
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={cn(publicFormFieldClass, "!rounded-2xl pr-12")}
            style={publicFormFieldStyle}
            placeholder="••••••••"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1.5 text-[var(--text-subtle)] transition hover:bg-[color-mix(in_srgb,var(--text)_8%,transparent)] hover:text-[var(--text)]"
            aria-label={showPw ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-2xl bg-[var(--accent)] py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[var(--on-accent)] shadow-[0_12px_40px_color-mix(in_srgb,var(--accent)_35%,transparent)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span className="relative z-10">{loading ? "Вход…" : "Войти"}</span>
        <span
          className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-[100%]"
          aria-hidden
        />
      </button>

      <p className="text-center text-[11px] leading-relaxed text-[var(--text-subtle)]">
        Нажимая «Войти», вы подтверждаете доступ к закрытому разделу сайта.
      </p>
    </form>
  );
}

function AdminShowcaseCarousel() {
  const [i, setI] = useState(0);
  const isLg = useMinWidthLg();
  const n = ADMIN_SLIDES.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      setI((prev) => (prev + dir + n) % n);
    },
    [n],
  );

  const slide = ADMIN_SLIDES[i]!;

  return (
    <div className="relative flex min-h-[300px] min-w-0 flex-1 flex-col justify-end lg:min-h-0">
      <div className="absolute inset-0 overflow-hidden rounded-2xl lg:rounded-3xl">
        <Image
          key={slide.image}
          src={slide.image}
          alt=""
          fill
          priority={isLg && i === 0}
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
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-200/75">Админ-панель</p>
          <h2 className="mt-2 font-heading text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-3xl">
            {slide.title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/[0.82] sm:text-[15px]">{slide.text}</p>
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

export function AdminLoginExperience() {
  return (
    <div
      className="app-branded-surface relative min-h-screen"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div className="pointer-events-none absolute right-4 top-4 z-50 sm:right-6 sm:top-6">
        <span className="pointer-events-auto inline-block rounded-xl bg-[color-mix(in_srgb,var(--card-bg)_92%,transparent)] p-0.5 shadow-sm backdrop-blur-sm">
          <ThemeToggle variant="outline" />
        </span>
      </div>
      <div className="flex min-h-screen min-w-0 flex-col lg:flex-row">
        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-12 sm:px-10 lg:w-[min(100%,46rem)] lg:max-w-[46%] lg:flex-none lg:px-14 xl:px-20">
          <div
            className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto w-full max-w-[400px]">
            <div className="mb-10 flex items-start gap-3">
              <BrandLogo height={40} variant="app" className="shrink-0" />
              <div>
                <h1 className="font-heading text-xl font-bold uppercase tracking-tight text-[var(--text)] sm:text-2xl">
                  {SITE_NAME}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-[13px] text-[var(--text-muted)]">
                  Вход в админ-панель
                  <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
                </p>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="py-10 text-center text-sm text-[var(--text-muted)]">Загрузка…</div>
              }
            >
              <AdminLoginForm />
            </Suspense>
          </div>
        </div>

        <div
          className="relative flex min-h-[420px] min-w-0 flex-1 flex-col border-t bg-[#0a1210] lg:min-h-screen lg:border-l lg:border-t-0"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="pointer-events-none absolute -left-px top-0 hidden h-full w-20 bg-gradient-to-r from-[var(--bg)] to-transparent lg:block"
            aria-hidden
          />
          <div className="relative flex min-h-[420px] min-w-0 flex-1 flex-col p-4 sm:p-6 lg:min-h-0 lg:flex-1 lg:p-8 lg:pl-12">
            <AdminShowcaseCarousel />
          </div>
        </div>
      </div>
    </div>
  );
}
