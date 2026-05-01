"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PORTFOLIO_CASES } from "@/lib/portfolio-data";
import type { ProjectListItem } from "@/lib/get-projects";
import { isGifUrl } from "@/components/editorial/editorial-banner";

/** Растровое изображение по URL (в т.ч. PNG в поле «видео» — не в тег video) */
function isRasterImageUrl(url: string): boolean {
  return /\.(png|jpe?g|webp|gif|avif|bmp)(\?.*)?$/i.test(url);
}

function FillLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center justify-between mt-6 sm:mt-8 px-5 sm:px-8 py-5 sm:py-6 md:py-7 rounded-2xl font-heading text-lg sm:text-xl md:text-2xl relative overflow-hidden transition-all duration-500"
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="absolute inset-0 origin-left transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] rounded-2xl"
        style={{
          backgroundColor: "var(--text)",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
        }}
      />
      <span
        className="relative z-10 transition-colors duration-700"
        style={{ color: hovered ? "var(--bg)" : "var(--text)" }}
      >
        {label}
      </span>
      <ArrowRight
        size={22}
        className="relative z-10 transition-colors duration-700"
        style={{ color: hovered ? "var(--bg)" : "var(--text)" }}
      />
    </Link>
  );
}

interface PortfolioProject {
  id: string;
  slug: string;
  title: string;
  type: string;
  year: string;
  shortDescription: string;
  coverImage?: string | null;
  videoUrl?: string | null;
}

