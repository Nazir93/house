"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export type EditorialSlide = { type: "image" | "video"; url: string };

export function isGifUrl(url: string): boolean {
  return /\.gif($|\?)/i.test(url);
}

function pickImageUrls(urls: (string | null | undefined)[]): string[] {
  return urls.filter((u): u is string => Boolean(u && u.trim()));
}

/** Картинки по порядку, затем видео в конце (без дубликатов по URL). */
export function editorialSlidesFromImagesAndVideo(
  imageUrls: (string | null | undefined)[],
  videoInput?: string | null | (string | null | undefined)[]
): EditorialSlide[] {
  const seen = new Set<string>();
  const slides: EditorialSlide[] = [];
  for (const u of pickImageUrls(imageUrls)) {
    if (seen.has(u)) continue;
    seen.add(u);
    slides.push({ type: "image", url: u });
  }
  const videoList: string[] = [];
  if (videoInput != null) {
    if (Array.isArray(videoInput)) {
      for (const x of videoInput) {
        const v = x?.trim();
        if (v) videoList.push(v);
      }
    } else {
      const v = videoInput.trim();
      if (v) videoList.push(v);
    }
  }
  for (const v of videoList) {
    if (seen.has(v)) continue;
    seen.add(v);
    slides.push({ type: isGifUrl(v) ? "image" : "video", url: v });
  }
  return slides;
}

type EditorialBannerProps = {
  /** Слайды баннера: фото и/или видео */
  slides: EditorialSlide[];
  alt: string;
  className?: string;
  /** Без скруглений и с отступом только снизу — для блока на всю ширину экрана */
  fullBleed?: boolean;
  /** Рамка как у лендинга услуги: rounded-xl + border */
  borderedFrame?: boolean;
  /** Открыть полноэкранную галерею (фото + видео в одном списке) */
  onOpenGallery?: (slideIndex: number) => void;
};

export function EditorialBanner({
  slides,
  alt,
  className = "",
  fullBleed = false,
  borderedFrame = false,
  onOpenGallery,
}: EditorialBannerProps) {
  const [index, setIndex] = useState(0);
  const [slideReady, setSlideReady] = useState(false);
  const slidesKey = slides.map((s) => `${s.type}:${s.url}`).join("|");

  useEffect(() => {
    setIndex(0);
  }, [slidesKey]);

  useEffect(() => {
    setSlideReady(false);
  }, [index, slidesKey]);

  /** WebKit часто не вызывает onLoadingComplete при первом заходе; таймаут убирает вечный спиннер */
  useEffect(() => {
    const id = window.setTimeout(() => setSlideReady(true), 12000);
    return () => clearTimeout(id);
  }, [index, slidesKey]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (slides.length <= 1) return;
      setIndex((i) => (i + dir + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, slides.length]);

  const frameRounded = fullBleed ? "rounded-none" : borderedFrame ? "rounded-xl" : "rounded-2xl";
  const frameBorder =
    fullBleed ? "" : borderedFrame ? "border border-[var(--border)]" : "";
  const emptyMb = fullBleed ? "mb-0" : "mb-10";

  if (slides.length === 0) {
    return (
      <div
        className={`relative w-full aspect-[16/9] ${emptyMb} ${frameRounded} overflow-hidden flex items-center justify-center ${frameBorder} ${className}`}
        style={{
          backgroundColor: "var(--bg-secondary)",
          ...(fullBleed || borderedFrame ? {} : { border: "1px solid var(--border)" }),
        }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-center px-4" style={{ color: "var(--text-subtle)" }}>
          Добавьте фото или видео в админке
        </span>
      </div>
    );
  }

  const current = slides[index];

  return (
    <div className={`relative w-full ${fullBleed ? "mb-0" : "mb-10"} ${className}`}>
      <div
        className={`relative w-full aspect-[16/9] ${frameRounded} overflow-hidden ${frameBorder}`}
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        {!slideReady && (
          <div
            className="absolute inset-0 z-[30] flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-secondary)" }}
            aria-busy="true"
            aria-label="Загрузка медиа"
          >
            <div
              className="h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin"
              role="presentation"
            />
          </div>
        )}
        {current.type === "image" ? (
          <>
            <Image
              src={current.url}
              alt={slides.length > 1 ? `${alt} — ${index + 1}` : alt}
              fill
              className={`object-cover transition-opacity duration-500 ease-out ${
                slideReady ? "opacity-100" : "opacity-0"
              }`}
              sizes={fullBleed ? "100vw" : "(max-width: 768px) 100vw, 720px"}
              priority
              unoptimized={current.url.startsWith("/uploads/")}
              onLoadingComplete={() => setSlideReady(true)}
              onLoad={() => setSlideReady(true)}
            />
            {onOpenGallery ? (
              <button
                type="button"
                className="absolute inset-0 z-[5] cursor-zoom-in bg-transparent"
                aria-label="Открыть галерею на весь экран"
                onClick={() => onOpenGallery(index)}
              />
            ) : null}
          </>
        ) : (
          <>
            <video
              key={current.url}
              src={current.url}
              controls
              playsInline
              preload="auto"
              onLoadedMetadata={() => setSlideReady(true)}
              onLoadedData={() => setSlideReady(true)}
              onCanPlay={() => setSlideReady(true)}
              className={`absolute inset-0 z-[2] w-full h-full object-cover transition-opacity duration-500 ease-out ${
                slideReady ? "opacity-100" : "opacity-0"
              }`}
              aria-label={slides.length > 1 ? `${alt} — видео ${index + 1}` : `${alt} — видео`}
            />
            {onOpenGallery ? (
              <button
                type="button"
                className="absolute top-2 right-2 z-[25] flex items-center justify-center p-2.5 rounded-lg bg-black/55 text-white hover:bg-black/75 transition-colors pointer-events-auto"
                aria-label="Открыть галерею с фото и видео"
                onClick={() => onOpenGallery(index)}
              >
                <Maximize2 size={20} strokeWidth={2} />
              </button>
            ) : null}
          </>
        )}
      </div>
      {slides.length > 1 ? (
        <>
          <div className="absolute inset-y-0 left-0 z-20 flex items-center px-2 pointer-events-none">
            <button
              type="button"
              onClick={() => go(-1)}
              className="pointer-events-auto p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              aria-label="Предыдущий слайд"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 z-20 flex items-center px-2 pointer-events-none">
            <button
              type="button"
              onClick={() => go(1)}
              className="pointer-events-auto p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              aria-label="Следующий слайд"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
            {slides.map((s, i) => (
              <button
                key={`${s.type}-${s.url}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? "1.25rem" : "0.375rem",
                  backgroundColor: i === index ? "var(--accent)" : "var(--border)",
                }}
                aria-label={s.type === "video" ? `Видео, слайд ${i + 1}` : `Фото, слайд ${i + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
