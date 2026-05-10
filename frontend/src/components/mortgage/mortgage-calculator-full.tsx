"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { LeadMiniForm } from "@/components/construction/lead-mini-form";
import { formatRub } from "@/lib/construction-shared";
import type { MortgagePageSettings, MortgageProgramRow } from "@/lib/mortgage-settings-schema";
import { cn } from "@/lib/utils";

function annuityMonthly(principal: number, annualPercent: number, years: number): number {
  const months = Math.max(1, Math.round(years * 12));
  const monthRate = annualPercent / 100 / 12;
  if (principal <= 0) return 0;
  if (monthRate <= 0) return principal / months;
  const factor = (1 + monthRate) ** months;
  return (principal * monthRate * factor) / (factor - 1);
}

function parseMoney(raw: string): number {
  const n = Number(String(raw).replace(/\s/g, "").replace(/,/g, "."));
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

function formatMoneyInput(n: number): string {
  if (!n) return "";
  return n.toLocaleString("ru-RU");
}

export function MortgageCalculatorFull({
  settings,
  presetProgram,
}: {
  settings: MortgagePageSettings;
  /** При нажатии «Рассчитать» в таблице программ */
  presetProgram?: MortgageProgramRow | null;
}) {
  const { calculatorDefaults, programs, maternityCapitalRub } = settings;
  const [price, setPrice] = useState(calculatorDefaults.price);
  const [initialCash, setInitialCash] = useState(calculatorDefaults.initialCash);
  const [years, setYears] = useState(calculatorDefaults.years);
  const [rate, setRate] = useState(calculatorDefaults.rate);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(programs[0]?.id ?? null);
  const [useMaternityCapital, setUseMaternityCapital] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const applyProgram = useCallback(
    (program: MortgageProgramRow) => {
      setActiveProgramId(program.id);
      setRate(program.ratePercent);
      const minDownRub = Math.round((price * program.minDownPaymentPercent) / 100);
      const mc = useMaternityCapital ? maternityCapitalRub : 0;
      const needCash = Math.max(0, minDownRub - mc);
      setInitialCash((prev) => Math.max(prev, needCash));
    },
    [price, useMaternityCapital, maternityCapitalRub],
  );

  useEffect(() => {
    if (presetProgram) applyProgram(presetProgram);
  }, [presetProgram, applyProgram]);

  const mcAmount = useMaternityCapital ? maternityCapitalRub : 0;
  const sumDown = Math.min(initialCash + mcAmount, price);
  const principal = Math.max(price - sumDown, 0);

  const monthly = useMemo(
    () => annuityMonthly(principal, rate, years),
    [principal, rate, years],
  );

  const months = Math.round(years * 12);
  const totalPaid = monthly * months;
  const overpayment = Math.max(0, totalPaid - principal);
  /** Рекомендуемый доход при доле платежа ~40% в семейном бюджете */
  const recommendedIncome = monthly > 0 ? Math.round(monthly / 0.4) : 0;
  const calcPayload = {
    kind: "mortgage" as const,
    programId: activeProgramId,
    price,
    initialCash,
    maternityCapital: mcAmount,
    totalDown: sumDown,
    principal,
    years,
    rate,
    monthly: Math.round(monthly),
    totalPaid: Math.round(totalPaid),
    overpayment: Math.round(overpayment),
    recommendedIncome,
  };

  const scheduleRows = useMemo(() => {
    const monthRate = rate / 100 / 12;
    const pay = monthly;
    let balance = principal;
    const rows: { month: number; payment: number; interest: number; body: number; balance: number }[] = [];
    const maxRows = Math.min(months, 24);
    for (let i = 1; i <= maxRows; i++) {
      const interest = balance * monthRate;
      const body = pay - interest;
      balance = Math.max(0, balance - body);
      rows.push({
        month: i,
        payment: pay,
        interest,
        body,
        balance,
      });
    }
    return rows;
  }, [principal, rate, monthly, months]);

  return (
    <div id="mortgage-calculator" className="scroll-mt-28">
      <h2 className="font-heading text-2xl font-bold md:text-3xl">Строительство дома в ипотеку</h2>
      <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
        Ориентировочный расчёт аннуитетного платежа. У банка могут быть комиссии, страховки и иные условия — итоговый график получите в одобрении.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="rounded-[28px] border p-5 md:p-7" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Стоимость дома</span>
              <input
                type="text"
                inputMode="numeric"
                value={formatMoneyInput(price)}
                onChange={(e) => setPrice(parseMoney(e.target.value))}
                className="mt-2 w-full rounded-2xl border bg-[var(--bg)] px-4 py-3 text-lg font-semibold tabular-nums outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                Первоначальный взнос (ваши средства)
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formatMoneyInput(initialCash)}
                onChange={(e) => setInitialCash(parseMoney(e.target.value))}
                className="mt-2 w-full rounded-2xl border bg-[var(--bg)] px-4 py-3 text-lg font-semibold tabular-nums outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Срок кредита, лет</span>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={years}
                  onChange={(e) => setYears(Math.min(30, Math.max(5, Number(e.target.value) || 20)))}
                  className="w-full rounded-2xl border bg-[var(--bg)] px-4 py-3 font-semibold tabular-nums outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                />
                <span className="text-sm text-[var(--text-muted)]">лет</span>
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">Ставка, % годовых</span>
              <input
                type="number"
                min={1}
                max={35}
                step={0.1}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value) || 6)}
                className="mt-2 w-full rounded-2xl border bg-[var(--bg)] px-4 py-3 font-semibold tabular-nums outline-none focus:ring-2 focus:ring-[var(--accent)]"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              />
            </label>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Тип программы</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {programs.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyProgram(p)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition",
                    activeProgramId === p.id
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]"
                      : "border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)]",
                  )}
                  style={{ borderColor: activeProgramId === p.id ? undefined : "var(--border)" }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
            <input
              type="checkbox"
              checked={useMaternityCapital}
              onChange={(e) => setUseMaternityCapital(e.target.checked)}
              className="h-5 w-5 accent-[var(--accent)]"
            />
            <span className="text-sm font-medium">
              Учитывать материнский капитал (+{formatRub(maternityCapitalRub)} к взносу)
            </span>
          </label>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[28px] p-6 text-[var(--accent-contrast)]" style={{ backgroundColor: "var(--accent)" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">Ежемесячный платёж</p>
            <p className="mt-2 font-heading text-4xl font-bold tabular-nums">{formatRub(Math.round(monthly))}</p>
          </div>
          <div className="rounded-[28px] border p-5" style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}>
            <dl className="grid gap-4 text-sm">
              <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-3">
                <dt className="text-[var(--text-muted)]">Сумма кредита</dt>
                <dd className="font-semibold tabular-nums text-[var(--accent)]">{formatRub(Math.round(principal))}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-3">
                <dt className="text-[var(--text-muted)]">Переплата по процентам</dt>
                <dd className="font-semibold tabular-nums text-[var(--accent)]">{formatRub(Math.round(overpayment))}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-3">
                <dt className="text-[var(--text-muted)]">Общая выплата</dt>
                <dd className="font-semibold tabular-nums text-[var(--accent)]">{formatRub(Math.round(totalPaid))}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-3">
                <dt className="text-[var(--text-muted)]">Рекомендуемый доход</dt>
                <dd className="font-semibold tabular-nums text-[var(--text)]">{formatRub(recommendedIncome)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="max-w-[75%] text-[var(--text-muted)]">Вычет по процентам (типовой лимит по НК РФ)</dt>
                <dd className="text-right font-semibold text-[var(--text)]">до 390 000 ₽ возвата*</dd>
              </div>
            </dl>
            <p className="mt-4 text-[11px] leading-snug text-[var(--text-muted)]">
              * Лимиты и право на вычеты зависят от года регистрации права и вашей ситуации — уточняйте у налогового консультанта.
            </p>
          </div>

          <button
            type="button"
            className="w-full rounded-2xl border-2 border-[var(--accent)] py-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]"
            onClick={() => setShowSchedule((v) => !v)}
          >
            {showSchedule ? "Скрыть график платежей" : "Рассчитать график платежей"}
          </button>

          {showSchedule ? (
            <div className="overflow-x-auto rounded-2xl border text-xs" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b text-[var(--text-muted)]" style={{ borderColor: "var(--border)" }}>
                    <th className="px-3 py-2 font-semibold">Мес.</th>
                    <th className="px-3 py-2 font-semibold">Платёж</th>
                    <th className="px-3 py-2 font-semibold">Проценты</th>
                    <th className="px-3 py-2 font-semibold">Тело</th>
                    <th className="px-3 py-2 font-semibold">Остаток</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleRows.map((row) => (
                    <tr key={row.month} className="border-b border-[var(--border)]/60">
                      <td className="px-3 py-2 tabular-nums">{row.month}</td>
                      <td className="px-3 py-2 tabular-nums">{formatRub(Math.round(row.payment))}</td>
                      <td className="px-3 py-2 tabular-nums">{formatRub(Math.round(row.interest))}</td>
                      <td className="px-3 py-2 tabular-nums">{formatRub(Math.round(row.body))}</td>
                      <td className="px-3 py-2 tabular-nums">{formatRub(Math.round(row.balance))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {months > scheduleRows.length ? (
                <p className="border-t px-3 py-2 text-[var(--text-muted)]" style={{ borderColor: "var(--border)" }}>
                  Показаны первые {scheduleRows.length} месяца из {months}.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div id="mortgage-lead" className="mt-12 scroll-mt-28 rounded-[28px] border p-6 md:p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
        <h3 className="font-heading text-xl font-bold md:text-2xl">Заявка в кредитный отдел</h3>
        <p className="mt-2 max-w-xl text-sm text-[var(--text-muted)]">
          Оставьте контакты — подготовим список банков-партнёров и документы для сделки на строительство.
        </p>
        <div className="mt-6 max-w-lg">
          <LeadMiniForm
            source="mortgage"
            service="Ипотека: заявка с калькулятора"
            calcData={calcPayload}
            bare
            submitLabel="Отправить заявку"
          />
        </div>
      </div>
    </div>
  );
}
