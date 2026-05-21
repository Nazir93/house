"use client";

import { useMemo, useState } from "react";
import { CmsImage } from "@/components/ui/cms-image";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { formatDateRu } from "@/lib/client-portal-labels";

export type AccountPhotoItem = {
  id: string;
  url: string;
  caption: string | null;
  shotAt: Date | string | null;
};

type AccountPhotoGalleryProps = {
  photos: AccountPhotoItem[];
  /** Компактная сетка на главной ЛК */
  variant?: "page" | "preview";
};

export function AccountPhotoGallery({ photos, variant = "page" }: AccountPhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const slides = useMemo(
    () => photos.map((ph) => ({ type: "image" as const, url: ph.url })),
    [photos]
  );

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  if (photos.length === 0) {
    return <p className="text-sm opacity-60">—</p>;
  }

  const isPreview = variant === "preview";
  const gridClass = isPreview
    ? "grid grid-cols-3 gap-2"
    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3";

  return (
    <>
      <ImageLightbox
        slides={slides}
        index={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
        alt="Фотоотчёт объекта"
      />
      <div className={gridClass}>
        {photos.map((ph, index) => (
          <figure
            key={ph.id}
            className={`overflow-hidden border bg-black/5 ${isPreview ? "rounded-lg flex flex-col" : "rounded-xl"}`}
            style={{ borderColor: "var(--border)" }}
          >
            <button
              type="button"
              className="relative block aspect-square w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              onClick={() => openLightbox(index)}
              aria-label={ph.caption ? `Открыть: ${ph.caption}` : "Открыть фото"}
            >
              <CmsImage
                src={ph.url}
                alt={ph.caption || "Фото объекта"}
                fill
                className="object-cover"
                sizes={isPreview ? "120px" : "240px"}
              />
            </button>
            {(ph.caption || ph.shotAt) ? (
              <figcaption
                className={`leading-snug ${isPreview ? "p-1.5 text-[10px] flex-1" : "p-2 text-[11px]"}`}
                style={{ color: "var(--text-muted)" }}
              >
                {ph.caption ? (
                  <span className={isPreview ? "line-clamp-2" : undefined}>{ph.caption}</span>
                ) : null}
                {ph.shotAt ? (
                  <span className={isPreview ? "block mt-0.5 tabular-nums" : "block"}>{formatDateRu(ph.shotAt)}</span>
                ) : null}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </>
  );
}
