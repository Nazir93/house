"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { ProjectCalculatorCatalogOptions } from "@/components/construction/project-calculator-catalog-options";
import { TransportDistanceSlider } from "@/components/construction/transport-distance-slider";
import type { PublicCalculatorCatalog } from "@/lib/calculator-catalog";
import {
  COMPARE_ENGINEERING_PRESET,
  COMPARE_UNIFIED_TIERS,
  DEFAULT_COMPARE_UNIFIED_SETTINGS,
  aggregateCompareQuoteLineAmounts,
  type CompareUnifiedSettings,
} from "@/lib/project-compare-unified";
import { DEFAULT_TRANSPORT_BANDS, transportBandIndex } from "@/lib/project-transport-surcharge";
import { cn } from "@/lib/utils";

type Props = {
  settings: CompareUnifiedSettings;
  onChange: (next: CompareUnifiedSettings) => void;
  loading?: boolean;
  lineAmounts: Map<string, number>;
};

export function ProjectCompareUnifiedPanel({ settings, onChange, loading, lineAmounts }: Props) {
  const bands = DEFAULT_TRANSPORT_BANDS;
  const bandIndex = transportBandIndex(bands, settings.transportBandId);
  const [catalog, setCatalog] = useState<PublicCalculatorCatalog | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/calculator-catalog?category=a")
      .then((r) => r.json())
      .then((data: PublicCalculatorCatalog) => {
        if (!cancelled) setCatalog(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const engineeringSlugs = useMemo(() => new Set(settings.engineeringSlugs), [settings.engineeringSlugs]);
  const constructionSlugs = useMemo(() => new Set(settings.constructionSlugs), [settings.constructionSlugs]);

  function toggleEngineering(slug: string) {
    const next = new Set(settings.engineeringSlugs);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange({ ...settings, engineeringSlugs: [...next] });
  }

  function toggleConstruction(slug: string) {
    const next = new Set(settings.constructionSlugs);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange({ ...settings, constructionSlugs: [...next] });
  }

  function applyEngineeringPreset() {
    onChange({ ...settings, engineeringSlugs: [...COMPARE_ENGINEERING_PRESET] });
  }

  return (
    <section
      className="mt-6 rounded-[28px] border px-5 py-5 md:px-6"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
      aria-labelledby="compare-unified-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="compare-unified-heading" className="font-heading text-lg text-[var(--graphite)]">
            Единая комплектация
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
            Один набор опций для всех проектов — коробка, фасад, инженерия и отделка. Цены пересчитываются по
            калькулятору каждого дома; недоступные опции для проекта упрощаются автоматически.
          </p>
        </div>
        {loading ? (
          <span className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Пересчёт…
          </span>
        ) : null}
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">Материал коробки</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMPARE_UNIFIED_TIERS.map((tier) => {
            const active = settings.tierId === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...settings,
                    tierId: tier.id,
                    tierLabel: tier.label,
                  })
                }
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  active
                    ? "border-[#0f3d2e] bg-[#0f3d2e] text-white"
                    : "border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)]",
                )}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {catalog ? (
        <div className="mt-6 rounded-2xl bg-[var(--bg)] p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
              Фасад, инженерия, отделка
            </p>
            <button
              type="button"
              onClick={applyEngineeringPreset}
              className="text-xs font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Пресет «Базовая инженерия»
            </button>
          </div>
          <ProjectCalculatorCatalogOptions
            catalog={catalog}
            facadeSlug={settings.facadeSlug}
            onFacadeChange={(slug) => onChange({ ...settings, facadeSlug: slug })}
            engineeringSlugs={engineeringSlugs}
            onToggleEngineering={toggleEngineering}
            constructionSlugs={constructionSlugs}
            onToggleConstruction={toggleConstruction}
            lineAmounts={lineAmounts}
            quoteLoading={loading}
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--text-muted)]">Загрузка каталога опций…</p>
      )}

      <div className="mt-5 max-w-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)]">
          Расстояние до объекта
        </p>
        <TransportDistanceSlider
          className="mt-2"
          bands={bands}
          valueIndex={bandIndex}
          onChangeIndex={(index) => {
            const band = bands[index] ?? bands[0];
            onChange({
              ...settings,
              transportBandId: band?.id ?? DEFAULT_COMPARE_UNIFIED_SETTINGS.transportBandId,
            });
          }}
        />
      </div>
    </section>
  );
}
