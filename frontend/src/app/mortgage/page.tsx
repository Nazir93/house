"use client";

import { MortgageInlineEstimator } from "@/components/construction/mortgage-inline-estimator";

export default function MortgagePage() {
  return (
    <section className="pt-28 pb-20" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <div className="container mx-auto px-5">
        <span className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          Ипотека
        </span>
        <h1 className="mt-5 font-heading text-4xl md:text-6xl">Ипотека на строительство дома</h1>
        <p className="mt-5 max-w-2xl text-lg" style={{ color: "var(--text-muted)" }}>
          Предварительный расчёт помогает оценить платёж. Финальные условия зависят от банка и программы.
        </p>
        <div className="mt-10">
          <MortgageInlineEstimator variant="page" />
        </div>
      </div>
    </section>
  );
}
