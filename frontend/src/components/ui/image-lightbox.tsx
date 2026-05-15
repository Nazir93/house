"use client";

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { EditorialSlide } from "@/components/editorial/editorial-banner";

type MediaLightboxProps = {
  slides: EditorialSlide[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  alt: string;
};

export function ImageLightbox({
  slides,
  index,
  open,
  onClose,
  onIndexChange,
  alt,
}: MediaLightboxProps) {
  const n = slides.length;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (n <= 1) return;
      onIndexChange((index + dir + n) % n);
    },
    [index, n, onIndexChange]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, go]);

  if (!open || n === 0 || typeof document === "undefined") return null;

  const slide = slides[index];
  if (!slide) return null;

  const kindLabel = slide.type === "video" ? "видео" : "фото";

  return createPortal(
    <ImageLightboxBody
      slide={slide}
      index={index}
      n={n}
      alt={alt}
      kindLabel={kindLabel}
      go={go}
      onClose={onClose}
    />,
    document.body
  );
}

function lightboxImageUnoptimized(url: string): boolean {
  const t = url.trim();
  if (t.startsWith("data:") || /\.(gif|svg)($|\?)/i.test(t)) return true;
  /** Локальные файлы: без `/_next/image` — не ждём ресайз на сервере при открытии модалки. */
  if (t.startsWith("/uploads/")) return true;
  return false;
}

function ImageLightboxBody({
  slide,
  index,
  n,
  alt,
  kindLabel,
  go,
  onClose,
}: {
  slide: EditorialSlide;
  index: number;
  n: number;
  alt: string;
  kindLabel: string;
  go: (dir: -1 | 1) => void;
  onClose: () => void;
}) {
  const [mediaReady, setMediaReady] = useState(false);
  const [imageSlowLoad, setImageSlowLoad] = useState(false);

  useEffect(() => {
    setMediaReady(false);
    setImageSlowLoad(false);
  }, [slide.url, slide.type, index]);

  useEffect(() => {
    if (slide.type !== "image") return;
    const id = window.setTimeout(() => setImageSlowLoad(true), 350);
    return () => window.clearTimeout(id);
  }, [slide.url, slide.type, index]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
      style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр медиа"
    >
      <button type="button" className="absolute inset-0 cursor-zoom-out" aria-label="Закрыть" onClick={onClose} />

      <button
        type="button"
        className="absolute top-4 right-4 z-[210] p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Закрыть"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X size={24} />
      </button>

      {n > 1 && (
        <>
          <button
            type="button"
            className="group absolute left-3 md:left-6 top-1/2 z-[210] flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/[0.07] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md transition hover:border-white/55 hover:bg-white/[0.14]"
            aria-label="Предыдущее"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
          >
            <ChevronLeft size={26} strokeWidth={1.35} className="transition group-hover:-translate-x-px" />
          </button>
          <button
            type="button"
            className="group absolute right-3 md:right-6 top-1/2 z-[210] flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/[0.07] text-white shadow-[0_12px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md transition hover:border-white/55 hover:bg-white/[0.14]"
            aria-label="Следующее"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            <ChevronRight size={26} strokeWidth={1.35} className="transition group-hover:translate-x-px" />
          </button>
        </>
      )}

      <div
        className="relative z-[205] w-full max-w-[min(96vw,1400px)] h-[min(85vh,90vw)] pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {slide.type === "image" ? (
          <>
            {imageSlowLoad ? (
              <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
                <div
                  className={`h-10 w-10 rounded-full border-2 border-white/25 border-t-white animate-spin transition-opacity duration-200 ${
                    mediaReady ? "opacity-0" : "opacity-90"
                  }`}
                  role="status"
                  aria-label="Загрузка"
                />
              </div>
            ) : null}
            <Image
              src={slide.url}
              alt={`${alt} — ${kindLabel} ${index + 1}`}
              fill
              className="pointer-events-auto object-contain opacity-100"
              sizes="(max-width: 1400px) 96vw, 1200px"
              quality={78}
              priority
              fetchPriority="high"
              decoding="async"
              unoptimized={lightboxImageUnoptimized(slide.url)}
              onLoadingComplete={() => setMediaReady(true)}
              onLoad={() => setMediaReady(true)}
            />
          </>
        ) : (
          <>
            {!mediaReady ? (
              <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
                <div
                  className="h-10 w-10 rounded-full border-2 border-white/25 border-t-white animate-spin"
                  role="status"
                  aria-label="Загрузка"
                />
              </div>
            ) : null}
            <video
              key={`${slide.url}-${index}`}
              src={slide.url}
              controls
              playsInline
              preload="auto"
              onLoadedMetadata={() => setMediaReady(true)}
              onLoadedData={() => setMediaReady(true)}
              onCanPlay={() => setMediaReady(true)}
              className={`pointer-events-auto absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
                mediaReady ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
              aria-label={`${alt} — ${kindLabel} ${index + 1}`}
            />
          </>
        )}
      </div>

      {n > 1 && (
        <div className="absolute bottom-6 left-1/2 z-[210] -translate-x-1/2 text-xs tabular-nums text-white/70">
          {index + 1} / {n}
        </div>
      )}
    </div>
  );
}
