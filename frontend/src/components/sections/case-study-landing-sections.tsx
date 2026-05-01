"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ChevronDown, Send } from "lucide-react";
import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";
import { MaxMessengerIcon } from "@/components/icons/max-messenger-icon";
import { SERVICE_REGIONS, SITE_NAME } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";

const FAQ_ITEMS: { id: string; q: string; a: string }[] = [
  {
    id: "1",
    q: "Во сколько в итоге обойдётся дом вместе с отделкой и инженерией?",
    a: "Стоимость складывается из проекта, коробки, инженерии и отделки. Мы заранее раскладываем смету по этапам и фиксируем объём работ в договоре — без «сюрпризов» по ходу стройки.",
  },
  {
    id: "2",
    q: "За какой срок вы строите дом?",
    a: "Срок зависит от площади, материалов и комплектации. Ориентиры обсуждаем на встрече и прописываем в графике работ.",
  },
  {
    id: "3",
    q: "Сколько времени проходит от договора до начала стройки?",
    a: "Обычно от нескольких недель до пары месяцев: проектная документация, заявки, доставка материалов и организация площадки.",
  },
  {
    id: "4",
    q: "Почему у вас дороже, чем у конкурентов?",
    a: "Мы не экономим на узлах, гидроизоляции и контроле качества. Прозрачная смета и гарантийные обязательства входят в цену.",
  },
  {
    id: "5",
    q: "Можно ли изменить площадь и размеры окон в серийном проекте?",
    a: "Да, типовой проект можно адаптировать: перепланировки, окна, входные группы — согласуем с несущей схемой и узлами.",
  },
  {
    id: "6",
    q: "Строите ли вы в ипотеку?",
    a: "Да, работаем с банками и помогаем с пакетом документов для ипотеки на строительство.",
  },
  {
    id: "7",
    q: "Что входит в стоимость, а что оплачивается отдельно?",
    a: "В договоре отдельно перечислены работы и материалы «под ключ» и позиции, которые заказываются по факту (например, чистовая отделка выбранного класса).",
  },
  {
    id: "8",
    q: "Как вы гарантируете, что доплат по ходу работ не будет?",
    a: "Фиксируем объём и условия изменений: любые допработки — только по согласованному допсоглашению, без скрытых строк.",
  },
];

const STAGE_SERVICES: { title: string; description: string }[] = [
  {
    title: "Комплексная проверка участка",
    description: "Геодезия, геология и юридическая проверка",
  },
  {
    title: "Наружные сети и участок",
    description:
      "Дренаж, отмостка, ливневая канализация, скважины, очистные сооружения, газгольдеры, проведение воды и электричества, теплотрасса, сбросной колодец",
  },
  {
    title: "Отделка фасадов",
    description: "Покраска деревянных домов, отделка фасадов каменных домов",
  },
  {
    title: "Внутренняя отделка и внутренние инженерные коммуникации",
    description:
      "Перегородки, скрытые работы, монтаж отопления, вентиляции, водоснабжения и канализации, электрика, кондиционирование, отопительные приборы, отделка полов по лагам, тёплые полы, стяжка, котельная, отделка стен и потолка, внутренняя покраска.",
  },
];

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

