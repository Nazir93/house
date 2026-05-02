"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Home,
  LayoutGrid,
  MapPinned,
  Percent,
  ShieldCheck,
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

const HERO_SLIDES = [
  {
    image: "/images/banner/hero-01.webp",
    label: "Дом в лесу",
    title: "Дом под ключ",
    caption: "Проект, стройка, инженерия и отделка в одной системе.",
  },
  {
    image: "/images/banner/hero-cutaway.webp",
    label: "Внутри дома",
    title: "Продумано до деталей",
    caption: "Планировки, сценарии жизни и прозрачная смета до старта работ.",
  },
] as const;

export function BannerSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = HERO_SLIDES[activeSlide] ?? HERO_SLIDES[0];

  return (
    <section className="relative isolate min-h-[min(100svh,940px)] w-full overflow-hidden bg-[#07110e]">
      <div className="absolute inset-0 bg-[#07110e]" aria-hidden>
        {HERO_SLIDES.map((item, idx) => (
          <Image
            key={item.image}
            src={item.image}
            alt=""
            fill
            priority={idx === 0}
            sizes="100vw"
            className={`object-cover transition-[opacity,transform,filter] duration-[1200ms] ease-out ${
              idx === activeSlide
                ? "scale-100 opacity-100 blur-0"
                : "scale-[1.035] opacity-0 blur-[2px]"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/52 to-black/16" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-black/42" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(246,246,244,0.16),transparent_32%),radial-gradient(circle_at_78%_72%,rgba(15,61,46,0.32),transparent_36%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[min(100svh,940px)] max-w-[1440px] flex-col px-4 pb-8 pt-28 md:px-8 md:pb-10 md:pt-32 lg:px-12 lg:pt-36">
        <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,410px)] lg:items-center lg:gap-14">
          <div className="max-w-3xl pt-2">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/82 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
              Проектирование и строительство домов
            </div>
            <h1 className="max-w-4xl text-balance font-heading text-[clamp(2.35rem,7vw,6.7rem)] font-bold uppercase leading-[0.88] tracking-[-0.055em] text-white drop-shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
              Строим дома,
              <span className="block text-white/76">в которые хочется</span>
              <span className="block text-[var(--accent)]">возвращаться</span>
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-white/78 md:text-lg">
              От идеи и выбора проекта до коробки, инженерии и отделки под ключ. Работаем с прозрачной сметой, понятными этапами и личным сопровождением.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/projects"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#0f3d2e] shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-white/95 md:px-8"
              >
                <LayoutGrid className="h-5 w-5 shrink-0" aria-hidden />
                Смотреть проекты
              </Link>
              <Link
                href="/contacts"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/28 bg-white/[0.08] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.14] md:px-8"
              >
                Рассчитать стоимость
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </div>

            <div className="mt-9 grid max-w-2xl grid-cols-3 gap-2 rounded-3xl border border-white/14 bg-black/24 p-2 backdrop-blur-xl sm:gap-3 sm:p-3">
              {[
                ["01", "Фиксируем смету"],
                ["02", "Проект + стройка"],
                ["03", "Гарантия по договору"],
              ].map(([num, text]) => (
                <div key={num} className="rounded-2xl bg-white/[0.08] px-3 py-3">
                  <p className="text-[10px] font-bold text-white/42">{num}</p>
                  <p className="mt-1 text-xs font-semibold leading-snug text-white sm:text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md justify-self-end lg:max-w-none">
            <div className="mb-4 overflow-hidden rounded-[1.75rem] border border-white/18 bg-white/[0.08] p-2 shadow-2xl shadow-black/25 backdrop-blur-xl">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.35rem] bg-black/30">
                <Image
                  src={slide.image}
                  alt={slide.label}
                  fill
                  sizes="(max-width: 1024px) 90vw, 410px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/74 via-transparent to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">{slide.label}</p>
                  <p className="mt-1 font-heading text-xl font-bold text-white">{slide.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/72">{slide.caption}</p>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {HERO_SLIDES.map((item, idx) => (
                  <button
                    key={item.image}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`relative h-20 overflow-hidden rounded-2xl border text-left transition ${
                      idx === activeSlide
                        ? "border-white/80 opacity-100"
                        : "border-white/12 opacity-64 hover:opacity-90"
                    }`}
                    aria-label={`Показать слайд: ${item.label}`}
                  >
                    <Image src={item.image} alt="" fill sizes="160px" className="object-cover" />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-2 left-2 right-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                      {String(idx + 1).padStart(2, "0")} · {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <BannerLeadForm />
          </div>
        </div>

        <div className="mt-auto grid gap-3 pt-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {BADGES.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-2xl border border-white/14 bg-black/30 px-4 py-3 shadow-lg shadow-black/10 backdrop-blur-xl"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon className="h-5 w-5 text-white" aria-hidden />
              </span>
              <p className="text-sm font-medium leading-snug text-white">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg)] to-transparent" aria-hidden />
    </section>
  );
}
