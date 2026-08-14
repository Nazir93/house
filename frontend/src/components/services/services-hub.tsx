"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

import type { ServiceItem } from "@/lib/get-services";
import { resolveServiceHubVisual } from "@/lib/service-card-media";
import { SERVICES_PROCESS_STEPS, getServiceHubCopy, slugSegmentFromServiceHref } from "@/lib/services-hub-data";
import { resolveServiceHubDisplay } from "@/lib/resolve-service-hub-display";
import { serviceHubItemHref } from "@/lib/seo/ssr-seo-html";
import { useModal } from "@/lib/modal-context";
import { cn } from "@/lib/utils";

type HubRow = {
  service: ServiceItem;
  segment: string;
  index: number;
};

export function ServicesHub({
  services,
  pageH1,
  introText,
}: {
  services: ServiceItem[];
  pageH1: string;
  introText: string;
}) {
  const rows: HubRow[] = useMemo(
    () =>
      services.map((service, index) => ({
        service,
        segment: slugSegmentFromServiceHref(service.slug),
        index,
      })),
    [services],
  );

  const [active, setActive] = useState(0);
  const { openModal } = useModal();
  if (rows.length === 0) {
    return (
      <div className="container mx-auto max-w-[900px] px-4 py-20 text-center text-[var(--text-muted)]">
        <h1 className="font-heading text-xl font-semibold text-[var(--text)]">{pageH1}</h1>
        <p className="mt-3 text-sm">Список услуг пока недоступен. Зайдите позже или свяжитесь с нами.</p>
        <Link href="/contacts" className="mt-6 inline-block text-sm font-semibold text-[var(--accent)]">
          Контакты
        </Link>
      </div>
    );
  }

  const total = rows.length;
  const current = rows[Math.min(active, rows.length - 1)];
  const hub = current ? getServiceHubCopy(current.segment) : null;
  const display = current
    ? resolveServiceHubDisplay(current.segment, current.service, hub)
    : null;
  const href = current?.service.slug.startsWith("/")
    ? current.service.slug
    : `/services/${current?.service.slug}`;

  const cardTitle = display?.cardTitle ?? "Услуга";
  const cardDescription = display?.cardDescription ?? "";
  const sectionParagraphs = display?.sectionParagraphs ?? [];
  const features = display?.features ?? [];
  const ctaLabel = display?.ctaLabel ?? "Подробнее об услуге";
  const ctaAction = display?.ctaAction ?? "link";
  const hubVisual = current
    ? resolveServiceHubVisual(current.service, display?.centerImageSrc ?? hub?.centerImageSrc)
    : { coverImage: null, videoUrl: null };
  const centerSrc = hubVisual.coverImage;
  const centerVideo = hubVisual.videoUrl;

  const ctaClassName = cn(
    "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] sm:w-auto sm:min-w-[240px]",
    features.length > 0 ? "mt-6" : "",
  );

  return (
    <div>
      <div className="container mx-auto max-w-[1380px] px-4 pt-8 sm:px-6 md:pt-10 lg:px-10">
        <h1 className="font-heading text-[clamp(1.35rem,2.4vw,2rem)] font-semibold tracking-tight text-[var(--text)]">
          {pageH1}
        </h1>
      </div>

      <div className="container mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-10">
        <div className="mt-10">
          <h2 className="font-heading text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold leading-[1.15] tracking-tight text-[var(--text)]">
            Каждая услуга влияет на качество будущего дома
          </h2>
          <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-[var(--text-muted)] sm:text-[15px]">
            {introText
              .split(/\n\n+/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
          </div>
          <Link
            href="/portfolio"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
          >
            Посмотреть все проекты
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>

          {/* Все направления — одна линия (на узком экране горизонтальный скролл) */}
          <nav className="mt-8" aria-label="Направления услуг">
            <div className="relative border-b border-[var(--border)]">
              <div className="-mx-4 flex snap-x snap-mandatory flex-nowrap gap-2 overflow-x-auto px-4 pb-px [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:justify-start sm:gap-2 sm:px-0 md:gap-2.5 [&::-webkit-scrollbar]:hidden">
                {rows.map(({ service, segment }, idx) => {
                  const on = idx === active;
                  const label = resolveServiceHubDisplay(segment, service).navTitle;
                  const tabHref = serviceHubItemHref(service.slug);
                  return (
                    <Link
                      key={service.id}
                      href={tabHref}
                      role="tab"
                      aria-selected={on}
                      id={`services-hub-tab-${idx}`}
                      scroll={false}
                      onClick={(e) => {
                        e.preventDefault();
                        setActive(idx);
                      }}
                      className={cn(
                        "snap-start whitespace-nowrap rounded-t-xl border border-b-0 px-3.5 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors sm:px-4 sm:py-3 sm:text-[12px] md:text-[13px]",
                        "outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
                        on
                          ? "relative z-[1] border-[var(--border)] bg-[var(--bg)] text-[var(--text)] shadow-[0_-2px_0_0_var(--bg)]"
                          : "border-transparent bg-transparent text-[var(--text-subtle)] hover:bg-black/[0.03] hover:text-[var(--text)]",
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* ТЗ SEO §20: все услуги и ссылки в HTML (не только активная вкладка). */}
          <ul className="sr-only">
            {rows.map(({ service, segment }) => {
              const d = resolveServiceHubDisplay(segment, service);
              return (
                <li key={`seo-${service.id}`}>
                  <Link href={serviceHubItemHref(service.slug)}>{d.navTitle}</Link>
                  {d.cardDescription ? <p>{d.cardDescription}</p> : null}
                </li>
              );
            })}
          </ul>

          {/* Слева изображение, справа компактное описание; ниже — явный состав выбранной услуги. */}
          <div
            className="mt-0 border border-t-0 border-[var(--border)] bg-[var(--bg)] p-4 sm:p-5 md:p-6 lg:p-7"
            role="tabpanel"
            aria-labelledby={`services-hub-heading-${active}`}
          >
            <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-10">
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-[22px] shadow-[0_20px_56px_rgba(0,0,0,0.06)]",
                  "aspect-[1024/682] min-h-[220px] sm:min-h-[260px] lg:min-h-[280px]",
                )}
              >
                {centerVideo ? (
                  <video
                    key={centerVideo}
                    src={centerVideo}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    muted
                    playsInline
                    autoPlay
                    loop
                    aria-label={`Видео: ${cardTitle}`}
                  />
                ) : centerSrc ? (
                  <Image
                    key={centerSrc}
                    src={centerSrc}
                    alt={`Иллюстрация: ${cardTitle}`}
                    fill
                    className="object-cover object-center transition-opacity duration-300"
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    priority={active === 0}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--card-bg)] px-6 text-center">
                    <div
                      className="h-px w-24 bg-[var(--border)]"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(90deg, var(--border) 0, var(--border) 6px, transparent 6px, transparent 12px)",
                      }}
                    />
                    <p className="max-w-[220px] font-heading text-sm font-semibold text-[var(--text-muted)]">
                      Визуал раздела
                    </p>
                    <p className="max-w-xs text-xs leading-relaxed text-[var(--text-subtle)]">
                      Загрузите «Изображение услуги» в админке или файл в{" "}
                      <code className="rounded bg-[var(--bg-secondary)] px-1 py-0.5 text-[11px]">public</code>.
                    </p>
                  </div>
                )}
              </div>

              <div className="min-w-0 lg:pt-0">
                <header>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                    {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </p>
                  <h3
                    id={`services-hub-heading-${active}`}
                    className="mt-2.5 font-heading text-[clamp(1.25rem,2.2vw,1.7rem)] font-semibold leading-[1.12] tracking-tight text-[var(--text)] lg:mt-3"
                  >
                    {cardTitle}
                  </h3>
                </header>

                <p className="mt-4 text-[14px] font-medium leading-[1.55] text-[var(--text)] md:text-[15px]">{cardDescription}</p>

                {sectionParagraphs.length > 0 ? (
                  <div className="mt-4 space-y-3 text-[13px] leading-[1.55] text-[var(--text-muted)] md:text-[14px]">
                    {sectionParagraphs.map((para, i) => (
                      <p key={`${active}-${i}`}>{para}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 border-t border-[var(--border)] pt-6">
              {features.length > 0 ? (
                <div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                      Что входит в услугу
                    </p>
                    <h4 className="mt-1 font-heading text-lg font-semibold leading-tight text-[var(--text)] md:text-xl">
                      СОСТАВ УСЛУГИ
                    </h4>
                  </div>

                  <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {features.map(({ Icon, label }) => (
                      <li
                        key={label}
                        className="flex min-h-[104px] flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 shadow-sm"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--accent)]">
                          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} aria-hidden />
                        </span>
                        <span className="mt-3 text-[13px] font-semibold leading-snug text-[var(--text)] md:text-[14px]">
                          {label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {ctaAction === "modal" ? (
                <button type="button" onClick={openModal} className={ctaClassName}>
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </button>
              ) : (
                <Link href={href} className={ctaClassName}>
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Как мы строим — вплотную к футеру, без «полоски» фона страницы снизу */}
      <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)] py-14 md:py-16">
        <div className="container mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-10">
          <h2 className="text-center font-heading text-[clamp(1.25rem,2vw,1.65rem)] font-semibold text-[var(--text)]">
            Как мы строим
          </h2>
          <div className="mt-10 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] lg:overflow-visible">
            <ol className="flex min-w-[min(100%,1020px)] flex-row flex-nowrap items-start gap-2 lg:mx-auto lg:max-w-6xl lg:justify-between lg:gap-1">
              {SERVICES_PROCESS_STEPS.map((step, i) => (
                <Fragment key={step.title}>
                  <li className="flex w-[120px] shrink-0 flex-col items-center text-center sm:w-[140px] lg:w-auto lg:min-w-0 lg:flex-1">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--accent)] shadow-sm">
                      <step.Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                    </span>
                    <span className="mt-3 px-0.5 font-heading text-[12px] font-semibold leading-tight text-[var(--text)] sm:text-[13px]">
                      {step.title}
                    </span>
                    <span className="mt-1 max-w-[120px] text-[12px] leading-relaxed text-[var(--text-muted)] sm:max-w-[140px] sm:text-[13px]">
                      {step.description}
                    </span>
                  </li>
                  {i < SERVICES_PROCESS_STEPS.length - 1 ? (
                    <li className="hidden shrink-0 list-none items-center self-center pt-2 lg:flex" aria-hidden>
                      <ChevronRight className="h-4 w-4 text-[var(--text-subtle)]" />
                    </li>
                  ) : null}
                </Fragment>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
