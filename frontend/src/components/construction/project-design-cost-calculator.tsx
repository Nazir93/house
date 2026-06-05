"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { LeadMiniForm } from "@/components/construction/lead-mini-form";
import {
  DESIGN_MAIN_DOCUMENTATION_ITEMS,
  calculateDesignProjectQuote,
  clampDesignArea,
  DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS,
  type DesignProjectExtras,
  type DesignProjectPricingSettings,
} from "@/lib/design-project-pricing";
import { formatRub } from "@/lib/construction-shared";

const cardSurface = {
  borderColor: "var(--border)",
  backgroundColor: "var(--card-bg)",
} as const;

const innerSurface = {
  borderColor: "var(--border)",
  backgroundColor: "var(--bg)",
} as const;

const EXTRA_OPTIONS = [
  { key: "model3d", label: "3D-моделирование", priceKind: "fixed" },
  { key: "constructive", label: "Конструктивный проект", priceKind: "area" },
  { key: "audit", label: "Аудит участка", priceKind: "fixed" },
  { key: "engineering", label: "Проект инженерных систем", priceKind: "area" },
] as const satisfies ReadonlyArray<{
  key: keyof DesignProjectExtras;
  label: string;
  priceKind: "fixed" | "area";
}>;

export function ProjectDesignCostCalculator({
  source,
  defaultArea = 100,
  projectSlug,
  projectTitle,
  layout = "embed",
  showPromoLink = true,
  pricingSettings = DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS,
}: {
  source: "individual-design" | "house-project-design";
  defaultArea?: number;
  projectSlug?: string;
  projectTitle?: string;
  /** banner — блок на /services/proektirovanie; page/embed — прежние встраивания */
  layout?: "page" | "embed" | "banner";
  showPromoLink?: boolean;
  pricingSettings?: DesignProjectPricingSettings;
}) {
  const [areaText, setAreaText] = useState(() => String(clampDesignArea(defaultArea, pricingSettings)));
  const [extras, setExtras] = useState<DesignProjectExtras>({
    model3d: false,
    constructive: false,
    audit: false,
    engineering: false,
  });
  const [showLeadForm, setShowLeadForm] = useState(false);

  const area = useMemo(() => clampDesignArea(Number(areaText), pricingSettings), [areaText, pricingSettings]);
  const quote = useMemo(() => calculateDesignProjectQuote(area, extras, pricingSettings), [area, extras, pricingSettings]);

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
        engineering: extras.engineering,
      },
      selectedExtras: EXTRA_OPTIONS.filter((option) => extras[option.key]).map((option) => option.label),
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

  const isPage = layout === "page";
  const isBanner = layout === "banner";
  const optionHover = "transition hover:bg-[color-mix(in_srgb,var(--text)_5%,transparent)]";
  const rangeProgress =
    ((quote.area - pricingSettings.areaMin) / Math.max(pricingSettings.areaMax - pricingSettings.areaMin, 1)) * 100;

  function normalizeAreaInput() {
    setAreaText(String(clampDesignArea(Number(areaText), pricingSettings)));
  }

  if (isBanner) {
    return (
      <section className="bg-[#f5f2ec] px-4 py-8 sm:px-6 md:py-10">
        <div className="mx-auto max-w-[1320px] overflow-hidden rounded-[2px] bg-[#071f1b] text-white shadow-[0_24px_80px_rgba(7,31,27,0.24)]">
          <div className="grid min-h-[250px] grid-cols-1 divide-y divide-white/10 lg:grid-cols-[1.08fr_0.72fr_0.9fr_1fr] lg:divide-x lg:divide-y-0">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
                Калькулятор проектирования
              </p>
              <h2 className="mt-7 max-w-[18rem] font-heading text-2xl font-medium leading-tight sm:text-3xl">
                Рассчитайте стоимость проектирования
              </h2>
              <p className="mt-8 max-w-[16rem] text-sm leading-relaxed text-white/52">
                Ответьте на несколько вопросов и получите предварительный расчёт стоимости проекта.
              </p>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <StepLabel number="01" title="Укажите площадь дома" />
              <label className="mt-8 block">
                <span className="sr-only">Укажите площадь дома</span>
                <span className="inline-flex min-h-[56px] items-center rounded border border-white/18 bg-white/[0.03] px-4">
                  <input
                    type="number"
                    min={pricingSettings.areaMin}
                    max={pricingSettings.areaMax}
                    value={areaText}
                    onChange={(e) => setAreaText(e.target.value)}
                    onBlur={normalizeAreaInput}
                    className="w-20 bg-transparent text-3xl font-light tabular-nums text-white outline-none"
                  />
                  <span className="ml-3 border-l border-white/15 pl-3 text-sm text-white/55">м²</span>
                </span>
              </label>
              <div className="mt-8">
                <div className="h-1 rounded-full bg-white/18">
                  <div className="h-full rounded-full bg-white" style={{ width: `${rangeProgress}%` }} />
                </div>
                <div className="mt-4 flex justify-between text-xs text-white/48">
                  <span>{pricingSettings.areaMin} м²</span>
                  <span>{pricingSettings.areaMax} м²</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <StepLabel number="02" title="Основная документация" />
              <ul className="mt-7 space-y-3">
                {DESIGN_MAIN_DOCUMENTATION_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/72">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-white/35 bg-white/10">
                      <Check size={12} aria-hidden />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <StepLabel number="03" title="Дополнительная документация" />
              <div className="mt-7 space-y-3">
                {EXTRA_OPTIONS.map((option) => (
                  <label key={option.key} className="flex cursor-pointer items-start gap-3 text-sm text-white/72">
                    <input
                      type="checkbox"
                      checked={extras[option.key]}
                      onChange={(e) => setExtras((x) => ({ ...x, [option.key]: e.target.checked }))}
                      className="mt-0.5 h-4 w-4 rounded border-white/35 bg-transparent accent-white"
                    />
                    <span>
                      <span className="block">{option.label}</span>
                      <span className="mt-0.5 block text-xs text-white/36">
                        {option.priceKind === "area" ? "расчёт от площади" : "фиксированная сумма"}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid divide-y divide-white/10 border-t border-white/10 md:grid-cols-[1fr_1fr_0.8fr_0.75fr] md:divide-x md:divide-y-0">
            <SummaryCell label="Стоимость основной документации" value={formatRub(quote.mainDocumentation)} />
            <SummaryCell label="Стоимость дополнительной документации" value={formatRub(quote.additionalDocumentation)} />
            <SummaryCell label="Итого" value={formatRub(quote.total)} emphasis />
            <div className="flex items-center justify-center p-5">
              <button
                type="button"
                onClick={() => setShowLeadForm((v) => !v)}
                className="inline-flex min-h-[46px] items-center justify-center gap-3 rounded bg-[#f4f1eb] px-6 text-sm font-semibold text-[#071f1b] transition hover:bg-white"
              >
                Заказать проект <ArrowRight size={16} aria-hidden />
              </button>
            </div>
          </div>

          {showLeadForm ? (
            <div className="border-t border-white/10 p-6 sm:p-8">
              <div className="max-w-md">
                <p className="mb-4 text-sm font-semibold text-white">Заявка на проектирование</p>
                <LeadMiniForm
                  source={source}
                  service={serviceLabel}
                  calcData={calcData}
                  submitLabel="Отправить заявку"
                  variant="dark"
                  bare
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <div
      className={`border shadow-[0_24px_60px_-28px_rgba(15,61,46,0.35)] ${
        isPage ? "rounded-[1.35rem] p-4 sm:rounded-[1.5rem] sm:p-6" : "rounded-[28px] p-5 sm:p-6"
      }`}
      style={cardSurface}
    >
      {showPromoLink ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--border)" }}>
          <Link
            href="/individual-design"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)] transition hover:opacity-90"
          >
            Создать свой проект
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      ) : null}

      <h3
        className={`font-heading font-bold tracking-tight text-[var(--text)] ${
          showPromoLink ? "mt-5 text-xl sm:text-2xl" : "text-xl sm:text-2xl"
        }`}
      >
        Стоимость вашего проекта
      </h3>
      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Ориентировочный расчёт основной и дополнительной документации от площади дома. Итоговая смета — после брифа.
      </p>

      <label className="mt-6 block">
        <span className="text-sm font-semibold text-[var(--text)]">Укажите площадь дома, м²</span>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={pricingSettings.areaMin}
            max={pricingSettings.areaMax}
            value={area}
            onChange={(e) => setAreaText(String(clampDesignArea(Number(e.target.value), pricingSettings)))}
            className="w-full min-h-[48px] max-w-[220px] rounded-2xl border px-4 py-3 text-lg font-semibold tabular-nums outline-none ring-[var(--accent)] focus:ring-2"
            style={{ ...innerSurface, color: "var(--text)" }}
            aria-describedby="design-area-hint"
          />
          <p id="design-area-hint" className="text-xs" style={{ color: "var(--text-muted)" }}>
            от {pricingSettings.areaMin} до {pricingSettings.areaMax} м²
          </p>
        </div>
      </label>

      <div className={`mt-8 grid gap-5 ${isPage ? "" : "md:grid-cols-2 md:gap-5"}`}>
        <div className="rounded-2xl border p-4 sm:p-5" style={innerSurface}>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Основная документация</p>
          {!isPage ? (
            <ul className="mt-4 space-y-2.5 text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
              {DESIGN_MAIN_DOCUMENTATION_ITEMS.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Комплект чертежей для согласования и стройки — состав перечислен слева на странице.
            </p>
          )}
          <p
            className="mt-5 border-t pt-4 text-sm font-semibold tabular-nums text-[var(--text)] sm:mt-6"
            style={{ borderColor: "var(--border)" }}
          >
            Стоимость основной документации —{" "}
            <span className="text-[var(--accent)]">{formatRub(quote.mainDocumentation)}</span>
          </p>
        </div>

        <div className="rounded-2xl border p-4 sm:p-5" style={innerSurface}>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Дополнительная документация</p>
          <div className="mt-4 space-y-3 text-sm">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${optionHover}`}
              style={{ borderColor: "var(--border)" }}
            >
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
                    : `${formatRub(pricingSettings.model3dFixed)} при включении`}
                </span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${optionHover}`}
              style={{ borderColor: "var(--border)" }}
            >
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
                    : `≈ ${formatRub(Math.round(area * pricingSettings.constructivePerM2))} при включении`}
                </span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${optionHover}`}
              style={{ borderColor: "var(--border)" }}
            >
              <input
                type="checkbox"
                checked={extras.audit}
                onChange={(e) => setExtras((x) => ({ ...x, audit: e.target.checked }))}
                className="mt-1 accent-[var(--accent)]"
              />
              <span>
                <span className="font-semibold text-[var(--text)]">Аудит участка</span>
                <span className="mt-0.5 block text-xs" style={{ color: "var(--text-muted)" }}>
                  {extras.audit ? `${formatRub(quote.breakdown.audit)} в сумме` : `${formatRub(pricingSettings.auditFixed)} при включении`}
                </span>
              </span>
            </label>
          </div>
          <p
            className="mt-5 border-t pt-4 text-sm font-semibold tabular-nums text-[var(--text)] sm:mt-6"
            style={{ borderColor: "var(--border)" }}
          >
            Стоимость дополнительной документации —{" "}
            <span className="text-[var(--accent)]">{formatRub(quote.additionalDocumentation)}</span>
          </p>
        </div>
      </div>

      <div
        className="mt-6 rounded-2xl border p-5 sm:p-6"
        style={{
          borderColor: "color-mix(in srgb, var(--accent) 40%, var(--border))",
          backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--bg))",
        }}
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

function StepLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-[10px] font-semibold text-white/70">
        {number}
      </span>
      <p className="text-xs font-medium text-white/72">{title}</p>
    </div>
  );
}

function SummaryCell({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="p-5 sm:p-6">
      <p className="text-[11px] text-white/36">{label}</p>
      <p className={`mt-3 font-heading tabular-nums ${emphasis ? "text-3xl text-white" : "text-xl text-white/90"}`}>
        {value}
      </p>
    </div>
  );
}
