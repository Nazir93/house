"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Send } from "lucide-react";
import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";
import { cn } from "@/lib/utils";
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

const STAGE_SERVICES: { id: string; title: string; description: string; image: string }[] = [
  {
    id: "site-check",
    title: "Комплексная проверка участка",
    description: "Геодезия, геология и юридическая проверка",
    image: "/images/banner/banner-hero-03.png",
  },
  {
    id: "utilities",
    title: "Наружные сети и участок",
    description:
      "Дренаж, отмостка, ливневая канализация, скважины, очистные сооружения, газгольдеры, проведение воды и электричества, теплотрасса, сбросной колодец",
    image: "/images/banner/banner-hero-05.png",
  },
  {
    id: "facade",
    title: "Отделка фасадов",
    description: "Покраска деревянных домов, отделка фасадов каменных домов",
    image: "/images/banner/banner-hero-06.png",
  },
  {
    id: "interior",
    title: "Внутренняя отделка и внутренние инженерные коммуникации",
    description:
      "Перегородки, скрытые работы, монтаж отопления, вентиляции, водоснабжения и канализации, электрика, кондиционирование, отопительные приборы, отделка полов по лагам, тёплые полы, стяжка, котельная, отделка стен и потолка, внутренняя покраска.",
    image: "/images/banner/banner-hero-01.png",
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
      <div className="mb-8 w-full min-w-0 md:mb-9">
        <div className="w-full min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Вопросы клиентов</p>
          <h2
            id="case-faq-heading"
            className="mt-2.5 w-full max-w-none text-balance font-heading text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl md:text-[2.2rem] md:leading-[1.1]"
          >
            Частые вопросы и ответы
          </h2>
          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-[var(--text-muted)] sm:text-sm">
            Сроки, смета, ипотека и доработки типового проекта — кратко и по делу.
          </p>
        </div>
      </div>

      <div className="grid gap-0 sm:gap-x-10 md:grid-cols-2 md:gap-x-12">
        {FAQ_ITEMS.map((item) => {
          const open = openId === item.id;
          const panelId = `case-faq-panel-${item.id}`;
          return (
            <div
              key={item.id}
              className="border-b border-[var(--border)] py-4 md:py-5"
            >
              <button
                type="button"
                id={`case-faq-trigger-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className="group flex w-full items-start gap-3 py-1 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] md:gap-4"
                aria-expanded={open}
                aria-controls={panelId}
              >
                <span className="min-w-0 flex-1 font-heading text-[15px] font-semibold leading-snug tracking-tight text-[var(--text)] sm:text-base">
                  {item.q}
                </span>
                <ChevronDown
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-300 ease-out group-hover:text-[var(--text)]",
                    open && "rotate-180 text-[var(--accent)]",
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={`case-faq-trigger-${item.id}`}
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="pt-3 pr-8 md:pr-10">
                    <p className="text-[14px] leading-relaxed text-[var(--text-muted)] sm:text-[15px] md:leading-[1.65]">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ConstructionServicesStagesSection({ sectionClassName }: { sectionClassName?: string }) {
  const [previewId, setPreviewId] = useState(STAGE_SERVICES[0].id);
  const activeStage = STAGE_SERVICES.find((s) => s.id === previewId) ?? STAGE_SERVICES[0];

  return (
    <section className={sectionClassName ?? "mt-16 md:mt-20"} aria-labelledby="case-stages-heading">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <h2
          id="case-stages-heading"
          className="w-full min-w-0 max-w-none flex-1 text-balance font-heading text-xl font-bold leading-tight tracking-tight text-[var(--text)] md:text-[1.45rem] lg:text-[1.6rem]"
        >
          Строительные услуги по этапам
        </h2>
        <p className="w-full min-w-0 shrink-0 max-w-md text-[12px] leading-relaxed text-[var(--text-muted)] lg:pb-0.5 lg:text-right lg:text-[13px]">
          Строительство загородных домов под ключ. Работаем в: {SERVICE_REGIONS}.
        </p>
      </div>

      <div className="mt-6 md:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_min(340px,40%)] lg:items-start lg:gap-8 xl:gap-11">
        <ul className="flex min-w-0 flex-col border-t border-[var(--border)]">
          {STAGE_SERVICES.map((row) => {
            const active = row.id === previewId;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onMouseEnter={() => setPreviewId(row.id)}
                  onFocus={() => setPreviewId(row.id)}
                  onClick={() => setPreviewId(row.id)}
                  className={cn(
                    "flex w-full flex-col gap-2.5 border-b border-[var(--border)] py-4 text-left outline-none transition-colors duration-200 md:flex-row md:items-start md:gap-8 md:py-5 lg:gap-10",
                    "hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] dark:hover:bg-white/[0.04]",
                    active && "bg-[var(--accent)]/[0.08] dark:bg-[var(--accent)]/[0.12]",
                  )}
                >
                  <span className="font-heading text-[14px] font-semibold text-[var(--text)] md:w-[min(38%,260px)] md:shrink-0 md:text-[15px]">
                    {row.title}
                  </span>
                  <span className="text-[13px] leading-relaxed text-[var(--text-muted)] md:flex-1 md:text-[14px]">{row.description}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded-2xl lg:mt-0 lg:aspect-[3/4] lg:sticky lg:top-[calc(var(--site-header-sticky-offset)+1rem)] lg:self-start">
          <Image
            key={activeStage.id}
            src={activeStage.image}
            alt={activeStage.title}
            fill
            sizes="(max-width: 1024px) 100vw, 380px"
            quality={90}
            className="object-cover object-center transition-opacity duration-500 ease-out"
            priority={false}
          />
        </div>
      </div>
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
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-5 lg:items-stretch">
        <div
          className="flex flex-col rounded-[1.5rem] border px-5 py-6 md:rounded-[1.75rem] md:px-7 md:py-8"
          style={{
            borderColor: "rgba(43, 47, 45, 0.08)",
            backgroundColor: "var(--bg)",
            boxShadow: "0 24px 48px rgba(43, 47, 45, 0.06)",
          }}
        >
          <h2 id="case-cta-heading" className="w-full max-w-none text-balance font-heading text-lg font-bold leading-snug text-[var(--text)] md:text-xl">
            Начните строить будущее уже сегодня
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)] md:text-sm">
            Оставьте заявку — мы быстро перезвоним, чтобы ответить на вопросы по проекту, материалам и смете.
          </p>
          <label className="mt-6 block text-[13px] font-medium text-[var(--text)]">
            Телефон
            <div
              className={cn(
                "mt-2.5 overflow-hidden rounded-full transition-shadow duration-200",
                "bg-white shadow-[inset_0_0_0_1px_rgba(26,30,29,0.12)]",
                "hover:shadow-[inset_0_0_0_1px_rgba(15,61,46,0.22)]",
                "focus-within:shadow-[inset_0_0_0_2px_var(--accent),0_4px_18px_rgba(15,61,46,0.08)]",
                "dark:bg-[var(--bg-secondary)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:focus-within:shadow-[inset_0_0_0_2px_var(--accent),0_4px_22px_rgba(0,0,0,0.25)]",
              )}
            >
              <input
                type="tel"
                autoComplete="tel"
                placeholder="+7 (___) ___ - __ - __"
                value={phone}
                onChange={(e) => setPhone(formatRuPhoneInput(e.target.value))}
                className={cn(
                  "min-h-[52px] w-full appearance-none rounded-full border-0 bg-transparent px-5 py-3.5 text-[16px] outline-none sm:text-[15px]",
                  "text-[var(--text)] placeholder:text-[var(--text-muted)]",
                  "focus:outline-none focus:ring-0 focus-visible:outline-none",
                )}
              />
            </div>
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
            className="mt-6 min-h-[52px] w-full rounded-full px-8 py-3 text-[15px] font-semibold text-[var(--accent-contrast)] shadow-[0_10px_28px_rgba(15,61,46,0.22)] transition-[opacity,transform,box-shadow] hover:shadow-[0_12px_32px_rgba(15,61,46,0.26)] active:scale-[0.99] disabled:opacity-60 disabled:active:scale-100 dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
            style={{ backgroundColor: "var(--accent)" }}
          >
            {status === "loading" ? "Отправка…" : "Позвоните мне"}
          </button>
        </div>

        <div className="relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-[1.15rem] md:min-h-[280px] md:rounded-[1.35rem] lg:min-h-0">
          <div
            className="absolute inset-0 bg-[length:cover] bg-center"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(18,42,34,0.97) 0%, rgba(15,61,46,0.88) 45%, rgba(10,38,30,0.95) 100%), radial-gradient(ellipse 90% 70% at 80% 20%, rgba(255,255,255,0.07) 0%, transparent 55%)",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/28 to-transparent" aria-hidden />
          <div className="relative z-[1] p-5 md:p-6">
            <p className="font-heading text-base font-semibold text-white md:text-lg">Или напишите в любом мессенджере</p>
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
