"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { HouseConstructionCalculatorForm } from "@/components/construction/house-construction-calculator-form";

export function CalculatorPageClient() {
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
        <h1 className="mt-5 font-heading text-3xl md:text-5xl tracking-tight">Стоимость строительства дома</h1>
      </div>
      <HouseConstructionCalculatorForm
        onSuccess={(_leadId, name) => setDone({ name })}
        heading="Параметры и смета"
        headingEyebrow="Калькулятор"
      />
    </>
  );
}
