"use client";

import type { MortgageProgramRow } from "@/lib/mortgage-data";
import { formatRub } from "@/lib/construction-shared";

export function MortgageProgramsSection({
  programs,
  programsFootnote,
  onCalculate,
}: {
  programs: MortgageProgramRow[];
  programsFootnote: string;
  onCalculate: (program: MortgageProgramRow) => void;
}) {
  return (
    <section className="mt-14 md:mt-20" aria-labelledby="mortgage-programs-heading">
      <h2 id="mortgage-programs-heading" className="font-heading text-2xl font-bold md:text-3xl">
        Ипотечные программы
      </h2>

      <ul className="mt-6 grid gap-3 md:gap-4">
        {programs.map((program) => (
          <li
            key={program.id}
            className="rounded-2xl border bg-[var(--card-bg)] p-4 md:grid md:grid-cols-[1.25fr_1fr_1.05fr_1fr_auto] md:items-center md:gap-4 md:p-5"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="font-heading text-base font-bold">{program.title}</p>
            <div className="mt-3 md:mt-0">
              <span className="text-2xl font-semibold tabular-nums text-[var(--accent)]">{program.ratePercent}%</span>
              <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{program.rateLabel}</span>
            </div>
            <p className="mt-2 text-sm font-medium md:mt-0">
              <span className="text-[var(--text-muted)] md:hidden">Макс. сумма: </span>
              до {formatRub(program.maxLoanRub)}
            </p>
            <p className="mt-1 text-sm md:mt-0">
              <span className="text-[var(--text-muted)] md:hidden">Взнос: </span>
              от {program.minDownPaymentPercent}%
            </p>
            <div className="mt-4 md:mt-0 md:flex md:justify-end">
              <button
                type="button"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border-2 border-[var(--accent)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] md:w-auto md:min-w-[140px]"
                onClick={() => onCalculate(program)}
              >
                Рассчитать
              </button>
            </div>
          </li>
        ))}
      </ul>

      {programsFootnote.trim() ? (
        <p className="mt-4 whitespace-pre-line text-xs leading-relaxed text-[var(--text-muted)]">
          {programsFootnote.trim()}
        </p>
      ) : null}
    </section>
  );
}
