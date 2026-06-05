"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

const TOTAL_PAGES = 1;

export function ProjectTemplateViewer() {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);

  const safePage = Math.min(Math.max(page, 1), TOTAL_PAGES);

  return (
    <section className="px-4 pb-16 pt-8 sm:px-6 md:pb-20" style={{ backgroundColor: "var(--bg)" }} onContextMenu={(e) => e.preventDefault()}>
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-6 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.16em]" style={{ color: "color-mix(in srgb, var(--text) 45%, transparent)" }}>
            Шаблон проекта
          </p>
          <h2 className="mt-3 font-heading text-3xl font-medium md:text-4xl" style={{ color: "var(--text)" }}>
            Как выглядит стандартный проект
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "color-mix(in srgb, var(--text) 62%, transparent)" }}>
            Пример альбома проектной документации, который клиент получает после проектирования. Документ можно
            листать и увеличивать прямо на странице.
          </p>
        </div>

        <div className="overflow-hidden rounded-sm bg-[#071f1b] shadow-[0_24px_80px_rgba(7,31,27,0.24)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white sm:px-5">
            <div className="text-sm text-white/70">
              Страница {safePage} / {TOTAL_PAGES}
            </div>
            <div className="flex items-center gap-2">
              <ViewerButton label="Предыдущая страница" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>
                <ChevronLeft size={16} />
              </ViewerButton>
              <ViewerButton label="Следующая страница" onClick={() => setPage((p) => Math.min(TOTAL_PAGES, p + 1))} disabled={safePage >= TOTAL_PAGES}>
                <ChevronRight size={16} />
              </ViewerButton>
              <span className="mx-1 h-5 w-px bg-white/12" aria-hidden />
              <ViewerButton label="Уменьшить" onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(1))))}>
                <ZoomOut size={16} />
              </ViewerButton>
              <span className="min-w-12 text-center text-xs text-white/60">{Math.round(zoom * 100)}%</span>
              <ViewerButton label="Увеличить" onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(1))))}>
                <ZoomIn size={16} />
              </ViewerButton>
            </div>
          </div>

          <div className="max-h-[78vh] overflow-auto bg-[#0b1412] p-4 sm:p-6">
            <div className="mx-auto w-fit origin-top transition-transform" style={{ transform: `scale(${zoom})` }}>
              <iframe
                src={`/proektirovanie/project-template.pdf#page=${safePage}&toolbar=0&navpanes=0&scrollbar=0`}
                title="Шаблон проекта"
                className="h-[72vh] w-[min(92vw,920px)] border-0 bg-white"
              />
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed" style={{ color: "color-mix(in srgb, var(--text) 45%, transparent)" }}>
          Скачивание и копирование скрыты в интерфейсе настолько, насколько это возможно в браузере. Полностью
          запретить снимки экрана технически невозможно.
        </p>
      </div>
    </section>
  );
}

function ViewerButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-9 w-9 items-center justify-center rounded border border-white/12 text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}