export function CaseStudyFaqSection({ sectionClassName }: { sectionClassName?: string }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className={sectionClassName ?? "mt-16 md:mt-20"} aria-labelledby="case-faq-heading">
      <h2
        id="case-faq-heading"
        className="text-center font-heading text-2xl font-bold tracking-tight text-[var(--text)] md:text-[1.65rem] lg:text-[1.85rem]"
      >
        Частые вопросы и ответы
      </h2>
      <div className="mt-8 grid gap-3 md:grid-cols-2 md:gap-4 lg:mt-10">
        {FAQ_ITEMS.map((item) => {
          const open = openId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-[1rem] border bg-[var(--bg)] px-4 py-3 shadow-[0_1px_0_rgba(255,255,255,0.75)_inset] md:rounded-[1.1rem] md:px-5 md:py-4"
              style={{ borderColor: "rgba(43, 47, 45, 0.08)" }}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-start justify-between gap-3 text-left"
                aria-expanded={open}
              >
                <span className="text-[13px] font-medium leading-snug text-[var(--text)] sm:text-sm">{item.q}</span>
                <ChevronDown
                  className={`mt-0.5 h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  strokeWidth={2}
                />
              </button>
              {open ? (
                <p className="mt-3 border-t border-[var(--border)] pt-3 text-[13px] leading-relaxed text-[var(--text-muted)] sm:text-sm">
                  {item.a}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ConstructionServicesStagesSection({ sectionClassName }: { sectionClassName?: string }) {
  return (
    <section className={sectionClassName ?? "mt-16 md:mt-20"} aria-labelledby="case-stages-heading">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <h2
          id="case-stages-heading"
          className="max-w-xl font-heading text-2xl font-bold leading-tight tracking-tight text-[var(--text)] md:text-[1.65rem] lg:text-[1.85rem]"
        >
          Строительные услуги по этапам
        </h2>
        <p className="max-w-md text-[13px] leading-relaxed text-[var(--text-muted)] lg:pb-1 lg:text-right lg:text-sm">
          Строительство загородных домов под ключ. Работаем в: {SERVICE_REGIONS}.
        </p>
      </div>
      <ul className="mt-8 flex flex-col gap-3 md:mt-10 md:gap-4">
        {STAGE_SERVICES.map((row) => (
          <li
            key={row.title}
            className="flex flex-col gap-3 rounded-[1rem] border bg-[var(--bg)] px-5 py-4 md:flex-row md:items-start md:gap-10 md:rounded-[1.15rem] md:px-7 md:py-5"
            style={{ borderColor: "rgba(43, 47, 45, 0.08)" }}
          >
            <span className="font-heading text-[15px] font-semibold text-[var(--text)] md:w-[min(38%,280px)] md:shrink-0 md:text-base">
              {row.title}
            </span>
            <span className="text-[13px] leading-relaxed text-[var(--text-muted)] md:flex-1 md:text-[14px]">{row.description}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CaseStudyLeadCtaSection({
  sectionClassName,
  leadSource = "portfolio-case-cta",
}: {
  sectionClassName?: string;
  /** Источник заявки в CRM / аналитике */
  leadSource?: string;
} = {}) {
  const contact = useContactConfig();
  const getCaptchaToken = useSmartCaptchaToken();
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setErrorMessage(null);
    if (!consent) {
      setErrorMessage("Нужно согласие на обработку персональных данных.");
      return;
    }
    if (!isCompleteRuMobilePhone(phone)) {
      setErrorMessage("Введите номер телефона полностью.");
      return;
    }
    setStatus("loading");
    try {
      const recaptchaToken = await getCaptchaToken();
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Клиент",
          phone,
          message:
            leadSource === "home-landing-cta"
              ? `Заявка с главной страницы (${SITE_NAME}): перезвонить`
              : `Заявка со страницы кейса (${SITE_NAME}): перезвонить`,
          source: leadSource,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          utmSource: params?.get("utm_source") ?? undefined,
          utmMedium: params?.get("utm_medium") ?? undefined,
          utmCampaign: params?.get("utm_campaign") ?? undefined,
          recaptchaToken: recaptchaToken || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(typeof data.error === "string" ? data.error : "Не удалось отправить. Попробуйте позже.");
        setStatus("idle");
        return;
      }
      setStatus("success");
      setPhone("");
      setConsent(false);
    } catch {
      setErrorMessage("Ошибка сети. Попробуйте позже или напишите в мессенджер.");
      setStatus("idle");
    }
  }, [consent, getCaptchaToken, leadSource, phone]);

  return (
    <section className={sectionClassName ?? "mt-16 md:mt-20"} aria-labelledby="case-cta-heading">
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 lg:items-stretch">
        <div
          className="flex flex-col rounded-[1.25rem] border px-6 py-7 md:rounded-[1.5rem] md:px-8 md:py-8"
          style={{
            borderColor: "rgba(43, 47, 45, 0.08)",
            backgroundColor: "var(--bg)",
            boxShadow: "0 24px 48px rgba(43, 47, 45, 0.06)",
          }}
        >
          <h2 id="case-cta-heading" className="font-heading text-xl font-bold leading-snug text-[var(--text)] md:text-2xl">
            Начните строить будущее уже сегодня
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)] md:text-sm">
            Оставьте заявку — мы быстро перезвоним, чтобы ответить на вопросы по проекту, материалам и смете.
          </p>
          <label className="mt-6 block text-[13px] font-medium text-[var(--text)]">
            Телефон
            <input
              type="tel"
              autoComplete="tel"
              placeholder="+7 (___) ___ - __ - __"
              value={phone}
              onChange={(e) => setPhone(formatRuPhoneInput(e.target.value))}
              className="mt-2 w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)]/25"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
            />
          </label>
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-[12px] leading-snug text-[var(--text-muted)]">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] accent-[var(--accent)]" />
            <span>
              Я согласен на{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-[var(--accent)]">
                обработку персональных данных
              </Link>
            </span>
          </label>
          {errorMessage ? <p className="mt-3 text-[13px] text-red-700">{errorMessage}</p> : null}
          {status === "success" ? (
            <p className="mt-3 text-[13px] font-medium text-[var(--accent)]">Заявка отправлена. Мы свяжемся с вами.</p>
          ) : null}
          <button
            type="button"
            onClick={submit}
            disabled={status === "loading" || status === "success"}
            className="mt-6 w-full rounded-xl px-5 py-3.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-[0.94] disabled:opacity-60"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {status === "loading" ? "Отправка…" : "Позвоните мне"}
          </button>
        </div>

        <div className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-[1.25rem] md:min-h-[320px] md:rounded-[1.5rem] lg:min-h-0">
          <div
            className="absolute inset-0 bg-[length:cover] bg-center"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(18,42,34,0.97) 0%, rgba(15,61,46,0.88) 45%, rgba(10,38,30,0.95) 100%), radial-gradient(ellipse 90% 70% at 80% 20%, rgba(255,255,255,0.07) 0%, transparent 55%)",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/28 to-transparent" aria-hidden />
          <div className="relative z-[1] p-6 md:p-8">
            <p className="font-heading text-lg font-semibold text-white md:text-xl">Или напишите в любом мессенджере</p>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-white/85 md:text-sm">Быстрые ответы на вопросы и связь с менеджером</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {contact.social.telegram ? (
                <a
                  href={contact.social.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:bg-white/95"
                >
                  <Send size={18} className="text-[#229ED9]" aria-hidden />
                  Чат в Telegram
                </a>
              ) : null}
              {contact.social.max ? (
                <a
                  href={contact.social.max}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:bg-white/95"
                >
                  <MaxMessengerIcon className="h-[18px] w-[18px] shrink-0 text-[var(--accent)]" aria-hidden />
                  Чат в Max
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
