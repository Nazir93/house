"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, SlidersHorizontal, X } from "lucide-react";

import { ProjectCalculatorCatalogOptions } from "@/components/construction/project-calculator-catalog-options";
import { TransportDistanceSlider } from "@/components/construction/transport-distance-slider";
import type { PublicCalculatorCatalog } from "@/lib/calculator-catalog";
import {
  COMPARE_ENGINEERING_PRESET,
  COMPARE_UNIFIED_TIERS,
  DEFAULT_COMPARE_UNIFIED_SETTINGS,
  isDefaultCompareUnifiedSettings,
  summarizeCompareUnifiedSettings,
  type CompareUnifiedSettings,
} from "@/lib/project-compare-unified";
import { toggleConstructionOptionSelection } from "@/lib/project-calculator-option-selection";
import { DEFAULT_TRANSPORT_BANDS, transportBandIndex } from "@/lib/project-transport-surcharge";
import { cn } from "@/lib/utils";

type Props = {
  settings: CompareUnifiedSettings;
  onChange: (next: CompareUnifiedSettings) => void;
  loading?: boolean;
  lineAmounts: Map<string, number>;
  onStatusMessage?: (message: string) => void;
};

export function ProjectCompareUnifiedPanel({
  settings,
  onChange,
  loading,
  lineAmounts,
  onStatusMessage,
}: Props) {
  const bands = DEFAULT_TRANSPORT_BANDS;
  const bandIndex = transportBandIndex(bands, settings.transportBandId);
  const [catalog, setCatalog] = useState<PublicCalculatorCatalog | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerTouchStartY = useRef(0);

  const hasCustomSettings = useMemo(
    () => !isDefaultCompareUnifiedSettings(settings),
    [settings],
  );
  const settingsSummary = useMemo(
    () => summarizeCompareUnifiedSettings(settings),
    [settings],
  );
  const transportLabel = bands[bandIndex]?.label ?? bands[0]?.label ?? "";

  useEffect(() => {
    setPortalReady(true);
  }, []);

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

  useEffect(() => {
    if (!mobileOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const engineeringSlugs = useMemo(() => new Set(settings.engineeringSlugs), [settings.engineeringSlugs]);
  const constructionSlugs = useMemo(() => new Set(settings.constructionSlugs), [settings.constructionSlugs]);

  function toggleEngineering(slug: string) {
    const next = new Set(settings.engineeringSlugs);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange({ ...settings, engineeringSlugs: [...next] });
  }

  function toggleConstruction(slug: string) {
    const next = toggleConstructionOptionSelection(settings.constructionSlugs, slug);
    onChange({ ...settings, constructionSlugs: [...next] });
  }

  function applyEngineeringPreset() {
    onChange({ ...settings, engineeringSlugs: [...COMPARE_ENGINEERING_PRESET] });
  }

  function resetSettings() {
    onChange(DEFAULT_COMPARE_UNIFIED_SETTINGS);
    onStatusMessage?.("Комплектация сброшена");
  }

  function onDrawerTouchStart(event: React.TouchEvent) {
    drawerTouchStartY.current = event.touches[0]?.clientY ?? 0;
  }

  function onDrawerTouchMove(event: React.TouchEvent) {
    const el = drawerRef.current;
    if (!el || el.scrollTop > 2) return;
    const y = event.touches[0]?.clientY ?? 0;
    if (y - drawerTouchStartY.current > 52) {
      setMobileOpen(false);
    }
  }

  function renderPanelBody(className?: string) {
    return (
      <div className={className}>
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
          <div className="flex flex-wrap items-center gap-3">
            {hasCustomSettings ? (
              <button
                type="button"
                onClick={resetSettings}
                className="text-sm font-medium text-[var(--text-muted)] underline-offset-4 hover:underline"
              >
                Сбросить
              </button>
            ) : null}
            {loading ? (
              <span className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Пересчёт…
              </span>
            ) : null}
          </div>
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
      </div>
    );
  }

  const mobilePortal =
    portalReady &&
    createPortal(
      <>
        <button
          type="button"
          className={cn(
            "projects-catalog-filters-fab lg:hidden",
            mobileOpen && "projects-catalog-filters-fab--hidden",
          )}
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-controls="project-compare-settings-drawer"
        >
          <SlidersHorizontal size={20} strokeWidth={2.2} aria-hidden />
          <span className="sr-only">Комплектация</span>
          {hasCustomSettings ? <span className="projects-catalog-filters-fab__dot" aria-hidden /> : null}
        </button>

        <div
          className={cn(
            "projects-catalog-filters-overlay lg:hidden",
            mobileOpen && "projects-catalog-filters-overlay--open",
          )}
          aria-hidden={!mobileOpen}
        >
          <button
            type="button"
            className="projects-catalog-filters-backdrop"
            aria-label="Закрыть комплектацию"
            onClick={() => setMobileOpen(false)}
            onWheel={() => setMobileOpen(false)}
            tabIndex={mobileOpen ? 0 : -1}
          />
          <aside
            id="project-compare-settings-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-unified-heading"
            className={cn(
              "projects-catalog-filters-drawer",
              mobileOpen && "projects-catalog-filters-drawer--open",
            )}
            onTouchStart={onDrawerTouchStart}
            onTouchMove={onDrawerTouchMove}
          >
            <div className="projects-catalog-filters-drawer__head">
              <span
                className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--text)" }}
              >
                <SlidersHorizontal size={18} aria-hidden />
                Комплектация
              </span>
              <div className="flex items-center gap-3">
                {hasCustomSettings ? (
                  <button
                    type="button"
                    onClick={resetSettings}
                    className="text-sm font-medium underline-offset-4 hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Сбросить
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:border-[var(--accent)]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--text) 12%, transparent)",
                    color: "var(--text-muted)",
                  }}
                  aria-label="Закрыть"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div
              className="projects-catalog-filters-drawer__body"
              onWheel={(event) => {
                const el = drawerRef.current;
                if (el && el.scrollTop <= 0 && event.deltaY < 0) {
                  setMobileOpen(false);
                }
              }}
            >
              {renderPanelBody()}
            </div>
          </aside>
        </div>
      </>,
      document.body,
    );

  return (
    <>
      {mobilePortal}

      <section
        className="mt-6 rounded-[28px] border px-4 py-4 md:hidden"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        aria-labelledby="compare-unified-mobile-summary"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="compare-unified-mobile-summary" className="font-heading text-base text-[var(--graphite)]">
              Единая комплектация
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{settingsSummary}</p>
            {transportLabel ? (
              <p className="mt-1 text-xs text-[var(--text-subtle)]">Доставка: {transportLabel}</p>
            ) : null}
          </div>
          {loading ? (
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-[var(--text-muted)]" aria-hidden />
          ) : null}
        </div>
        <p className="mt-3 text-xs text-[var(--text-subtle)]">
          Настройки — кнопка «Комплектация» справа на экране.
        </p>
      </section>

      <section
        className="mt-6 hidden rounded-[28px] border px-5 py-5 md:block md:px-6"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        aria-labelledby="compare-unified-heading"
      >
        {renderPanelBody()}
      </section>
    </>
  );
}
