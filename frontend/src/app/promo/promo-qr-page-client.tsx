"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ChevronLeft, Gift } from "lucide-react";
import { HouseConstructionCalculatorForm } from "@/components/construction/house-construction-calculator-form";
import { PROMO_QR_OFFERS, normalizePromoQrOfferSlug, type PromoQrOfferSlug } from "@/lib/promo-qr-offers";
import { cn } from "@/lib/utils";

function TwoStepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div
      className="mb-6 rounded-2xl border px-4 py-3 sm:px-5 sm:py-4"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
      role="navigation"
      aria-label="Два шага акции: шаг 1 из 2 и шаг 2 из 2"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
        Всего два шага
      </p>
      <div className="mt-3 flex items-center gap-2 sm:gap-3 sm:mt-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-colors",
              step === 1
                ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                : "bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-[var(--accent)] ring-1 ring-[var(--accent)]/35",
            )}
            aria-current={step === 1 ? "step" : undefined}
          >
            1
          </span>
          <span className="text-xs font-semibold sm:text-sm" style={{ color: "var(--text-muted)" }}>
            Шаг 1 из 2
          </span>
        </div>
        <div className="h-px min-w-[1.5rem] flex-1 max-w-[4rem]" style={{ backgroundColor: "var(--border)" }} aria-hidden />
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-colors",
              step === 2
                ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                : "border text-[var(--text-muted)]",
            )}
            style={step === 2 ? undefined : { borderColor: "var(--border)", backgroundColor: "transparent" }}
            aria-current={step === 2 ? "step" : undefined}
          >
            2
          </span>
          <span className="text-xs font-semibold sm:text-sm" style={{ color: "var(--text-muted)" }}>
            Шаг 2 из 2
          </span>
        </div>
      </div>
    </div>
  );
}

export function PromoQrPageClient() {
  const searchParams = useSearchParams();
  const [done, setDone] = useState<{ name: string } | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<PromoQrOfferSlug | null>(null);

  const selectedOffer = selected ? PROMO_QR_OFFERS.find((o) => o.slug === selected) ?? null : null;

  useEffect(() => {
    const raw = searchParams.get("offer") ?? searchParams.get("gift");
    const slug = normalizePromoQrOfferSlug(raw);
    if (slug) setSelected(slug);
  }, [searchParams]);

  useEffect(() => {
    if (step === 2) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  if (done) {
    return (
      <section className="min-h-[55vh] pt-28 pb-20" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <div className="container mx-auto max-w-xl px-5 text-center">
          <CheckCircle className="mx-auto mb-6" size={56} style={{ color: "var(--accent)" }} aria-hidden />
          <h1 className="font-heading text-3xl md:text-4xl mb-4">Заявка по акции отправлена</h1>
          <p className="text-lg mb-8" style={{ color: "var(--text-muted)" }}>
            {done.name}, мы свяжемся с вами и подтвердим условия подарка по выбранной услуге.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Перейти на сайт
          </Link>
          <p className="mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
            Каталог проектов, услуги и контакты — на основном сайте.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <div className="container mx-auto max-w-[1280px] px-5 pt-24 pb-10 sm:pt-28">
        <div className="mb-6 w-full">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <Gift size={14} className="shrink-0" aria-hidden />
            Акция по QR
          </span>
          <h1 className="mt-4 w-full max-w-none font-heading text-balance text-xl leading-snug tracking-tight sm:text-2xl sm:leading-snug md:text-3xl md:leading-tight lg:text-3xl xl:text-4xl">
            Специальное предложение для гостей баннера
          </h1>
        </div>

        <TwoStepIndicator step={step} />

        {step === 1 ? (
          <section
            className="rounded-2xl border p-4 sm:p-6 md:p-8"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
            aria-labelledby="promo-step1-heading"
          >
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
              Шаг 1 из 2
            </p>
            <h2 id="promo-step1-heading" className="mt-2 font-heading text-lg font-bold sm:text-xl">
              Выберите одну услугу по акции
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3">
              {PROMO_QR_OFFERS.map((offer) => {
                const active = selected === offer.slug;
                return (
                  <button
                    key={offer.slug}
                    type="button"
                    onClick={() => setSelected(offer.slug)}
                    className={cn(
                      "text-left rounded-xl border p-3.5 sm:p-4 transition-all duration-200 min-h-[7.5rem] sm:min-h-[8.5rem] flex flex-col",
                      active &&
                        "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-secondary)] dark:ring-offset-[var(--bg-secondary)]",
                    )}
                    style={{
                      borderColor: active ? "var(--accent)" : "var(--border)",
                      backgroundColor: active ? "rgba(15,61,46,0.1)" : "transparent",
                    }}
                  >
                    <span className="font-semibold text-sm leading-snug sm:text-[15px]" style={{ color: "var(--text)" }}>
                      {offer.title}
                    </span>
                    <span
                      className="mt-2 block flex-1 text-xs leading-snug line-clamp-4 sm:line-clamp-5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {offer.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {!selected ? (
              <p className="mt-4 text-sm rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-900 dark:text-amber-200/90">
                Выберите услугу, чтобы перейти ко второму шагу.
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                disabled={!selected}
                onClick={() => selected && setStep(2)}
                className="inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[220px]"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Дальше — шаг 2 из 2
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="mb-6" aria-labelledby="promo-step2-heading">
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                Шаг 2 из 2
              </p>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <h2 id="promo-step2-heading" className="font-heading text-lg font-bold sm:text-xl">
                  Ориентировочный расчёт
                </h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 self-start rounded-xl border px-3 py-2 text-xs font-semibold transition-colors hover:opacity-90 sm:text-sm"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                  Изменить подарок
                </button>
              </div>

              {selectedOffer ? (
                <div
                  className="relative mt-5 overflow-hidden rounded-2xl border-2 border-emerald-500/90 p-4 pr-4 pt-8 shadow-lg sm:p-5 sm:pr-6 sm:pt-6 dark:border-emerald-400/85"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, #059669 12%, var(--bg-secondary)) 0%, var(--bg-secondary) 55%)",
                    boxShadow: "0 12px 40px color-mix(in srgb, #059669 18%, transparent)",
                  }}
                >
                  <span
                    className="absolute right-4 top-3 inline-flex rotate-2 items-center rounded-md bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md sm:right-5 sm:top-4 sm:px-3 sm:text-[11px]"
                    aria-hidden
                  >
                    В подарок
                  </span>
                  <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-emerald-400/25 blur-2xl dark:bg-emerald-300/15" aria-hidden />
                  <p className="font-heading text-base font-bold text-emerald-900 dark:text-emerald-100 sm:text-lg">
                    {selectedOffer.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-950/90 dark:text-emerald-50/90">
                    {selectedOffer.description}
                  </p>
                </div>
              ) : null}
            </section>

            <HouseConstructionCalculatorForm
              onSuccess={(_leadId, name) => setDone({ name })}
              heading={<>Ориентировочный расчёт</>}
              promoFreeService={
                selectedOffer ? { slug: selectedOffer.slug, title: selectedOffer.title } : null
              }
              promoServiceRequired
              leadSourceOverride="promo-qr-banner"
              submitButtonLabel="Отправить заявку по акции"
              compactLayout
              hideObjectType
              hideRoofSelector
            />
          </>
        )}
      </div>
    </div>
  );
}
