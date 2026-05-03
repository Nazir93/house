"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICE_REGIONS } from "@/lib/constants";
import { TrustLeadCardBody, TrustLeadCardShell } from "@/components/sections/trust-lead-card";

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
  leadSource: _leadSource = "portfolio-case-cta",
}: {
  sectionClassName?: string;
  /** Зарезервировано под аналитику / бывший источник заявки */
  leadSource?: string;
} = {}) {
  return (
    <section className={sectionClassName ?? "mt-16 md:mt-20"} aria-labelledby="trust-us-heading">
      <TrustLeadCardShell>
        <TrustLeadCardBody variant="standalone" />
      </TrustLeadCardShell>
    </section>
  );
}
