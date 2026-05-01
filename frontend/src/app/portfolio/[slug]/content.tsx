"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Tag, Calendar } from "lucide-react";
import { mergeProjectVideoUrls, type PortfolioCase } from "@/lib/portfolio-data";
import { EditorialPageShell } from "@/components/editorial/editorial-page-shell";
import { EditorialBanner, editorialSlidesFromImagesAndVideo } from "@/components/editorial/editorial-banner";
import { formatArticleBody } from "@/lib/html-content";
import { ImageLightbox } from "@/components/ui/image-lightbox";

function caseBannerUrls(p: PortfolioCase): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (u?: string | null) => {
    const s = u?.trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  };
  push(p.coverImage);
  for (const u of p.galleryUrls ?? []) push(u);
  return out;
}

function NavLink({ href, label, direction }: { href: string; label: string; direction: "prev" | "next" }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex-1 flex items-center gap-4 px-6 py-6 md:py-8 rounded-2xl relative overflow-hidden transition-all duration-500"
      style={{ border: "1px solid var(--border)" }}
    >
      <div
        className="absolute inset-0 origin-left transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{
          backgroundColor: "var(--text)",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
        }}
      />
      {direction === "prev" && (
        <ArrowLeft
          size={20}
          className="relative z-10 transition-colors duration-700"
          style={{ color: hovered ? "var(--bg)" : "var(--text)" }}
        />
      )}
      <div className="relative z-10 flex-1">
        <span
          className="text-[10px] uppercase tracking-[0.15em] block mb-1 transition-colors duration-700"
          style={{ color: hovered ? "var(--bg)" : "var(--text-muted)" }}
        >
          {direction === "prev" ? "Предыдущий проект" : "Следующий проект"}
        </span>
        <span
          className="font-heading text-lg md:text-xl transition-colors duration-700"
          style={{ color: hovered ? "var(--bg)" : "var(--text)" }}
        >
          {label}
        </span>
      </div>
      {direction === "next" && (
        <ArrowRight
          size={20}
          className="relative z-10 transition-colors duration-700"
          style={{ color: hovered ? "var(--bg)" : "var(--text)" }}
        />
      )}
    </Link>
  );
}

export function CaseContent({
  project,
  allSlugs = [],
  pageH1,
}: {
  project: PortfolioCase;
  allSlugs?: string[];
  /** Совпадает с полем H1 в SEO (PageMeta), иначе — название проекта из БД */
  pageH1: string;
}) {
  const currentIndex = allSlugs.indexOf(project.slug);
  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null;
  const nextSlug = currentIndex < allSlugs.length - 1 ? allSlugs[currentIndex + 1] : null;

  const bannerSlides = useMemo(
    () =>
      editorialSlidesFromImagesAndVideo(
        caseBannerUrls(project),
        mergeProjectVideoUrls(project.videoUrls, project.videoUrl)
      ),
    [project]
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const metaPills = (
    <div className="flex flex-wrap items-center gap-4">
      <span
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full"
        style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        <Tag size={10} />
        {project.tag}
      </span>
      {project.year && (
        <span
          className="inline-flex items-center gap-1.5 text-[10px] tracking-wider"
          style={{ color: "var(--text-subtle)" }}
        >
          <Calendar size={10} />
          {project.year}
        </span>
      )}
    </div>
  );

  return (
    <>
      <ImageLightbox
        slides={bannerSlides}
        index={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
        alt={project.title}
      />
      <EditorialPageShell
        backHref="/portfolio"
        backLabel="Вернуться к проектам"
        meta={metaPills}
        title={pageH1}
        mediaAfterTitle={
          bannerSlides.length > 0 ? (
            <EditorialBanner
              slides={bannerSlides}
              alt={project.title}
              fullBleed={false}
              borderedFrame
              onOpenGallery={(slideIdx) => {
                setLightboxIndex(slideIdx);
                setLightboxOpen(true);
              }}
            />
          ) : null
        }
        lead={
          project.heroDescription ? (
            <div
              className="prose prose-sm md:prose-base max-w-none"
              style={{ color: "var(--text-muted)" }}
              dangerouslySetInnerHTML={{ __html: formatArticleBody(project.heroDescription) }}
            />
          ) : null
        }
      />

      {(prevSlug || nextSlug) && (
        <section
          className="py-16 md:py-20"
          style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border)" }}
        >
          <div className="container mx-auto max-w-3xl px-5">
            <div className="flex flex-col md:flex-row gap-4">
              {prevSlug && <NavLink href={`/portfolio/${prevSlug}`} label="Предыдущий" direction="prev" />}
              {nextSlug && <NavLink href={`/portfolio/${nextSlug}`} label="Следующий" direction="next" />}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
