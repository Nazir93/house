"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { HouseConstructionCalculatorForm } from "@/components/construction/house-construction-calculator-form";
import type { CommercialPageSeo } from "@/lib/seo/commercial-page-seo";

export function CalculatorPageClient({ seo }: { seo: CommercialPageSeo }) {
  const [done, setDone] = useState<{ name: string } | null>(null);

  if (done) {
    return (
      <section className="page-top-offset min-h-[55vh] pb-20" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <div className="container mx-auto max-w-xl px-5 text-center">
          <CheckCircle className="mx-auto mb-6" size={56} style={{ color: "var(--accent)" }} aria-hidden />
          <h1 className="font-heading text-3xl md:text-4xl mb-4">Заявка отправлена</h1>
          <p className="text-lg mb-10" style={{ color: "var(--text-muted)" }}>
            {done.name}, мы свяжемся с вами и уточним детали расчёта.
          </p>
          <Link href="/" className="text-sm font-semibold underline underline-offset-4" style={{ color: "var(--accent)" }}>
            На главную
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="page-top-offset container mx-auto max-w-[1280px] px-5 pb-2">
        <span
          className="inline-block rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          Калькулятор
        </span>
        <h1 className="mt-5 max-w-3xl font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
          {seo.h1}
        </h1>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
          {seo.intro}
        </p>
      </div>
      <HouseConstructionCalculatorForm
        onSuccess={(_leadId, name) => setDone({ name })}
        heading="Параметры и смета"
        headingEyebrow="Калькулятор"
      />
      <section className="pb-20 md:pb-28" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1100px] px-5">
          <div className="grid gap-8 rounded-3xl border p-5 md:grid-cols-[0.9fr_1.1fr] md:p-8" style={{
            borderColor: "color-mix(in srgb, var(--text) 10%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--bg-secondary) 55%, var(--bg))",
          }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-subtle)" }}>
                Цена и смета
              </p>
              <h2 className="mt-3 font-heading text-2xl font-bold md:text-3xl" style={{ color: "var(--text)" }}>
                Что влияет на стоимость дома
              </h2>
              <p className="mt-4 text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
                В старой рекламе запросы про стоимость были одним из главных коммерческих кластеров. Поэтому калькулятор
                связан с проектами, материалами и точной заявкой на смету, а не работает как абстрактная форма.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="rounded-full px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                >
                  Смотреть проекты
                </Link>
                <Link
                  href="/technology/materials"
                  className="rounded-full border px-5 py-3 text-sm font-semibold transition hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--text) 14%, transparent)",
                    color: "var(--text)",
                  }}
                >
                  Сравнить материалы
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {seo.faq.map((item) => (
                <details
                  key={item.question}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "color-mix(in srgb, var(--text) 10%, transparent)",
                    backgroundColor: "var(--bg)",
                  }}
                >
                  <summary className="cursor-pointer text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