function PortfolioRow({ project, index, isOpen, onToggle }: { project: PortfolioProject; index: number; isOpen: boolean; onToggle: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = typeof window !== "undefined" ? window.innerHeight : 0;
    const vw = typeof window !== "undefined" ? window.innerWidth : 0;
    if (rect.bottom > 0 && rect.top < vh && rect.right > 0 && rect.left < vw) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "120px 0px 160px 0px" }
    );
    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) setMediaLoaded(false);
  }, [isOpen]);

  const active = visible && isOpen;

  /** Safari/WebKit: кэшированное фото может не вызвать onLoad при первом показе */
  useLayoutEffect(() => {
    if (!active || !contentRef.current) return;
    const root = contentRef.current;
    const videos = root.querySelectorAll("video");
    for (let i = 0; i < videos.length; i++) {
      const el = videos[i];
      if (el instanceof HTMLVideoElement && el.readyState >= 2) {
        setMediaLoaded(true);
        return;
      }
    }
    const imgs = root.querySelectorAll("img");
    for (let i = 0; i < imgs.length; i++) {
      const el = imgs[i];
      if (el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0) {
        setMediaLoaded(true);
        return;
      }
    }
  }, [active, project.slug, project.videoUrl, project.coverImage]);
  const isRasterOrGif = Boolean(
    project.videoUrl && (isGifUrl(project.videoUrl) || isRasterImageUrl(project.videoUrl))
  );
  const hasPreviewUnderlay = Boolean(
    (isRasterOrGif && project.coverImage) ||
      (project.videoUrl && !isRasterOrGif && project.coverImage)
  );
  const showLoadingOverlay =
    active &&
    !mediaLoaded &&
    !hasPreviewUnderlay &&
    Boolean(isRasterOrGif || project.videoUrl || project.coverImage);

  return (
    <div
      ref={rowRef}
      className="border-b transition-all duration-700 ease-out"
      style={{
        borderColor: "var(--border)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(40px)",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      {/* Row */}
      <button
        onClick={onToggle}
        className="w-full grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-start gap-x-2 sm:gap-x-3 md:gap-x-4 py-3.5 sm:py-4 lg:pr-20 text-left group cursor-pointer min-h-[48px]"
      >
        <span
          className="font-heading text-[10px] sm:text-xs md:text-sm tracking-[0.05em] transition-colors duration-200 group-hover:text-[var(--accent)] min-w-0 pr-1 md:pr-2 leading-snug text-balance"
          style={{ color: "var(--text)" }}
        >
          {project.title.toUpperCase()}
        </span>
        <span
          className="hidden md:block min-w-0 text-xs md:text-sm tracking-[0.08em] leading-snug text-balance"
          style={{ color: "var(--text-muted)" }}
        >
          {project.type}
        </span>
        <span
          className="shrink-0 text-[10px] sm:text-xs text-right tabular-nums leading-snug pt-0.5 md:pt-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          ({project.year})
        </span>
      </button>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-[height] duration-500 ease-in-out"
        style={{ height: `${height}px` }}
      >
        <div ref={contentRef} className="pb-8 pt-2 lg:pr-20">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-8">
            {/* Left: description */}
            <div className="max-w-sm">
              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
                {project.shortDescription}
              </p>
              <Link
                href={`/portfolio/${project.slug}`}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] transition-colors duration-200 hover:text-[var(--accent)]"
                style={{ color: "var(--text)" }}
              >
                <span className="underline underline-offset-4">подробнее</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div
              className="aspect-[4/3] md:aspect-[16/10] flex items-center justify-center rounded-lg overflow-hidden relative bg-[var(--bg-secondary)]"
            >
              {/* Не рендерить img/video при закрытой панели: src={undefined} даёт иконку «битого» изображения при схлопывании */}
              {active ? (
                <>
                  {showLoadingOverlay ? (
                    <div
                      className="absolute inset-0 z-[1] flex items-center justify-center"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                      aria-hidden
                    >
                      <div
                        className="h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin"
                        role="status"
                        aria-label="Загрузка"
                      />
                    </div>
                  ) : null}
                  {isRasterOrGif ? (
                    <>
                      {project.coverImage ? (
                        <img
                          src={project.coverImage}
                          alt=""
                          className={`absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-300 ${
                            mediaLoaded ? "opacity-0" : "opacity-100"
                          }`}
                          aria-hidden
                        />
                      ) : null}
                      <img
                        src={project.videoUrl!}
                        alt={project.title}
                        onLoad={() => setMediaLoaded(true)}
                        className={`absolute inset-0 z-[2] h-full w-full object-cover transition-opacity duration-300 ${
                          mediaLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        loading="eager"
                        decoding="async"
                        fetchPriority={isOpen ? "high" : "low"}
                      />
                    </>
                  ) : project.videoUrl ? (
                    <video
                      poster={project.coverImage ?? undefined}
                      src={project.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      onLoadedMetadata={() => setMediaLoaded(true)}
                      onLoadedData={() => setMediaLoaded(true)}
                      onCanPlay={() => setMediaLoaded(true)}
                      className="absolute inset-0 z-[2] h-full w-full object-cover"
                    />
                  ) : project.coverImage ? (
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      onLoad={() => setMediaLoaded(true)}
                      className={`absolute inset-0 z-[2] h-full w-full object-cover transition-opacity duration-300 ${
                        mediaLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      loading="eager"
                      decoding="async"
                    />
                  ) : (
                    <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>
                      Фото / Видео проекта
                    </span>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortfolioSection({ projects: propProjects }: { projects?: ProjectListItem[] } = {}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items: PortfolioProject[] = propProjects && propProjects.length > 0
    ? propProjects.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        type: p.type,
        year: p.year,
        shortDescription: p.shortDescription,
        coverImage: p.coverImage,
        videoUrl: p.videoUrl,
      }))
    : PORTFOLIO_CASES.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        type: c.type,
        year: c.year,
        shortDescription: c.shortDescription,
        coverImage: null,
        videoUrl: c.videoUrl ?? null,
      }));

  return (
    <section
      id="portfolio"
      className="py-16 sm:py-20 md:py-28 overflow-hidden"
      style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border)" }}
    >
      <div className="container mx-auto">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-8 sm:mb-12" style={{ color: "var(--text)" }}>
          Портфолио
        </h2>

        <div className="border-t" style={{ borderColor: "var(--border)" }}>
          {items.map((project, i) => (
            <PortfolioRow
              key={project.id}
              project={project}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        <FillLink href="/portfolio" label="Смотреть все проекты" />
      </div>
    </section>
  );
}
