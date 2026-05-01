"use client";

import { useMemo, useState } from "react";
import { LeadMiniForm } from "@/components/construction/lead-mini-form";
import { formatRub } from "@/lib/construction-shared";

export type MortgageEstimatorVariant = "page" | "embed-dark";

export function MortgageInlineEstimator({
  variant = "page",
  defaultPrice,
  defaultInitial,
  projectSlug,
  projectTitle,
  showLeadForm = true,
}: {
  variant?: MortgageEstimatorVariant;
  defaultPrice?: number;
  defaultInitial?: number;
  projectSlug?: string;
  projectTitle?: string;
  showLeadForm?: boolean;
}) {
  const initialPrice = defaultPrice ?? 10_900_000;
  const suggestedInitial = defaultInitial ?? Math.round(initialPrice * 0.22);
  const [price, setPrice] = useState(initialPrice);
  const [initial, setInitial] = useState(Math.min(suggestedInitial, Math.max(initialPrice - 500_000, 0)));
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(8);

  const monthly = useMemo(() => {
    const principal = Math.max(price - initial, 0);
    const monthRate = rate / 100 / 12;
    const months = years * 12;
    if (monthRate === 0) return principal / months;
    return (principal * (monthRate * (1 + monthRate) ** months)) / ((1 + monthRate) ** months - 1);
  }, [initial, price, rate, years]);

  const fields = [
    { label: "Стоимость дома", value: price, setValue: setPrice, min: 5_000_000, max: 30_000_000, money: true },
    { label: "Первоначальный взнос", value: initial, setValue: setInitial, min: 0, max: 15_000_000, money: true },
    { label: "Срок, лет", value: years, setValue: setYears, min: 5, max: 30, money: false },
    { label: "Ставка, %", value: rate, setValue: setRate, min: 1, max: 18, money: false },
  ];

  const isEmbed = variant === "embed-dark";
  const calcPayload = {
    kind: "mortgage" as const,
    price,
    initial,
    years,
    rate,
    monthly: Math.round(monthly),
    projectSlug,
    projectTitle,
  };

  if (isEmbed) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(260px,320px)] lg:items-start">
        <div className="grid gap-4 rounded-[28px] p-5 md:p-6" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
          {fields.map((field) => (
            <label key={field.label} className="block">
              <span className="text-sm font-semibold text-white/90">
                {field.label}: {field.money ? formatRub(field.value) : field.value}
              </span>
              <input
                type="range"
                min={field.min}
                max={field.max}
                value={field.value}
                onChange={(e) => field.setValue(Number(e.target.value))}
                className="mt-3 w-full accent-white"
              />
            </label>
          ))}
          <div className="rounded-[20px] bg-white/95 p-5 text-[var(--accent)] shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]/70">Ориентировочный платёж</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{formatRub(Math.round(monthly))}</p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">Финальные условия банка могут отличаться.</p>
          </div>
        </div>
        {showLeadForm ? (
          <LeadMiniForm
            source="house-project-mortgage"
            service={`Ипотека: ${projectTitle ?? "проект дома"}`}
            calcData={calcPayload}
            variant="dark"
            submitLabel="Заявка на расчёт"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="grid gap-4 rounded-[32px] p-6" style={{ backgroundColor: "var(--bg-secondary)" }}>
        {fields.map((field) => (
          <label key={field.label} className="block">
            <span className="text-sm font-semibold">
              {field.label}: {field.money ? formatRub(field.value) : field.value}
            </span>
            <input
              type="range"
              min={field.min}
              max={field.max}
              value={field.value}
              onChange={(e) => field.setValue(Number(e.target.value))}
              className="mt-3 w-full"
            />
          </label>
        ))}
        <div className="rounded-[24px] p-5 text-white" style={{ backgroundColor: "var(--accent)" }}>
          <p className="text-sm text-white/65">Ориентировочный платеж</p>
          <p className="mt-1 text-4xl font-semibold">{formatRub(Math.round(monthly))}</p>
        </div>
      </div>
      {showLeadForm ? (
        <LeadMiniForm source="mortgage" service="Ипотека" calcData={{ ...calcPayload, projectSlug: undefined, projectTitle: undefined }} />
      ) : null}
    </div>
  );
}
