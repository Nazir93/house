"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClipboardList, X } from "lucide-react";
import { formatRub } from "@/lib/construction-data";
import { countSelectedCalculatorOptions } from "@/lib/project-calculator-selection-count";
import type { PartOfSoulRoofPitch } from "@/lib/part-of-soul-pricing";
import type { CalculatorTransportBand } from "@/lib/project-calculator-types";
import {
  ProjectCalculatorEstimatePanel,
  type EstimateLine,
} from "@/components/construction/project-calculator-estimate-panel";
import { cn } from "@/lib/utils";

type Props = {
  observeRoot: HTMLElement | null;
  projectTitle: string;
  areaM2: number;
  roofPitch: PartOfSoulRoofPitch;
  shellPrice: number;
  facadeTotal: number;
  engTotal: number;
  conTotal: number;
  surcharge: number;
  grandTotal: number;
  quoteLoading?: boolean;
  catalogMode: boolean;
  facadeSlug: string | null;
  engineeringSlugs: ReadonlySet<string>;
  constructionSlugs: ReadonlySet<string>;
  engineeringLines: EstimateLine[];
  constructionLines: EstimateLine[];
  constructionSummaryOpen: boolean;
  onConstructionSummaryToggle: () => void;
  transportBands: CalculatorTransportBand[];
  transportId: string;
  onTransportIdChange: (id: string) => void;
  onRequestEstimate: () => void;
};

export function ProjectCalculatorEstimateMobile({
  observeRoot,
  projectTitle,
  areaM2,
  roofPitch,
  shellPrice,
  facadeTotal,
  engTotal,
  conTotal,
  surcharge,
  grandTotal,
  quoteLoading,
  catalogMode,
  facadeSlug,
  engineeringSlugs,
  constructionSlugs,
  engineeringLines,
  constructionLines,
  constructionSummaryOpen,
  onConstructionSummaryToggle,
  transportBands,
  transportId,
  onTransportIdChange,
  onRequestEstimate,
}: Props) {
  const [portalReady, setPortalReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [inView, setInView] = useState(false);

  const selectedCount = countSelectedCalculatorOptions({
    facadeSlug,
    engineeringSlugs,
    constructionSlugs,
  });

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!observeRoot) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { root: null, rootMargin: "-12% 0px -18% 0px", threshold: 0.02 },
    );
    io.observe(observeRoot);
    return () => io.disconnect();
  }, [observeRoot]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!portalReady || !catalogMode) return null;

  const showFab = !open && (inView || selectedCount > 0);

  return createPortal(
    <>
      <button
        type="button"
        className={cn(
          "project-calculator-estimate-fab lg:hidden",
          !showFab && "project-calculator-estimate-fab--hidden",
        )}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="project-calculator-estimate-drawer"
      >
        <ClipboardList size={18} strokeWidth={2.2} aria-hidden />
        <span className="project-calculator-estimate-fab__meta">
          <span className="project-calculator-estimate-fab__label">Смета</span>
          <span className="project-calculator-estimate-fab__total tabular-nums">
            {quoteLoading ? "…" : formatRub(grandTotal)}
          </span>
        </span>
        {selectedCount > 0 ? (
          <span className="project-calculator-estimate-fab__badge" aria-hidden>
            {selectedCount > 9 ? "9+" : selectedCount}
          </span>
        ) : null}
        <span className="sr-only">
          Открыть собранную комплектацию
          {selectedCount > 0 ? `, выбрано позиций: ${selectedCount}` : ""}
        </span>
      </button>

      <div
        className={cn(
          "projects-catalog-filters-overlay lg:hidden",
          open && "projects-catalog-filters-overlay--open",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="projects-catalog-filters-backdrop"
          aria-label="Закрыть смету"
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
        />
        <aside
          id="project-calculator-estimate-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-calculator-estimate-heading"
          className={cn(
            "projects-catalog-filters-drawer",
            open && "projects-catalog-filters-drawer--open",
          )}
        >
          <div className="projects-catalog-filters-drawer__head">
            <span
              id="project-calculator-estimate-heading"
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--text)" }}
            >
              <ClipboardList size={18} aria-hidden />
              Ваша комплектация
              {selectedCount > 0 ? (
                <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-2 py-0.5 text-[11px] font-bold tabular-nums text-[var(--accent)] normal-case tracking-normal">
                  {selectedCount}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
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
          <div className="projects-catalog-filters-drawer__body overscroll-contain">
            <ProjectCalculatorEstimatePanel
              compact
              projectTitle={projectTitle}
              areaM2={areaM2}
              roofPitch={roofPitch}
              shellPrice={shellPrice}
              facadeTotal={facadeTotal}
              engTotal={engTotal}
              conTotal={conTotal}
              surcharge={surcharge}
              grandTotal={grandTotal}
              quoteLoading={quoteLoading}
              catalogMode={catalogMode}
              engineeringLines={engineeringLines}
              constructionLines={constructionLines}
              constructionSummaryOpen={constructionSummaryOpen}
              onConstructionSummaryToggle={onConstructionSummaryToggle}
              transportBands={transportBands}
              transportId={transportId}
              onTransportIdChange={onTransportIdChange}
              onRequestEstimate={() => {
                setOpen(false);
                onRequestEstimate();
              }}
            />
          </div>
        </aside>
      </div>
    </>,
    document.body,
  );
}
