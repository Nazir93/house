"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPinned, Play } from "lucide-react";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { PortfolioCaseStudy } from "@/components/portfolio/portfolio-case-study";
import { getCaseStudyPhasesForObject } from "@/lib/portfolio-case-study";
import {
  CaseStudyFaqSection,
  CaseStudyLeadCtaSection,
  ConstructionServicesStagesSection,
} from "@/components/sections/case-study-landing-sections";
import { builtObjectMaterialLabel, type BuiltObjectItem } from "@/lib/construction-shared";

export function BuiltObjectDetailContent({ object }: { object: BuiltObjectItem }) {
  const [expanded, setExpanded] = useState(false);
  const [worksOpen, setWorksOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const images = object.media.filter((item) => item.type !== "VIDEO");
  const videos = object.media.filter((item) => item.type === "VIDEO");
  const slides = useMemo(() => images.map((media) => ({ type: "image" as const, url: media.url })), [images]);

  const casePhases = useMemo(() => getCaseStudyPhasesForObject(object), [object]);

  function openLightbox(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function openLightboxByUrl(url: string) {
    const idx = slides.findIndex((s) => s.url === url);
    if (idx >= 0) openLightbox(idx);
  }

  const metaLine = [
    object.area ? `${object.area} м²` : null,
    object.material ? builtObjectMaterialLabel(object.material) : null,
    object.location?.trim() || null,
  ].filter(Boolean);

  return (
    <>
      <ImageLightbox
        slides={slides}
        index={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
        alt={object.title}
      />
      <article className="pb-20 pt-28" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <nav className="text-[12px] tracking-[0.02em] text-[var(--text-muted)] sm:text-[13px]" aria-label="Навигация по разделу">
            <Link href="/" className="transition-colors hover:text-[var(--accent)]">
              Главная
            </Link>
            <span className="mx-1.5 text-[var(--text-subtle)] sm:mx-2" aria-hidden>
              {' > '}
            </span>
            <Link href="/portfolio" className="transition-colors hover:text-[var(--accent)]">
              Наши проекты
            </Link>
          </nav>

          <h1 className="mt-3 font-heading text-[1.65rem] font-bold leading-[1.15] tracking-tight text-[var(--text)] sm:mt-4 sm:text-4xl md:text-[2.35rem] lg:text-[2.65rem] lg:leading-[1.1]">
            {object.title}
          </h1>

          {metaLine.length > 0 ? (
            <p className="mt-2 text-[13px] text-[var(--text-muted)] sm:mt-2.5 sm:text-sm">{metaLine.join(" · ")}</p>
          ) : null}

          {/* Как на референсе: сразу двухколоночный кейс без полноэкранного героя сверху (обложка — в галерее / блоке параметров) */}
          <div className="mt-8 sm:mt-10 lg:mt-11">
            <PortfolioCaseStudy phases={casePhases} onGalleryImageClick={openLightboxByUrl} />
          </div>

          <CaseStudyFaqSection />
          <ConstructionServicesStagesSection />
          <CaseStudyLeadCtaSection />

          <section
            className="mt-14 rounded-[1.25rem] border p-6 md:mt-16 md:p-8"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
          >
            <h2 className="font-heading text-xl md:text-2xl">Параметры объекта</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Срок строительства", object.buildTerm],
                ["Площадь", object.area ? `${object.area} м²` : null],
                ["Фундамент", object.foundation],
                ["Стены", object.walls],
                ["Кровля", object.roof],
                ["Этажность", object.floors ? `${object.floors}` : null],
              ]
                .filter((row): row is [string, string] => Boolean(row[1]))
                .map(([label, value]) => (
                  <div key={label} className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "var(--border)" }}>
                    <div style={{ color: "var(--text-muted)" }}>{label}</div>
                    <div className="mt-1 font-semibold">{value}</div>
                  </div>
                ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {object.latitude && object.longitude ? (
                <Link
                  href="/portfolio?view=map#portfolio-map"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <MapPinned size={16} /> Дом на карте
                </Link>
              ) : null}
              {object.houseProjectSlug ? (
                <Link
                  href={`/projects/${object.houseProjectSlug}`}
                  className="inline-flex rounded-full border px-4 py-2 text-sm font-semibold"
                  style={{ borderColor: "var(--border)" }}
                >
                  Перейти к проекту дома
                </Link>
              ) : null}
            </div>
          </section>

          <section className="mt-10 rounded-[1.25rem] p-6 md:mt-12" style={{ backgroundColor: "rgba(233, 231, 227, 0.35)" }}>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="font-heading text-xl md:text-2xl">Описание объекта</span>
              <ChevronDown className={expanded ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            <div
              className={expanded ? "mt-4 text-sm leading-relaxed" : "mt-4 line-clamp-3 text-sm leading-relaxed"}
              style={{ color: "var(--text-muted)" }}
              dangerouslySetInnerHTML={{ __html: object.description }}
            />
          </section>

          {videos.length > 0 ? (
            <section className="mt-12 rounded-[1.25rem] p-6 text-white md:mt-14" style={{ backgroundColor: "var(--accent)" }}>
              <h2 className="font-heading text-2xl md:text-3xl">Видео со стройки</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {videos.map((video) => (
                  <a key={video.id} href={video.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                    <Play size={18} /> {video.label || "Смотреть видео"}
                  </a>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {object.telegramUrl ? (
                  <a href={object.telegramUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--accent)]">
                    Telegram
                  </a>
                ) : null}
                {object.vkUrl ? (
                  <a href={object.vkUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--accent)]">
                    VK
                  </a>
                ) : null}
              </div>
            </section>
          ) : null}

          {object.worksDescription ? (
            <section className="mt-12 rounded-[1.25rem] border p-6 md:mt-14" style={{ borderColor: "var(--border)" }}>
              <button type="button" onClick={() => setWorksOpen((value) => !value)} className="flex w-full items-center justify-between gap-4 text-left">
                <span className="font-heading text-xl md:text-2xl">Произведённые работы</span>
                <ChevronDown className={worksOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
              {worksOpen ? (
                <div className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }} dangerouslySetInnerHTML={{ __html: object.worksDescription }} />
              ) : null}
            </section>
          ) : null}
        </div>
      </article>
    </>
  );
}
