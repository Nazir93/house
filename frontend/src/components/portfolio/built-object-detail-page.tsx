"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Bath,
  BedDouble,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Expand,
  Home,
  Layers,
  MapPinned,
  Maximize2,
  Play,
  Ruler,
} from "lucide-react";

import { CmsImage } from "@/components/ui/cms-image";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  builtObjectCharacteristics,
  builtObjectMapHref,
  getBuiltObjectConstructionPhotos,
  getBuiltObjectHeroImage,
  getBuiltObjectHistoryCards,
  getBuiltObjectNavItems,
  getBuiltObjectPlansForPage,
  getBuiltObjectVideos,
  houseTypeSubtitle,
  type BuiltObjectNavSectionId,
} from "@/lib/built-object-detail";
import { formatArticleBody } from "@/lib/html-content";
import type { BuiltObjectItem } from "@/lib/construction-shared";
import { cn } from "@/lib/utils";

const CONSTRUCTION_GRID_LIMIT = 25;
const HIGHLIGHT_MS = 1400;

const CHAR_ICONS = [Ruler, Home, Layers, BedDouble, Bath, CalendarDays] as const;

function sectionDomId(id: BuiltObjectNavSectionId): string {
  return `built-section-${id}`;
}

export function BuiltObjectDetailPage({ object }: { object: BuiltObjectItem }) {
  const [descOpen, setDescOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<BuiltObjectNavSectionId>("description");
  const [flashSection, setFlashSection] = useState<BuiltObjectNavSectionId | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<{ type: "image"; url: string }[]>([]);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hero = getBuiltObjectHeroImage(object);
  const plans = useMemo(() => getBuiltObjectPlansForPage(object), [object]);
  const constructionPhotos = useMemo(() => getBuiltObjectConstructionPhotos(object), [object]);
  const historyCards = useMemo(() => getBuiltObjectHistoryCards(object), [object]);
  const videos = useMemo(() => getBuiltObjectVideos(object), [object]);
  const navItems = useMemo(() => getBuiltObjectNavItems(object), [object]);
  const characteristics = useMemo(() => builtObjectCharacteristics(object), [object]);
  const mapHref = builtObjectMapHref(object);
  const descriptionHtml = useMemo(() => formatArticleBody(object.description ?? ""), [object.description]);
  const plainDescription = useMemo(
    () => descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    [descriptionHtml],
  );

  const visiblePhotos = showAllPhotos
    ? constructionPhotos
    : constructionPhotos.slice(0, CONSTRUCTION_GRID_LIMIT);

  const scrollToSection = useCallback((id: BuiltObjectNavSectionId) => {
    const el = document.getElementById(sectionDomId(id));
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveNav(id);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlashSection(id);
    flashTimer.current = setTimeout(() => setFlashSection(null), HIGHLIGHT_MS);
  }, []);

  useEffect(() => {
    const ids = navItems.map((n) => n.id);
    const observers: IntersectionObserver[] = [];
    for (const id of ids) {
      const el = document.getElementById(sectionDomId(id));
      if (!el) continue;
      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
              setActiveNav(id);
            }
          }
        },
        { rootMargin: "-20% 0px -55% 0px", threshold: [0.25, 0.5] },
      );
      obs.observe(el);
      observers.push(obs);
    }
    return () => {
      for (const obs of observers) obs.disconnect();
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, [navItems]);

  function openLightbox(urls: string[], index: number) {
    setLightboxSlides(urls.map((url) => ({ type: "image" as const, url })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function sectionShell(
    id: BuiltObjectNavSectionId,
    title: string,
    children: ReactNode,
    headerAction?: ReactNode,
  ) {
    const highlighted = flashSection === id;
    return (
      <section
        id={sectionDomId(id)}
        className={cn(
          "scroll-mt-[calc(var(--site-header-sticky-offset)+1rem)] rounded-[1.25rem] border p-5 transition-[box-shadow,background-color] duration-500 md:p-7",
          highlighted && "ring-2 ring-[color-mix(in_srgb,var(--accent)_45%,transparent)]",
        )}
        style={{
          borderColor: "var(--border)",
          backgroundColor: highlighted
            ? "color-mix(in srgb, var(--accent) 8%, var(--bg-secondary))"
            : "var(--bg-secondary)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-heading text-lg font-bold md:text-xl" style={{ color: "var(--text)" }}>
            {title}
          </h2>
          {headerAction}
        </div>
        <div className="mt-4 md:mt-5">{children}</div>
      </section>
    );
  }

  const primaryVideo = videos[0];

  return (
    <>
      <ImageLightbox
        slides={lightboxSlides}
        index={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setLightboxIndex}
        alt={object.title}
      />

      <article className="pb-20 pt-[calc(var(--site-header-sticky-offset)+0.75rem)]" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <div className="container mx-auto max-w-[1320px] px-4 sm:px-5">
          {/* Верхний блок */}
          <div className="grid gap-8 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:items-start lg:gap-10">
            <aside className="lg:sticky lg:top-[calc(var(--site-header-sticky-offset)+0.75rem)]">
              <nav className="text-[11px] tracking-[0.02em] sm:text-[12px]" style={{ color: "var(--text-muted)" }} aria-label="Хлебные крошки">
                <Link href="/" className="hover:text-[var(--accent)]">
                  Главная
                </Link>
                <span className="mx-1.5" aria-hidden>
                  {" › "}
                </span>
                <Link href="/portfolio" className="hover:text-[var(--accent)]">
                  Проекты
                </Link>
                <span className="mx-1.5" aria-hidden>
                  {" › "}
                </span>
                <span style={{ color: "var(--text)" }}>{object.title}</span>
              </nav>

              <h1 className="mt-4 font-heading text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2rem]">
                {object.title}
              </h1>
              <p className="mt-1 text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
                {houseTypeSubtitle(object.material)}
              </p>

              {characteristics.length > 0 ? (
                <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
                  {characteristics.map((row, i) => {
                    const Icon = CHAR_ICONS[i % CHAR_ICONS.length];
                    return (
                      <div
                        key={row.label}
                        className="rounded-xl border px-3 py-2.5"
                        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
                      >
                        <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "var(--text-muted)" }}>
                          <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                          {row.label}
                        </dt>
                        <dd className="mt-1 text-sm font-semibold leading-snug">{row.value}</dd>
                      </div>
                    );
                  })}
                </dl>
              ) : null}

              <div className="mt-5 flex flex-col gap-2.5">
                {object.houseProjectSlug ? (
                  <Link
                    href={`/projects/${object.houseProjectSlug}`}
                    className="inline-flex min-h-[46px] items-center justify-center rounded-xl px-4 py-3 text-center text-sm font-bold text-[var(--accent-contrast)] transition hover:opacity-95"
                    style={{ backgroundColor: "var(--graphite)" }}
                  >
                    Хочу такой дом
                  </Link>
                ) : null}
                {mapHref ? (
                  <Link
                    href={mapHref}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-4 py-3 text-center text-sm font-semibold transition hover:border-[var(--accent)]"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
                  >
                    <MapPinned className="h-4 w-4 shrink-0" aria-hidden />
                    Объект на карте
                  </Link>
                ) : null}
              </div>

              <nav className="mt-6 space-y-1" aria-label="Разделы объекта">
                {navItems.map((item) => {
                  const active = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
                        active ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]",
                      )}
                      style={{
                        backgroundColor: active
                          ? "color-mix(in srgb, var(--accent) 12%, var(--bg))"
                          : "transparent",
                      }}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className={cn("h-4 w-4 shrink-0 opacity-50", active && "opacity-100")} aria-hidden />
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="min-w-0">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.35rem] bg-[var(--stone)] sm:aspect-[16/9] lg:min-h-[420px] lg:aspect-auto lg:h-[min(520px,58vh)]">
                {hero ? (
                  <CmsImage
                    src={hero.url}
                    alt={hero.alt || object.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 65vw"
                  />
                ) : null}
                <span className="absolute left-4 top-4 rounded-lg bg-black/55 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
                  Реализованный проект
                </span>
              </div>
            </div>
          </div>

          {/* Контентные блоки */}
          <div className="mt-10 space-y-8 md:mt-12 md:space-y-10">
            {sectionShell(
              "description",
              "Описание",
              descriptionHtml ? (
                descOpen ? (
                  <div
                    className="prose prose-sm max-w-none md:prose-base"
                    style={{ color: "var(--text-muted)" }}
                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                  />
                ) : (
                  <p className="line-clamp-2 text-sm leading-relaxed md:text-[15px]" style={{ color: "var(--text-muted)" }}>
                    {plainDescription}
                  </p>
                )
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Описание объекта скоро появится.
                </p>
              ),
              descriptionHtml && plainDescription.length > 90 ? (
                <button
                  type="button"
                  onClick={() => setDescOpen((v) => !v)}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 text-[var(--accent)] transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
                  aria-expanded={descOpen}
                  aria-label={descOpen ? "Свернуть описание" : "Развернуть описание"}
                >
                  <ChevronDown className={cn("h-5 w-5 transition-transform", descOpen && "rotate-180")} aria-hidden />
                </button>
              ) : null,
            )}

            {sectionShell(
              "plans",
              "Планировки",
              plans.length > 0 ? (
                <div className={cn("grid gap-4", plans.length > 1 ? "md:grid-cols-2" : "max-w-2xl")}>
                  {plans.map((plan, index) => (
                    <figure
                      key={plan.id}
                      className="group relative overflow-hidden rounded-2xl border bg-[var(--bg)]"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="relative aspect-[4/3] min-h-[240px] sm:min-h-[280px] md:min-h-[320px]">
                        <CmsImage
                          src={plan.url}
                          alt={plan.label || `План ${index + 1}`}
                          fill
                          className="object-contain p-3"
                          sizes="(max-width: 768px) 100vw, 480px"
                        />
                        <button
                          type="button"
                          onClick={() => openLightbox(plans.map((p) => p.url), index)}
                          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                          aria-label="Увеличить планировку"
                        >
                          <Maximize2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <figcaption className="border-t px-4 py-3 text-sm font-semibold" style={{ borderColor: "var(--border)" }}>
                        {plan.label?.trim() || (index === 0 ? "План 1-го этажа" : `План ${index + 1}-го этажа`)}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Планировки скоро появятся.
                </p>
              ),
            )}

            {sectionShell(
              "construction-photos",
              "Фото строительства",
              constructionPhotos.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-2.5">
                    {visiblePhotos.map((photo, index) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() =>
                          openLightbox(
                            (showAllPhotos ? constructionPhotos : constructionPhotos.slice(0, CONSTRUCTION_GRID_LIMIT)).map(
                              (p) => p.url,
                            ),
                            index,
                          )
                        }
                        className="relative aspect-square overflow-hidden rounded-lg bg-[var(--stone)] ring-1 ring-[color-mix(in_srgb,var(--text)_6%,transparent)] transition hover:ring-[var(--accent)]"
                      >
                        <CmsImage
                          src={photo.url}
                          alt={photo.alt || photo.label || "Фото строительства"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 20vw"
                        />
                      </button>
                    ))}
                  </div>
                  {constructionPhotos.length > CONSTRUCTION_GRID_LIMIT && !showAllPhotos ? (
                    <button
                      type="button"
                      onClick={() => setShowAllPhotos(true)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <Expand className="h-4 w-4" aria-hidden />
                      Смотреть все ({constructionPhotos.length})
                    </button>
                  ) : null}
                </>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Фото хода строительства скоро появятся.
                </p>
              ),
            )}

            {sectionShell(
              "history",
              "История строительства",
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {historyCards.map((card) => (
                  <article
                    key={card.id}
                    className="w-[min(100%,280px)] shrink-0 snap-start rounded-2xl border p-4"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[var(--accent-contrast)]"
                        style={{ backgroundColor: "var(--accent)" }}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <h3 className="text-sm font-bold leading-snug">{card.title}</h3>
                    </div>
                    {card.description ? (
                      <p className="mt-3 text-[13px] leading-relaxed whitespace-pre-line" style={{ color: "var(--text-muted)" }}>
                        {card.description}
                      </p>
                    ) : null}
                    {card.imageUrls[0] ? (
                      <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl bg-[var(--stone)]">
                        <CmsImage
                          src={card.imageUrls[0]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="280px"
                        />
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>,
            )}

            {primaryVideo
              ? sectionShell(
                  "video",
                  "Видео о проекте",
                  <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-center">
                    <button
                      type="button"
                      onClick={() => window.open(primaryVideo.url, "_blank", "noopener,noreferrer")}
                      className="group relative aspect-video overflow-hidden rounded-2xl bg-black/80 ring-1 ring-[color-mix(in_srgb,var(--text)_8%,transparent)]"
                    >
                      {hero ? (
                        <CmsImage src={hero.url} alt="" fill className="object-cover opacity-80 transition group-hover:opacity-90" sizes="560px" />
                      ) : null}
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-[var(--accent)] shadow-lg">
                          <Play className="ml-0.5 h-6 w-6 fill-current" aria-hidden />
                        </span>
                      </span>
                    </button>
                    <div>
                      <h3 className="font-heading text-lg font-bold md:text-xl">
                        {primaryVideo.label?.trim() || `Видеообзор дома «${object.title}»`}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        Короткий обзор готового объекта: этапы, детали и результат строительства.
                      </p>
                      <a
                        href={primaryVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-[var(--accent-contrast)] transition hover:opacity-95"
                        style={{ backgroundColor: "var(--accent)" }}
                      >
                        Смотреть видео
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </a>
                    </div>
                  </div>,
                )
              : null}
          </div>
        </div>
      </article>
    </>
  );
}
