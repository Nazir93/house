"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LeadMiniForm } from "@/components/construction/lead-mini-form";
import {
  DESIGN_MAIN_DOCUMENTATION_ITEMS,
  calculateDesignProjectQuote,
  clampDesignArea,
  type DesignProjectExtras,
} from "@/lib/design-project-pricing";
import { formatRub } from "@/lib/construction-shared";

export function ProjectDesignCostCalculator({
  source,
  defaultArea = 100,
  projectSlug,
  projectTitle,
}: {
  source: "individual-design" | "house-project-design";
  defaultArea?: number;
  projectSlug?: string;
  projectTitle?: string;
}) {
  const [area, setArea] = useState(() => clampDesignArea(defaultArea));
  const [extras, setExtras] = useState<DesignProjectExtras>({
    model3d: true,
    constructive: true,
    audit: false,
  });

  const quote = useMemo(() => calculateDesignProjectQuote(area, extras), [area, extras]);

  const calcData = useMemo(
    () => ({
      kind: "design-project-quote" as const,
      area: quote.area,
      mainDocumentation: quote.mainDocumentation,
      additionalDocumentation: quote.additionalDocumentation,
      total: quote.total,
      extras: {
        model3d: extras.model3d,
        constructive: extras.constructive,
        audit: extras.audit,
      },
      breakdown: quote.breakdown,
      ...(projectSlug ? { projectSlug } : {}),
      ...(projectTitle ? { projectTitle } : {}),
    }),
    [extras, projectSlug, projectTitle, quote]
  );

  const serviceLabel =
    source === "house-project-design" && projectTitle
      ? `Заказ проекта: ${projectTitle}`
      : "Индивидуальное проектирование";

  return (
    <div
      className="rounded-[28px] border p-5 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] sm:p-6"
      style={{ borderColor: "rgba(43, 47, 45, 0.1)", backgroundColor: "rgba(237, 235, 229, 0.65)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <Link
          href="/individual-design"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)] transition hover:opacity-90"
        >
          Создать свой проект
          <ArrowRight size={14} />
        </Link>
      </div>

      <h3 className="mt-5 font-heading text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
        Стоимость вашего проекта
      </h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Ориентировочный расчёт основной и дополнительной документации от площади дома. Итоговая смета — после брифа.
      </p>

      <label className="mt-6 block">
        <span className="text-sm font-semibold text-[var(--text)]">Укажите площадь дома, м²</span>
        <input
          type="number"
          min={40}
          max={600}
          value={area}
          onChange={(e) => setArea(clampDesignArea(Number(e.target.value)))}
          className="mt-2 w-full max-w-[200px] rounded-2xl border bg-[var(--bg)] px-4 py-3 text-lg font-semibold tabular-nums outline-none ring-[var(--accent)] focus:ring-2"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        />
      </label>

      <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-5">
        <div
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Основная документация</p>
          <ul className="mt-4 space-y-2.5 text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
            {DESIGN_MAIN_DOCUMENTATION_ITEMS.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t pt-4 text-sm font-semibold tabular-nums text-[var(--text)]" style={{ borderColor: "var(--border)" }}>
            Стоимость основной документации —{" "}
            <span className="text-[var(--accent)]">{formatRub(quote.mainDocumentation)}</span>
          </p>
        </div>

        <div
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Дополнительная документация</p>
          <div className="mt-4 space-y-3 text-sm">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition hover:bg-black/[0.02]" style={{ borderColor: "var(--border)" }}>
              <input
                type="checkbox"
                checked={extras.model3d}
                onChange={(e) => setExtras((x) => ({ ...x, model3d: e.target.checked }))}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="font-semibold text-[var(--text)]">3D-моделирование</span>
                <span className="mt-0.5 block text-xs" style={{ color: "var(--text-muted)" }}>
                  {extras.model3d
                    ? `${formatRub(quote.breakdown.model3d)} в сумме`
                    : `≈ ${formatRub(Math.round(area * 450))} при включении`}
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition hover:bg-black/[0.02]" style={{ borderColor: "var(--border)" }}>
              <input
                type="checkbox"
                checked={extras.constructive}
                onChange={(e) => setExtras((x) => ({ ...x, constructive: e.target.checked }))}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="font-semibold text-[var(--text)]">Конструктивный проект</span>
                <span className="mt-0.5 block text-xs" style={{ color: "var(--text-muted)" }}>
                  {extras.constructive
                    ? `${formatRub(quote.breakdown.constructive)} в сумме`
                    : `≈ ${formatRub(Math.round(area * 900))} при включении`}
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition hover:bg-black/[0.02]" style={{ borderColor: "var(--border)" }}>
              <input
                type="checkbox"
                checked={extras.audit}
                onChange={(e) => setExtras((x) => ({ ...x, audit: e.target.checked }))}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="font-semibold text-[var(--text)]">Аудит участка</span>
                <span className="mt-0.5 block text-xs" style={{ color: "var(--text-muted)" }}>
                  {extras.audit ? `${formatRub(quote.breakdown.audit)} в сумме` : `${formatRub(45_000)} при включении`}
                </span>
              </span>
            </label>
          </div>
          <p className="mt-6 border-t pt-4 text-sm font-semibold tabular-nums text-[var(--text)]" style={{ borderColor: "var(--border)" }}>
            Стоимость дополнительной документации —{" "}
            <span className="text-[var(--accent)]">{formatRub(quote.additionalDocumentation)}</span>
          </p>
        </div>
      </div>

      <div
        className="mt-6 rounded-2xl border-2 p-5 sm:p-6"
        style={{ borderColor: "var(--accent)", backgroundColor: "rgba(15, 61, 46, 0.06)" }}
      >
        <p className="text-sm font-medium uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
          Общая стоимость проектирования
        </p>
        <p className="mt-2 font-heading text-3xl font-bold tabular-nums text-[var(--accent)] sm:text-4xl">
          {formatRub(quote.total)}
        </p>

        <div className="mt-6 border-t pt-5" style={{ borderColor: "var(--border)" }}>
          <p className="mb-3 text-sm font-semibold text-[var(--text)]">Заказать проект</p>
          <LeadMiniForm
            source={source}
            service={serviceLabel}
            calcData={calcData}
            submitLabel="Заказать проект"
            bare
          />
        </div>
      </div>
    </div>
  );
}
