"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Gift } from "lucide-react";
import { HouseConstructionCalculatorForm } from "@/components/construction/house-construction-calculator-form";
import {
  CONSTRUCTION_SERVICES,
  CONSTRUCTION_SERVICE_SLUGS,
  type ConstructionServiceSlug,
} from "@/lib/construction-service-data";

export function PromoQrPageClient() {
  const [done, setDone] = useState<{ name: string } | null>(null);
  const [selected, setSelected] = useState<ConstructionServiceSlug | null>(null);

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
    <>
      <div className="container mx-auto max-w-[1280px] px-5 pt-28 pb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <Gift size={14} className="shrink-0" aria-hidden />
              Акция по QR
            </span>
            <h1 className="mt-5 font-heading text-3xl md:text-5xl tracking-tight max-w-3xl">
              Специальное предложение для гостей баннера
            </h1>
            <p className="mt-4 max-w-2xl text-lg" style={{ color: "var(--text-muted)" }}>
              Выберите одну услугу из списка — при расчёте дома она учитывается как промо (одна позиция на заявку).
              Заполните параметры ориентировочного расчёта и отправьте заявку — менеджер свяжется с вами.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            На основной сайт
          </Link>
        </div>

        <section
          className="rounded-2xl border p-5 md:p-8 mb-10"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
        >
          <p className="text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: "var(--text-muted)" }}>
            Шаг 1 · одна услуга по акции (выберите одну)
          </p>
          <p className="text-sm mb-6 max-w-3xl" style={{ color: "var(--text-muted)" }}>
            Отметьте только один пункт. Финальные условия акции и состав работ фиксируются при звонке менеджера.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONSTRUCTION_SERVICE_SLUGS.map((slug) => {
              const svc = CONSTRUCTION_SERVICES[slug];
              const active = selected === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setSelected(slug)}
                  className="text-left rounded-xl border p-4 transition-all duration-200"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    backgroundColor: active ? "rgba(15,61,46,0.08)" : "transparent",
                  }}
                >
                  <span className="font-semibold" style={{ color: "var(--text)" }}>
                    {svc.title}
                  </span>
                  <span className="block mt-2 text-xs leading-snug line-clamp-3" style={{ color: "var(--text-muted)" }}>
                    {svc.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
          {!selected ? (
            <p className="mt-4 text-sm text-amber-800 dark:text-amber-200/90">
              Выберите услугу, чтобы отправить заявку с расчётом.
            </p>
          ) : null}
        </section>

        <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--text-muted)" }}>
          Шаг 2 · ориентировочный расчёт
        </p>
      </div>

      <HouseConstructionCalculatorForm
        onSuccess={(_leadId, name) => setDone({ name })}
        heading={
          <>
            ОРИЕНТИРОВОЧНЫЙ
            <br />
            РАСЧЁТ
          </>
        }
        promoFreeService={
          selected ? { slug: selected, title: CONSTRUCTION_SERVICES[selected].title } : null
        }
        promoServiceRequired
        leadSourceOverride="promo-qr-banner"
        submitButtonLabel="Отправить заявку по акции"
      />
    </>
  );
}
