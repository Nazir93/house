"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";
import { clampPdfPage, loadPdfJs, PROJECT_TEMPLATE_PDF_URL } from "@/lib/pdfjs-viewer";

export function ProjectTemplateViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const loadingTaskRef = useRef<import("pdfjs-dist").PDFDocumentLoadingTask | null>(null);
  const renderTaskRef = useRef<import("pdfjs-dist").RenderTask | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderTick, setRenderTick] = useState(0);

  const safePage = clampPdfPage(page, totalPages);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const ro = new ResizeObserver(() => setRenderTick((n) => n + 1));
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const pdfjs = await loadPdfJs();
        const loadingTask = pdfjs.getDocument({ url: PROJECT_TEMPLATE_PDF_URL });
        loadingTaskRef.current = loadingTask;
        const doc = await loadingTask.promise;
        if (cancelled) {
          void loadingTask.destroy();
          return;
        }
        pdfRef.current = doc;
        setTotalPages(doc.numPages);
        setPage((p) => clampPdfPage(p, doc.numPages));
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Не удалось загрузить PDF. Попробуйте скачать файл.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      void loadingTaskRef.current?.destroy();
      loadingTaskRef.current = null;
      pdfRef.current = null;
    };
  }, []);

  useEffect(() => {
    const doc = pdfRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas || loading || error) return;

    let cancelled = false;
    setRendering(true);

    void (async () => {
      try {
        renderTaskRef.current?.cancel();
        const pdfPage = await doc.getPage(safePage);
        if (cancelled) return;

        const containerWidth = viewportRef.current?.clientWidth ?? 920;
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const fitScale = Math.min(containerWidth / baseViewport.width, 1.25);
        const outputScale = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const viewport = pdfPage.getViewport({ scale: fitScale * zoom * outputScale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / outputScale}px`;
        canvas.style.height = `${viewport.height / outputScale}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const task = pdfPage.render({ canvasContext: ctx, viewport, canvas });
        renderTaskRef.current = task;
        await task.promise;
        if (!cancelled) setRendering(false);
      } catch {
        if (!cancelled) setRendering(false);
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [error, loading, renderTick, safePage, zoom]);

  return (
    <section
      className="px-4 pb-16 pt-8 sm:px-6 md:pb-20"
      style={{ backgroundColor: "var(--bg)" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-6 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.16em]" style={{ color: "color-mix(in srgb, var(--text) 45%, transparent)" }}>
            Шаблон проекта
          </p>
          <h2
            className="mt-2 max-w-3xl text-balance font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl"
            style={{ color: "var(--text)" }}
          >
            Как выглядит стандартный проект
          </h2>
        </div>

        <div className="overflow-hidden rounded-[28px] bg-[#071f1b] shadow-[0_24px_80px_rgba(7,31,27,0.24)] md:rounded-[32px]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white sm:px-5">
            <div className="text-sm text-white/70">
              Страница {safePage} / {totalPages}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ViewerButton
                label="Предыдущая страница"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1 || loading}
              >
                <ChevronLeft size={16} />
              </ViewerButton>
              <ViewerButton
                label="Следующая страница"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages || loading}
              >
                <ChevronRight size={16} />
              </ViewerButton>
              <span className="mx-1 h-5 w-px bg-white/12" aria-hidden />
              <ViewerButton
                label="Уменьшить"
                onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(1))))}
                disabled={loading}
              >
                <ZoomOut size={16} />
              </ViewerButton>
              <span className="min-w-12 text-center text-xs text-white/60">{Math.round(zoom * 100)}%</span>
              <ViewerButton
                label="Увеличить"
                onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(1))))}
                disabled={loading}
              >
                <ZoomIn size={16} />
              </ViewerButton>
              <a
                href={PROJECT_TEMPLATE_PDF_URL}
                download
                className="inline-flex h-9 items-center gap-1.5 rounded border border-white/12 px-3 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <Download size={14} aria-hidden />
                Скачать
              </a>
            </div>
          </div>

          <div ref={viewportRef} className="max-h-[78vh] overflow-auto bg-[#0b1412] p-4 sm:p-6">
            {error ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center text-[#071f1b]">
                <p className="max-w-md text-sm leading-relaxed">{error}</p>
                <a
                  href={PROJECT_TEMPLATE_PDF_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-[#071f1b] px-5 py-3 text-sm font-semibold text-white"
                >
                  Открыть PDF
                </a>
              </div>
            ) : (
              <div className="relative mx-auto w-fit">
                {(loading || rendering) && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#0b1412]/70">
                    <div
                      className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white"
                      role="status"
                      aria-label="Загрузка PDF"
                    />
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  className="mx-auto block max-w-full rounded-2xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                  aria-label="Шаблон проекта"
                />
              </div>
            )}
          </div>
        </div>
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
