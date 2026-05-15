"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { ChevronDown, LayoutGrid, LayoutList, RectangleHorizontal } from "lucide-react";
import {
  type CaseStudyPhase,
  type CaseStudyTier1Chip,
  type CaseStudyChipNode,
  type CaseStudyViewMode,
} from "@/lib/portfolio-case-study";
import { PAGE_INTRO_PROSE_CLASS } from "@/lib/html-content";
import { CmsImage } from "@/components/ui/cms-image";

function pickFirstTier1(phase: CaseStudyPhase | undefined): CaseStudyTier1Chip | null {
  if (!phase) return null;
  return phase.tier1[0] ?? null;
}

function pickFirstTier2(tier1: CaseStudyTier1Chip | null): CaseStudyChipNode | null {
  if (!tier1 || tier1.tier2.length === 0) return null;
  return tier1.tier2[0] ?? null;
}

const asideSurfaceStyle = {
  backgroundColor: "color-mix(in srgb, var(--bg-secondary) 72%, transparent)",
  backdropFilter: "blur(12px)",
} as const;

function PhaseTimelineNav({
  phases,
  activePhaseId,
  onPhaseClick,
  idPrefix,
  pulseTick,
}: {
  phases: CaseStudyPhase[];
  activePhaseId: string | undefined;
  onPhaseClick: (id: string) => void;
  idPrefix: "mobile" | "desktop";
  pulseTick: number;
}) {
  return (
    <nav aria-label="Этапы строительства">
      <ul className="relative space-y-0 pl-1">
        <li
          className="pointer-events-none absolute bottom-4 left-[13px] top-4 w-px bg-gradient-to-b from-transparent via-[color-mix(in_srgb,var(--border)_75%,transparent)] to-transparent"
          aria-hidden
        />
        {phases.map((p) => {
          const active = p.id === activePhaseId;
          return (
            <li key={p.id} className="relative">
              <button
                id={`${idPrefix}-phase-${p.id}`}
                type="button"
                onClick={() => onPhaseClick(p.id)}
                className="flex w-full gap-2 rounded-xl py-2 pl-1 pr-0.5 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--text)_5%,transparent)] max-lg:gap-2 max-lg:py-1.5 sm:gap-3 sm:py-2.5 sm:pr-1"
              >
                <span className="relative z-[1] mt-[7px] flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                  <span
                    key={active ? `${p.id}-${pulseTick}` : `${p.id}-dot`}
                    className={`rounded-full border transition-all duration-200 ${active ? "case-study-timeline-marker-pulse border-[var(--accent)]" : "border-[color-mix(in_srgb,var(--text-muted)_40%,transparent)]"}`}
                    style={{
                      width: active ? 11 : 8,
                      height: active ? 11 : 8,
                      backgroundColor: active ? "var(--accent)" : "transparent",
                      boxShadow: active ? "0 0 0 2px color-mix(in srgb, var(--accent) 18%, transparent)" : "none",
                    }}
                  />
                </span>
                <span
                  className={`min-w-0 text-[11px] leading-[1.38] tracking-[0.01em] sm:text-[13px] sm:leading-[1.42] md:text-[14px] ${active ? "font-semibold text-[var(--accent)]" : "font-normal text-[var(--text-muted)]"}`}
                >
                  {p.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PortfolioCaseStudy({
  phases,
  phaseDescriptionHtml,
  onGalleryImageClick,
}: {
  phases: CaseStudyPhase[];
  /** HTML описания объекта из админки — показывается только в разделе «Рендеры и фото объекта», аккордеоном */
  phaseDescriptionHtml?: string;
  /** Открыть общий лайтбокс страницы по URL кадра */
  onGalleryImageClick?: (imageUrl: string) => void;
}) {
  const [phaseId, setPhaseId] = useState(phases[0]?.id ?? "");
  const [tier1Id, setTier1Id] = useState<string | null>(() => pickFirstTier1(phases[0] ?? null)?.id ?? null);
  const [tier2Id, setTier2Id] = useState<string | null>(() =>
    pickFirstTier2(pickFirstTier1(phases[0] ?? null))?.id ?? null
  );
  /** По умолчанию — сетка (не «Крупно») */
  const [viewMode, setViewMode] = useState<CaseStudyViewMode>("grid-sm");
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [pulseTick, setPulseTick] = useState(0);
  const asideScrollRefs = useRef<(HTMLElement | null)[]>([]);

  const setAsideScrollRef = useCallback((index: 0 | 1) => (el: HTMLElement | null) => {
    asideScrollRefs.current[index] = el;
  }, []);

  const bumpMarkerPulse = useCallback(() => {
    setPulseTick((n) => n + 1);
  }, []);

  useLayoutEffect(() => {
    let debounce: number | undefined;
    const onScroll = () => {
      if (debounce !== undefined) window.clearTimeout(debounce);
      debounce = window.setTimeout(() => {
        debounce = undefined;
        bumpMarkerPulse();
      }, 180);
    };
    const nodes = asideScrollRefs.current.filter((n): n is HTMLElement => Boolean(n));
    for (const el of nodes) el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (debounce !== undefined) window.clearTimeout(debounce);
      for (const el of nodes) el.removeEventListener("scroll", onScroll);
    };
  }, [bumpMarkerPulse, phases.length]);

  const phase = useMemo(() => phases.find((p) => p.id === phaseId) ?? phases[0], [phases, phaseId]);

  useEffect(() => {
    if (phases.length === 0) return;
    if (!phases.some((p) => p.id === phaseId)) {
      const first = phases[0];
      setPhaseId(first.id);
      const t1 = pickFirstTier1(first);
      setTier1Id(t1?.id ?? null);
      setTier2Id(pickFirstTier2(t1)?.id ?? null);
    }
  }, [phases, phaseId]);

  useEffect(() => {
    if (!phase) return;
    const t1 = pickFirstTier1(phase);
    setTier1Id(t1?.id ?? null);
    const t2 = pickFirstTier2(t1);
    setTier2Id(t2?.id ?? null);
  }, [phase]);

  useEffect(() => {
    if (phase?.id !== "_cms_renders") setDescriptionOpen(false);
  }, [phase?.id]);

  const selectedTier1 = useMemo(() => {
    if (!phase?.tier1.length) return null;
    return phase.tier1.find((t) => t.id === tier1Id) ?? phase.tier1[0];
  }, [phase, tier1Id]);

  const selectedTier2 = useMemo(() => {
    if (!selectedTier1?.tier2.length) return null;
    return selectedTier1.tier2.find((t) => t.id === tier2Id) ?? selectedTier1.tier2[0];
  }, [selectedTier1, tier2Id]);

  const images = selectedTier2?.images?.filter(Boolean) ?? [];
  const showPhaseDescription =
    phase?.id === "_cms_renders" && Boolean(phaseDescriptionHtml?.trim());

  /** Один «Галерея» + один подпункт с фото — зелёные пилюли не нужны */
  const hideRedundantGalleryChips = useMemo(() => {
    if (!phase?.tier1.length) return false;
    if (phase.tier1.length !== 1) return false;
    const t1 = phase.tier1[0];
    return t1.tier2.length === 1;
  }, [phase]);

  const onPhaseClick = useCallback((id: string) => {
    setPhaseId(id);
    bumpMarkerPulse();
  }, [bumpMarkerPulse]);

  if (!phases.length) {
    return (
      <p className="text-sm text-[var(--text-muted)]">Нет разделов для отображения.</p>
    );
  }

  return (
    <div className="relative">
      {/* Мобильная и планшетная: навигация закреплена справа, скролл списка внутри панели */}
      <aside
        ref={setAsideScrollRef(0)}
        className="case-study-timeline-aside-scroll lg:hidden fixed right-2 top-[max(5rem,env(safe-area-inset-top,0px)+4.5rem)] z-[38] w-[min(12.75rem,calc(100vw-2.75rem))] max-h-[min(72vh,calc(100dvh-6rem-env(safe-area-inset-bottom,0px)))] overflow-y-auto overflow-x-hidden overscroll-contain rounded-2xl py-3 pl-2 pr-1.5 sm:right-3 sm:top-[max(5.5rem,env(safe-area-inset-top,0px)+4.75rem)] sm:rounded-3xl sm:py-4 sm:pl-2.5 sm:pr-2"
        style={{
          ...asideSurfaceStyle,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <PhaseTimelineNav
          phases={phases}
          activePhaseId={phase?.id}
          onPhaseClick={onPhaseClick}
          idPrefix="mobile"
          pulseTick={pulseTick}
        />
      </aside>

      <div className="grid gap-8 max-lg:pr-[min(13.25rem,calc(11.5rem+1.75rem))] lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:items-start lg:gap-10 lg:pr-0 xl:gap-x-12">
        <aside
          ref={setAsideScrollRef(1)}
          className="case-study-timeline-aside-scroll hidden rounded-3xl py-5 pl-3 pr-2 sm:pl-4 sm:pr-3 lg:block lg:sticky lg:top-[7rem] lg:max-h-[min(88vh,calc(100vh-7rem))] lg:overflow-y-auto lg:self-start lg:py-6"
          style={asideSurfaceStyle}
        >
          <PhaseTimelineNav
            phases={phases}
            activePhaseId={phase?.id}
            onPhaseClick={onPhaseClick}
            idPrefix="desktop"
            pulseTick={pulseTick}
          />
        </aside>

        <div className="min-w-0 lg:pt-0.5">
          <h2 className="font-heading text-[1.45rem] font-bold leading-[1.12] tracking-tight text-[var(--text)] sm:text-[1.65rem] md:text-[1.85rem]">
          {phase?.title ?? ""}
        </h2>

        {showPhaseDescription ? (
          <div
            className="mt-5 overflow-hidden rounded-2xl border px-4 py-3 sm:px-5 sm:py-4"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
          >
            <button
              type="button"
              onClick={() => setDescriptionOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 text-left"
              aria-expanded={descriptionOpen}
            >
              <span className="font-heading text-base font-semibold text-[var(--text)] sm:text-lg">Описание объекта</span>
              <ChevronDown
                size={22}
                className={`shrink-0 text-[var(--text-muted)] transition-transform ${descriptionOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            {descriptionOpen ? (
              <div
                className={`${PAGE_INTRO_PROSE_CLASS} mt-4 max-w-none border-t pt-4 text-[var(--text-muted)]`}
                style={{ borderColor: "var(--border)" }}
                dangerouslySetInnerHTML={{ __html: phaseDescriptionHtml ?? "" }}
              />
            ) : null}
          </div>
        ) : null}

        {phase && phase.tier1.length > 0 ? (
          <>
            {!hideRedundantGalleryChips ? (
              <>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {phase.tier1.map((t) => {
                    const on = t.id === selectedTier1?.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTier1Id(t.id);
                          const first2 = t.tier2[0];
                          setTier2Id(first2?.id ?? null);
                        }}
                        className="rounded-full px-6 py-3 text-[14px] font-semibold transition-colors sm:px-7 sm:text-[15px]"
                        style={{
                          backgroundColor: on ? "var(--accent)" : "var(--bg-secondary)",
                          color: on ? "#fff" : "var(--text)",
                          border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                          boxShadow: on ? "none" : "inset 0 1px 0 color-mix(in srgb, var(--text) 5%, transparent)",
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {selectedTier1 && selectedTier1.tier2.length > 0 ? (
                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {selectedTier1.tier2.map((t) => {
                      const on = t.id === selectedTier2?.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTier2Id(t.id)}
                          className="rounded-2xl px-3 py-2.5 text-left text-[12px] font-medium leading-snug transition-colors sm:px-3.5 sm:text-[13px]"
                          style={{
                            backgroundColor: on ? "var(--accent)" : "var(--bg-secondary)",
                            color: on ? "#fff" : "var(--text)",
                            border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </>
            ) : null}
          </>
        ) : (
          <p className="mt-5 max-w-prose text-[13px] leading-relaxed text-[var(--text-muted)] sm:text-sm">
            Здесь будут ряды фильтров (материалы и виды работ). Структуру можно заполнить в данных кейса.
          </p>
        )}

        {hideRedundantGalleryChips ? (
          <div className="mt-6 flex justify-end">
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0 flex-1">
              {selectedTier2 ? (
                <>
                  <p className="font-heading text-base font-semibold text-[var(--text)] sm:text-[17px]">
                    {selectedTier2.label}
                  </p>
                  {selectedTier2.description ? (
                    <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-[var(--text-muted)] sm:text-sm">
                      {selectedTier2.description}
                    </p>
                  ) : null}
                </>
              ) : phase && phase.tier1.length > 0 ? (
                <p className="text-sm text-[var(--text-muted)]">Выберите подраздел выше.</p>
              ) : null}
            </div>

            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          </div>
        )}

        <CaseStudyGallery
          images={images}
          altBase={phase?.title ?? "Портфолио"}
          mode={viewMode}
          onImageClick={onGalleryImageClick}
        />
        </div>
      </div>
    </div>
  );
}

function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: CaseStudyViewMode;
  onChange: (m: CaseStudyViewMode) => void;
}) {
  const btn = (m: CaseStudyViewMode, icon: ReactElement, label: string) => {
    const active = mode === m;
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onClick={() => onChange(m)}
        className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
        style={{
          borderColor: active ? "var(--accent)" : "var(--border)",
          backgroundColor: active ? "rgba(15, 61, 46, 0.08)" : "transparent",
          color: active ? "var(--accent)" : "var(--text-muted)",
        }}
      >
        {icon}
      </button>
    );
  };

  return (
    <div
      className="flex shrink-0 gap-1.5 rounded-full border p-1"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
      role="group"
      aria-label="Вид галереи"
    >
      {btn("list", <LayoutList size={18} strokeWidth={2} />, "Список")}
      {btn("grid-sm", <LayoutGrid size={18} strokeWidth={2} />, "Сетка")}
      {btn("grid-lg", <RectangleHorizontal size={18} strokeWidth={2} />, "Крупно")}
    </div>
  );
}

function CaseStudyGallery({
  images,
  altBase,
  mode,
  onImageClick,
}: {
  images: string[];
  altBase: string;
  mode: CaseStudyViewMode;
  onImageClick?: (imageUrl: string) => void;
}) {
  if (images.length === 0) {
    return (
      <div
        className="relative mt-7 flex min-h-[min(52vw,380px)] flex-col items-center justify-center overflow-hidden rounded-[1.35rem] border px-6 text-center sm:min-h-[360px] sm:rounded-[1.5rem]"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--stone)",
          boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--text) 5%, transparent)",
        }}
      >
        <span className="relative z-[1] max-w-[17rem] text-[15px] font-medium leading-snug tracking-[0.01em] text-[var(--text-muted)] sm:max-w-[20rem] sm:text-[17px]">
          Скоро здесь будут фотографии
        </span>
      </div>
    );
  }

  const gridClass =
    mode === "list"
      ? "flex flex-col gap-4"
      : mode === "grid-sm"
        ? "grid grid-cols-2 gap-3 sm:gap-4"
        : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`mt-6 ${gridClass}`}>
      {images.map((src, i) => {
        const boxClass =
          mode === "list"
            ? "relative w-full overflow-hidden rounded-2xl bg-[var(--stone)] max-h-[min(78vh,720px)] h-[min(78vh,720px)] min-h-[180px]"
            : "relative w-full overflow-hidden rounded-2xl bg-[var(--stone)] aspect-[4/3] sm:aspect-[3/2]";
        return (
          <figure key={`${src}-${i}`} className={boxClass}>
            <CmsImage
              src={src}
              alt={`${altBase} — ${i + 1}`}
              fill
              className="object-cover"
              sizes={mode === "list" ? "100vw" : "(max-width: 640px) 100vw, 50vw"}
            />
            {onImageClick ? (
              <button
                type="button"
                onClick={() => onImageClick(src)}
                className="absolute inset-0 z-[1] cursor-zoom-in rounded-2xl bg-transparent"
                aria-label={`Открыть фото ${i + 1}`}
              />
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
