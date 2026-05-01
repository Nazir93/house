"use client";

import Link from "next/link";
import {
  Bookmark,
  Calculator,
  Heart,
  Home,
  LayoutGrid,
  MapPinned,
  Percent,
  ShieldCheck,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";
function isCompleteRuMobilePhone(formatted: string): boolean {
  let d = formatted.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  return d.length === 11 && d.startsWith("7");
}

function formatRuPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let d = digits;
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7") && d.length > 0) d = "7" + d.replace(/^7+/, "");
  d = d.slice(0, 11);
  const rest = d.slice(1);
  let out = "+7";
  if (rest.length >= 1) out += " (" + rest.slice(0, 3);
  if (rest.length >= 3) out += ") " + rest.slice(3, 6);
  if (rest.length >= 6) out += " - " + rest.slice(6, 8);
  if (rest.length >= 8) out += " - " + rest.slice(8, 10);
  return out;
}

function BannerLeadForm() {
  const getCaptchaToken = useSmartCaptchaToken();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setErrorMessage(null);
    if (!isCompleteRuMobilePhone(phone)) {
      setErrorMessage("Введите номер телефона полностью.");
      return;
    }

    setStatus("loading");
    try {
      const recaptchaToken = await getCaptchaToken();
      const params =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search)
          : null;
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Клиент",
          phone,
          message: "Заявка с главного баннера: консультация по телефону",
          source: "banner-hero",
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          utmSource: params?.get("utm_source") ?? undefined,
          utmMedium: params?.get("utm_medium") ?? undefined,
          utmCampaign: params?.get("utm_campaign") ?? undefined,
          recaptchaToken: recaptchaToken || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          typeof data?.error === "string"
            ? data.error
            : "Не удалось отправить заявку. Попробуйте позже.";
        setErrorMessage(msg);
        setStatus("error");
        return;
      }
      setStatus("success");
      setPhone("");
    } catch {
      setErrorMessage("Ошибка сети. Проверьте подключение.");
      setStatus("error");
    }
  }, [getCaptchaToken, phone]);

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-white/25 bg-black/45 px-5 py-8 text-center backdrop-blur-xl">
        <p className="text-lg font-semibold text-white">Спасибо!</p>
        <p className="mt-2 text-sm text-white/85">
          Менеджер свяжется с вами в ближайшее время.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/20 bg-black/50 px-5 py-6 shadow-2xl backdrop-blur-xl md:px-7 md:py-8">
      <p className="text-center text-lg font-semibold leading-snug text-white md:text-xl">
        Получить бесплатную консультацию
      </p>
      <p className="mt-2 text-center text-sm text-white/80">
        Наш менеджер свяжется с вами в течение 5 минут
      </p>
      <div className="mt-6 space-y-2">
        <label htmlFor="banner-phone" className="sr-only">
          Телефон
        </label>
        <Input
          id="banner-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___ - __ - __"
          value={phone}
          onChange={(e) => setPhone(formatRuPhoneInput(e.target.value))}
          className="h-12 rounded-xl border-white/40 bg-black/40 text-base text-white placeholder:text-white/45 focus-visible:ring-white/50"
        />
        {errorMessage ? (
          <p className="text-xs text-red-200">{errorMessage}</p>
        ) : null}
      </div>
      <Button
        type="button"
        className="mt-4 h-12 w-full rounded-xl bg-white text-[var(--brand-text-on-white)] hover:bg-white/95"
        disabled={status === "loading"}
        onClick={() => void submit()}
      >
        {status === "loading" ? "Отправка…" : "Получить консультацию"}
      </Button>
      <p className="mt-4 text-center text-[11px] leading-relaxed text-white/55">
        Нажимая кнопку, вы соглашаетесь с обработкой персональных данных и политикой
        конфиденциальности.
      </p>
    </div>
  );
}

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

const QUICK_LINKS = [
  { href: "/contacts", icon: Home, label: "Проект на просчёт" },
  { href: "/mortgage", icon: Calculator, label: "Калькулятор ипотеки" },
  { href: "/projects/compare", icon: Heart, label: "Избранное" },
  { href: "/contacts", icon: Bookmark, label: "В закладки" },
] as const;

export function BannerSection() {
  const [railOpen, setRailOpen] = useState(true);

  return (
    <section className="relative isolate min-h-[min(100dvh,920px)] w-full overflow-hidden bg-[#0a1814]">
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-[#070f0c] via-[#0f3d2e] to-[#152822]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/30" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[min(100dvh,920px)] max-w-[1400px] flex-col px-4 pb-10 pt-28 md:px-8 md:pb-12 md:pt-32 lg:px-12 lg:pt-36">
        <div className="grid flex-1 gap-10 lg:grid-cols-[1fr_minmax(280px,400px)] lg:items-start lg:gap-12">
          <div className="max-w-xl space-y-4 pt-2">
            <h1 className="text-balance text-3xl font-bold uppercase tracking-tight text-white drop-shadow-md md:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              Доведём от мечты до дома!
            </h1>
            <div className="space-y-1 text-balance text-xl font-semibold uppercase tracking-wide text-white/95 md:text-2xl">
              <p>Качественные дома</p>
              <p>Под ключ</p>
            </div>
            <div className="pt-3 md:pt-4">
              <Link
                href="/projects"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-7 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--accent-contrast)] shadow-lg shadow-black/20 transition hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 md:px-9 md:text-base"
              >
                <LayoutGrid className="h-5 w-5 shrink-0" aria-hidden />
                Смотреть проекты
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                Каталог типовых решений: фильтры по этажности, площади, цене и планировке.
              </p>
            </div>
          </div>

          <div className="w-full max-w-md justify-self-end lg:max-w-none">
            <BannerLeadForm />
          </div>
        </div>

        <div className="mt-auto grid gap-3 pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {BADGES.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/40 px-4 py-3 backdrop-blur-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Icon className="h-5 w-5 text-white" aria-hidden />
              </span>
              <p className="text-sm font-medium leading-snug text-white">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {railOpen ? (
        <div
          className="pointer-events-none fixed bottom-24 right-0 top-1/2 z-30 hidden -translate-y-1/2 md:block"
        >
          <div className="pointer-events-auto flex flex-col overflow-hidden rounded-l-xl border border-[var(--accent)]/80 bg-[var(--accent)] shadow-xl">
            <button
              type="button"
              className="flex h-9 w-full items-center justify-center border-b border-white/15 text-white/90 hover:bg-white/10"
              onClick={() => setRailOpen(false)}
              aria-label="Скрыть панель"
            >
              <X className="h-4 w-4" />
            </button>
            {QUICK_LINKS.map(({ href, icon: Icon, label }) => (
              <Link
                key={href + label}
                href={href}
                className="flex w-[88px] flex-col items-center gap-1 border-b border-white/10 px-2 py-3 text-center text-[10px] font-medium leading-tight text-white transition hover:bg-white/10 last:border-b-0"
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`fixed bottom-24 z-30 hidden h-12 w-8 items-center justify-center rounded-l-lg bg-[var(--accent)] text-white shadow-lg md:flex ${railRight}`}
          onClick={() => setRailOpen(true)}
          aria-label="Показать быстрые ссылки"
        >
          <Heart className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}
