"use client";

import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { LayoutGrid, LayoutList, RectangleHorizontal } from "lucide-react";
import {
  type CaseStudyPhase,
  type CaseStudyTier1Chip,
  type CaseStudyChipNode,
  type CaseStudyViewMode,
} from "@/lib/portfolio-case-study";
import { CmsImage } from "@/components/ui/cms-image";

function pickFirstTier1(phase: CaseStudyPhase | undefined): CaseStudyTier1Chip | null {
  if (!phase) return null;
  return phase.tier1[0] ?? null;
}

function pickFirstTier2(tier1: CaseStudyTier1Chip | null): CaseStudyChipNode | null {
  if (!tier1 || tier1.tier2.length === 0) return null;
  return tier1.tier2[0] ?? null;
}

export function PortfolioCaseStudy({
  phases,
  onGalleryImageClick,
}: {
  phases: CaseStudyPhase[];
  /** Открыть общий лайтбокс страницы по URL кадра */
  onGalleryImageClick?: (imageUrl: string) => void;
}) {
  const [phaseId, setPhaseId] = useState(phases[0]?.id ?? "");
  const [tier1Id, setTier1Id] = useState<string | null>(() => pickFirstTier1(phases[0] ?? null)?.id ?? null);
  const [tier2Id, setTier2Id] = useState<string | null>(() =>
    pickFirstTier2(pickFirstTier1(phases[0] ?? null))?.id ?? null
  );
  /** Как на референсе: по умолчанию колонка фото (список), не крупная сетка */
  const [viewMode, setViewMode] = useState<CaseStudyViewMode>("list");

  const phase = useMemo(() => phases.find((p) => p.id === phaseId) ?? phases[0], [phases, phaseId]);

  useEffect(() => {
    if (!phase) return;
    const t1 = pickFirstTier1(phase);
    setTier1Id(t1?.id ?? null);
    const t2 = pickFirstTier2(t1);
    setTier2Id(t2?.id ?? null);
  }, [phase]);

  const selectedTier1 = useMemo(() => {
    if (!phase?.tier1.length) return null;
    return phase.tier1.find((t) => t.id === tier1Id) ?? phase.tier1[0];
  }, [phase, tier1Id]);

  const selectedTier2 = useMemo(() => {
    if (!selectedTier1?.tier2.length) return null;
    return selectedTier1.tier2.find((t) => t.id === tier2Id) ?? selectedTier1.tier2[0];
  }, [selectedTier1, tier2Id]);

  const images = selectedTier2?.images?.filter(Boolean) ?? [];

  const onPhaseClick = useCallback((id: string) => {
    setPhaseId(id);
  }, []);

  if (!phases.length) {
    return (
      <p className="text-sm text-[var(--text-muted)]">Нет разделов для отображения.</p>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:gap-x-12">
      <aside
        className="rounded-[1.35rem] border py-5 pl-3 pr-3 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset] sm:rounded-[1.5rem] sm:pl-4 sm:pr-4 lg:sticky lg:top-[7rem] lg:max-h-[min(88vh,calc(100vh-7rem))] lg:overflow-y-auto lg:self-start lg:py-6"
        style={{
          borderColor: "rgba(43, 47, 45, 0.09)",
          backgroundColor: "rgba(237, 235, 229, 0.92)",
        }}
      >
        <nav aria-label="Этапы строительства">
          <ul className="relative space-y-0 pl-1">
            <li
              className="pointer-events-none absolute bottom-4 left-[13px] top-4 w-px"
              style={{ backgroundColor: "rgba(43, 47, 45, 0.14)" }}
              aria-hidden
            />
            {phases.map((p) => {
              const active = p.id === phase?.id;
              return (
                <li key={p.id} className="relative">
                  <button
                    type="button"
                    onClick={() => onPhaseClick(p.id)}
                    className="flex w-full gap-3 rounded-lg py-2.5 pl-1 pr-1 text-left transition-colors hover:bg-black/[0.03]"
                  >
                    <span className="relative z-[1] mt-[7px] flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                      <span
                        className="rounded-full border-[1.5px] transition-all duration-200"
                        style={{
                          width: active ? 11 : 9,
                          height: active ? 11 : 9,
                          borderColor: active ? "var(--accent)" : "rgba(43, 47, 45, 0.28)",
                          backgroundColor: active ? "var(--accent)" : "transparent",
                          boxShadow: active ? "0 0 0 3px rgba(15, 61, 46, 0.12)" : "none",
                        }}
                      />
                    </span>
                    <span
                      className={`min-w-0 text-[13px] leading-[1.38] sm:text-[14px] ${active ? "font-semibold text-[var(--accent)]" : "font-normal text-[var(--text-muted)]"}`}
                    >
                      {p.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0 lg:pt-0.5">
        <h2 className="font-heading text-[1.45rem] font-bold leading-[1.12] tracking-tight text-[var(--text)] sm:text-[1.65rem] md:text-[1.85rem]">
          {phase?.title ?? ""}
        </h2>

        {phase && phase.tier1.length > 0 ? (
          <>
            {/* Крупные «пилюли» подзадач этапа (как Плита / Ростверк на референсе) */}
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
                      backgroundColor: on ? "var(--accent)" : "rgba(232, 230, 225, 0.95)",
                      color: on ? "#fff" : "var(--text)",
                      border: `1px solid ${on ? "var(--accent)" : "rgba(43, 47, 45, 0.06)"}`,
                      boxShadow: on ? "none" : "0 1px 0 rgba(255,255,255,0.9) inset",
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
                        backgroundColor: on ? "var(--accent)" : "rgba(240, 238, 234, 0.98)",
                        color: on ? "#fff" : "var(--text)",
                        border: `1px solid ${on ? "var(--accent)" : "rgba(43, 47, 45, 0.07)"}`,
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-5 max-w-prose text-[13px] leading-relaxed text-[var(--text-muted)] sm:text-sm">
            Здесь будут ряды фильтров (материалы и виды работ). Структуру можно заполнить в данных кейса.
          </p>
        )}

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

        <CaseStudyGallery
          images={images}
          altBase={phase?.title ?? "Портфолио"}
          mode={viewMode}
          onImageClick={onGalleryImageClick}
        />
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
      style={{ borderColor: "var(--border)", backgroundColor: "rgba(255,255,255,0.7)" }}
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
        className="relative mt-7 flex min-h-[min(52vw,380px)] flex-col items-center justify-center overflow-hidden rounded-[1.35rem] px-6 text-center sm:min-h-[360px] sm:rounded-[1.5rem]"
        style={{
          background:
            "linear-gradient(155deg, rgba(12,52,40,0.97) 0%, rgba(15,61,46,0.88) 42%, rgba(18,72,56,0.94) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        <span
          className="pointer-events-none absolute -right-[18%] -top-[22%] h-[min(58vw,280px)] w-[min(58vw,280px)] rounded-full opacity-[0.14]"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.55) 0%, transparent 62%)",
          }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-[25%] -left-[12%] h-[min(48vw,220px)] w-[min(48vw,220px)] rounded-full opacity-[0.1]"
          style={{
            background: "radial-gradient(circle at 60% 40%, rgba(255,255,255,0.45) 0%, transparent 58%)",
          }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(42vw,200px)] w-[min(42vw,200px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]"
          aria-hidden
        />
        <span className="relative z-[1] max-w-[17rem] text-[15px] font-medium leading-snug tracking-[0.01em] text-white/[0.96] sm:max-w-[20rem] sm:text-[17px]">
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
