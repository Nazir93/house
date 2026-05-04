"use client";

import Image from "next/image";
import { Suspense, useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Eye,
  EyeOff,
  LayoutDashboard,
} from "lucide-react";

import { SITE_NAME } from "@/lib/constants";
import { ShowcaseCarouselNav } from "@/components/ui/showcase-carousel-nav";
import { cn } from "@/lib/utils";

type AuthTab = "email" | "login";

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
    text: "Блог, страницы услуг, портфолио — текст и картинки под вашим контролем.",
    image: "/images/banner/banner-hero-05.png",
  },
] as const;

const AUTO_ADVANCE_MS = 7500;

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

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

    const result = await signIn("admin", {
      email: email.trim(),
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Неверный email или пароль");
      setLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="inline-flex rounded-full border border-[#0f3d2e]/12 bg-[#0f3d2e]/[0.04] p-1">
        <button
          type="button"
          onClick={() => setTab("email")}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300",
            tab === "email"
              ? "bg-white text-[#0f3d2e] shadow-sm shadow-[#0f3d2e]/10"
              : "text-[#0f3d2e]/55 hover:text-[#0f3d2e]/85",
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
              ? "bg-white text-[#0f3d2e] shadow-sm shadow-[#0f3d2e]/10"
              : "text-[#0f3d2e]/55 hover:text-[#0f3d2e]/85",
          )}
        >
          Логин
        </button>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#0f3d2e]/55">
          {tab === "email" ? "Email" : "Логин"}
        </label>
        <input
          type={tab === "email" ? "email" : "text"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          autoFocus
          className="w-full rounded-xl border border-[#0f3d2e]/12 bg-white px-4 py-3 text-sm text-[#1a1d1c] shadow-inner shadow-black/[0.02] placeholder:text-[#0f3d2e]/30 focus:border-[#0f3d2e]/35 focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/15"
          placeholder={tab === "email" ? "admin@example.com" : "Введите логин"}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#0f3d2e]/55">
          Пароль
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-[#0f3d2e]/12 bg-white py-3 pl-4 pr-12 text-sm text-[#1a1d1c] shadow-inner shadow-black/[0.02] placeholder:text-[#0f3d2e]/30 focus:border-[#0f3d2e]/35 focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/15"
            placeholder="••••••••"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#0f3d2e]/40 transition hover:bg-[#0f3d2e]/5 hover:text-[#0f3d2e]/70"
            aria-label={showPw ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden rounded-2xl bg-[#0f3d2e] py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[#f6f6f4] shadow-[0_12px_40px_rgba(15,61,46,0.28)] transition hover:bg-[#174d3b] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span className="relative z-10">{loading ? "Вход…" : "Войти"}</span>
        <span
          className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-[100%]"
          aria-hidden
        />
      </button>

      <p className="text-center text-[11px] leading-relaxed text-[#0f3d2e]/40">
        Нажимая «Войти», вы подтверждаете доступ к закрытому разделу сайта.
      </p>
    </form>
  );
}

function AdminShowcaseCarousel() {
  const [i, setI] = useState(0);
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
    <div className="min-h-screen bg-[#e8ebe9] text-[#1a1d1c]">
      <div className="flex min-h-screen min-w-0 flex-col lg:flex-row">
        <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-12 sm:px-10 lg:w-[min(100%,46rem)] lg:max-w-[46%] lg:flex-none lg:px-14 xl:px-20">
          <div
            className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[#0f3d2e]/[0.06] blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto w-full max-w-[400px]">
            <div className="mb-10 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0f3d2e] text-[#f6f6f4] shadow-lg shadow-[#0f3d2e]/25">
                <LayoutDashboard className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h1 className="font-heading text-xl font-bold uppercase tracking-tight text-[#0f3d2e] sm:text-2xl">
                  {SITE_NAME}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-[13px] text-[#0f3d2e]/55">
                  Вход в админ-панель
                  <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
                </p>
              </div>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-[#0f3d2e]/70">
              Введите данные из переменных окружения сервера:{" "}
              <code className="rounded bg-[#0f3d2e]/8 px-1.5 py-0.5 text-[12px] text-[#0f3d2e]/90">ADMIN_EMAIL</code> и
              пароль <code className="rounded bg-[#0f3d2e]/8 px-1.5 py-0.5 text-[12px]">ADMIN_SECRET</code>. Вкладки
              Email и Логин отправляют одно и то же поле — администраторский email.
            </p>

            <Suspense fallback={<div className="py-10 text-center text-sm text-[#0f3d2e]/40">Загрузка…</div>}>
              <AdminLoginForm />
            </Suspense>

            <div
              className="mt-8 rounded-2xl border p-4 text-[11px] leading-relaxed"
              style={{
                borderColor: "rgba(15, 61, 46, 0.2)",
                backgroundColor: "rgba(15, 61, 46, 0.04)",
                color: "rgba(26, 29, 28, 0.75)",
              }}
            >
              <strong className="text-[#0f3d2e]">Входили по IP, а по домену не пускает?</strong>
              <br />
              Задайте <code className="text-[#0f3d2e]/90">NEXTAUTH_URL</code> на тот же хост, что в браузере, перезапустите
              приложение. Попробуйте окно инкогнито.
            </div>

            <p className="mt-6 text-[11px] leading-relaxed text-[#0f3d2e]/38">
              Env: <span className="text-[#0f3d2e]/55">NEXTAUTH_SECRET</span>,{" "}
              <span className="text-[#0f3d2e]/55">NEXTAUTH_URL</span>
            </p>
          </div>
        </div>

        <div className="relative flex min-h-[420px] min-w-0 flex-1 flex-col border-t border-[#0f3d2e]/10 bg-[#0a1210] lg:min-h-screen lg:border-l lg:border-t-0">
          <div
            className="pointer-events-none absolute -left-px top-0 hidden h-full w-20 bg-gradient-to-r from-[#e8ebe9] to-transparent lg:block"
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
