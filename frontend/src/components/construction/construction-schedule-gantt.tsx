"use client";

import { useMemo } from "react";
import type { ConstructionStep } from "@/lib/construction-shared";

function parseTermToWeeks(term: string): number {
  const t = term.toLowerCase();
  if (t.includes("по комплектации") || t.includes("индивидуально")) return 10;
  if (t.includes("месяц")) {
    const m = t.match(/(\d+)\s*-\s*(\d+)\s*мес/);
    if (m) return ((Number(m[1]) + Number(m[2])) / 2) * 4;
    const one = t.match(/(\d+)\s*мес/);
    if (one) return Number(one[1]) * 4;
  }
  const range = t.match(/(\d+)\s*-\s*(\d+)/);
  if (range) return (Number(range[1]) + Number(range[2])) / 2;
  const single = t.match(/(\d+)\s*недел/);
  if (single) return Number(single[1]);
  return 4;
}

export function ConstructionScheduleGantt({ steps }: { steps: ConstructionStep[] }) {
  const { months, bars } = useMemo(() => {
    const weeks = steps.map((s) => Math.max(parseTermToWeeks(s.term), 1));
    const totalWeeks = weeks.reduce((a, b) => a + b, 0);
    const monthCount = Math.min(Math.max(Math.ceil(totalWeeks / 4), steps.length), 12);
    const startWeekAt: number[] = [];
    let acc = 0;
    for (let i = 0; i < steps.length; i++) {
      startWeekAt.push(acc);
      acc += weeks[i] ?? 4;
    }
    const bars = steps.map((step, i) => {
      const w = weeks[i] ?? 4;
      const start = (startWeekAt[i] ?? 0) / totalWeeks;
      const width = w / totalWeeks;
      return { step, startPct: start * 100, widthPct: Math.max(width * 100, 4), weeks: w };
    });
    return { months: monthCount, bars };
  }, [steps]);

  const monthLabels = useMemo(() => Array.from({ length: months }, (_, i) => `${i + 1}-й месяц`), [months]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
        <span className="font-semibold text-[var(--text)]">Капитальное строительство</span>
        <span>Сдача объекта заказчику</span>
      </div>

      <div className="overflow-x-auto rounded-[28px] border p-4 md:p-6" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
        <div className="min-w-[640px]">
          <div
            className="grid gap-0 border-b pb-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] md:text-xs"
            style={{ borderColor: "var(--border)", gridTemplateColumns: `140px repeat(${months}, minmax(0,1fr))` }}
          >
            <div className="text-left text-[var(--text-muted)]">Этап</div>
            {monthLabels.map((label) => (
              <div key={label} className="text-[var(--text-muted)]">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {bars.map(({ step, startPct, widthPct }) => (
              <div key={step.title} className="grid items-center gap-2" style={{ gridTemplateColumns: `140px 1fr` }}>
                <div className="pr-2">
                  <p className="text-sm font-semibold leading-snug">{step.title}</p>
                  <p className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {step.term}
                  </p>
                </div>
                <div className="relative h-10 rounded-xl bg-[var(--bg-secondary)]" style={{ boxShadow: "inset 0 0 0 1px var(--border)" }}>
                  <div
                    className="absolute top-1/2 h-7 -translate-y-1/2 rounded-lg bg-[var(--accent)] shadow-sm"
                    style={{
                      left: `${startPct}%`,
                      width: `${widthPct}%`,
                      minWidth: "12%",
                    }}
                    title={`${step.title}: ${step.term}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs leading-relaxed md:text-sm" style={{ color: "var(--text-muted)" }}>
            Ориентировочный график по этапам из карточки проекта. Фактические сроки зависят от погоды, комплектации и графика бригад — уточняем на консультации.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div key={`${step.title}-card`} className="rounded-[20px] border p-4 text-sm" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-semibold text-[var(--accent)]">
              {String(index + 1).padStart(2, "0")} / {step.term}
            </p>
            <h3 className="mt-2 font-heading text-lg">{step.title}</h3>
            <p className="mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
