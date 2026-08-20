"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { CmsImage } from "@/components/ui/cms-image";
import type { HomeHeroPromoSlide } from "@/lib/home-hero-banner-schema";
import {
  formatHomeHeroPromoSlideEyebrow,
  homeHeroPromosForCatalogFilters,
  resolveHomeHeroPromoCaption,
} from "@/lib/home-hero-promo-teaser";
import { cn } from "@/lib/utils";

const ROTATE_MS = 5500;

/**
 * Промо из карусели главной — в пустом месте мобильных/планшетных фильтров каталога.
 * Те же слайды, что в админке «Баннер главной».
 */
export function CatalogFiltersHomePromoTeaser({
  promos,
  className,
}: {
  promos: HomeHeroPromoSlide[];
  className?: string;
}) {
  const slides = homeHeroPromosForCatalogFilters(promos);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[Math.min(index, slides.length - 1)]!;
  const eyebrow = formatHomeHeroPromoSlideEyebrow(index, slide.label);
  const caption = resolveHomeHeroPromoCaption(slide);

  return (
    <div className={cn("mt-auto flex min-h-0 flex-1 flex-col justify-end pt-5", className)}>
      <article
        className="overflow-hidden rounded-[1.35rem] border border-[color-mix(in_srgb,var(--text)_8%,transparent)] bg-[color-mix(in_srgb,var(--bg-secondary)_70%,var(--bg))] shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
        aria-roledescription="карусель"
        aria-label="Акции с главной"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--stone)]">
          <CmsImage
            src={slide.image}
            alt={slide.label}
            fill
            quality={72}
            sizes="(max-width: 1024px) 85vw, 360px"
            className="object-cover object-center transition duration-700"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 35%, color-mix(in srgb, var(--bg) 88%, transparent) 100%)",
            }}
            aria-hidden
          />
          {slides.length > 1 ? (
            <div className="absolute bottom-2.5 left-0 right-0 z-[1] flex justify-center gap-1.5" aria-hidden>
              {slides.map((s, i) => (
                <span
                  key={s.id}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    i === index ? "w-4 bg-[var(--accent)]" : "w-1.5 bg-[color-mix(in_srgb,var(--text)_35%,transparent)]",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative px-4 pb-4 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">{eyebrow}</p>
          <h3 className="mt-1.5 font-heading text-[1.05rem] font-bold leading-snug tracking-tight text-[var(--text)]">
            {slide.title}
          </h3>
          {caption ? (
            <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-[var(--text-muted)]">{caption}</p>
          ) : null}
          <Link
            href={slide.href}
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text)] underline-offset-4 transition hover:text-[var(--accent)] hover:underline"
          >
            Подробнее
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>
      </article>
    </div>
  );
}
