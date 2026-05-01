"use client";

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getHeroGeoSubtitle, SERVICES, SITE_NAME } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";
import type { ServiceItem } from "@/lib/get-services";
import { resolveServiceCardMedia, serviceCardHasVisualMedia } from "@/lib/service-card-media";

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

/** Один ряд: подбираем font-size, пока слово помещается в ширину контейнера. */
function fitHeadingOneLine(box: HTMLElement, title: HTMLElement, maxPx: number, minPx: number) {
  const w = box.clientWidth;
  if (w <= 0) return;
  title.style.whiteSpace = "nowrap";
  let lo = minPx;
  let hi = maxPx;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    title.style.fontSize = `${mid}px`;
    if (title.scrollWidth <= w) lo = mid;
    else hi = mid;
  }
  title.style.fontSize = `${lo}px`;
}

function ServiceCard({
  title,
  slug,
  opacity,
  scale,
  borderRadius,
  coverImage,
  videoUrl,
  shortDescription,
  imagePriority,
}: {
  title: string;
  slug: string;
  opacity: number;
  scale: number;
  borderRadius: number;
  coverImage?: string | null;
  videoUrl?: string | null;
  shortDescription?: string;
  /** LCP: первый боковой кадр при открытии главной */
  imagePriority?: boolean;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [loadVideo, setLoadVideo] = useState(false);

  /** Сразу после layout: если карточка уже в зоне (как IO с rootMargin 200px), не ждём следующего кадра — видео стартует раньше. */
  useLayoutEffect(() => {
    if (!videoUrl || loadVideo) return;
    const el = cardRef.current;
    if (!el) return;

    const margin = 200;
    const inExpandedViewport = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      return r.bottom >= -margin && r.top <= vh + margin;
    };

    if (inExpandedViewport()) {
      setLoadVideo(true);
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoadVideo(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [videoUrl, loadVideo]);

  return (
    <Link
      ref={cardRef}
      href={slug}
      className="group relative flex h-full w-full flex-col items-center justify-end overflow-hidden px-1 pb-3 pt-14 transition-colors duration-300"
      style={{
        opacity,
        transform: `scale(${scale})`,
        borderRadius: `${borderRadius}px`,
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      {videoUrl ? (
        <video
          src={loadVideo ? videoUrl : undefined}
          autoPlay
          loop
          muted
          playsInline
          preload={loadVideo ? (imagePriority ? "auto" : "metadata") : "none"}
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      ) : coverImage ? (
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="absolute inset-0 z-0 object-cover"
          loading={imagePriority ? "eager" : "lazy"}
          priority={imagePriority}
        />
      ) : null}

      {/* Градиент снизу: фото сверху светлое, подпись всегда на затемнении */}
      {(videoUrl || coverImage) && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-transparent from-[15%] via-black/25 via-[45%] to-black/75 transition-[background] duration-300 group-hover:via-black/35 group-hover:to-black/88"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-black/0 transition-colors duration-300 group-hover:bg-black/22"
            aria-hidden
          />
        </>
      )}

      {/* Title — компактно на фото, 2 строки макс. */}
      <span
        className="relative z-10 max-w-[96%] px-2 text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.08em] text-white line-clamp-2 transition-all duration-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_20px_rgba(0,0,0,0.7),0_2px_10px_rgba(0,0,0,0.55)] sm:px-3 sm:text-[10px] group-hover:-translate-y-1 group-hover:text-[var(--accent)] group-hover:[text-shadow:0_1px_3px_rgba(0,0,0,0.9),0_0_28px_rgba(15,61,46,0.45)] lg:max-w-[94%] lg:text-[11px]"
      >
        {title}
      </span>

      {/* Hover description */}
      {shortDescription && (
        <span
          className="relative z-10 mt-1.5 max-w-[90%] translate-y-2 px-3 text-center text-[8px] leading-relaxed text-white/95 opacity-0 transition-all duration-300 line-clamp-3 [text-shadow:0_1px_3px_rgba(0,0,0,0.9),0_2px_10px_rgba(0,0,0,0.55)] group-hover:translate-y-0 group-hover:opacity-100 lg:text-[9px]"
        >
          {shortDescription}
        </span>
      )}

      {/* Arrow on hover */}
      <div
        className="absolute bottom-3 right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/0 opacity-0 transition-all duration-300 group-hover:border-white/35 group-hover:bg-black/25 group-hover:opacity-100"
      >
        <ArrowRight size={10} className="text-white/90" />
      </div>
    </Link>
  );
}

/* ── Mobile service link ── */
function MobileServiceLink({ title, slug }: { title: string; slug: string }) {
  return (
    <Link
      href={slug}
      className="flex items-center justify-between py-4 border-b group"
      style={{ borderColor: "var(--border)" }}
    >
      <span
        className="text-sm uppercase tracking-[0.08em] transition-colors duration-200 group-hover:text-[var(--accent)]"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </span>
      <ArrowRight size={14} style={{ color: "var(--text-subtle)" }} />
    </Link>
  );
}

export function HeroSection({ services: propServices }: { services?: ServiceItem[] } = {}) {
  const contact = useContactConfig();
  const services = propServices && propServices.length > 0 ? propServices : SERVICES;
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [heroServicesCtaHovered, setHeroServicesCtaHovered] = useState(false);
  const rafRef = useRef<number>(0);
  const desktopTitleBoxRef = useRef<HTMLDivElement>(null);
  const desktopTitleRef = useRef<HTMLHeadingElement>(null);
  const mobileTitleBoxRef = useRef<HTMLDivElement>(null);
  const mobileTitleRef = useRef<HTMLHeadingElement>(null);

  const fitDesktopElectromontazh = useCallback(() => {
    const box = desktopTitleBoxRef.current;
    const title = desktopTitleRef.current;
    if (!box || !title) return;
    fitHeadingOneLine(box, title, 120, 14);
  }, []);

  const fitMobileElectromontazh = useCallback(() => {
    const box = mobileTitleBoxRef.current;
    const title = mobileTitleRef.current;
    if (!box || !title) return;
    fitHeadingOneLine(box, title, 60, 16);
  }, []);

  // Не зависеть от progress: иначе при каждом тике скролла пересоздаётся ResizeObserver → фризы.
  useLayoutEffect(() => {
    let raf = 0;
    const scheduleFit = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        fitDesktopElectromontazh();
      });
    };
    fitDesktopElectromontazh();
    const el = desktopTitleBoxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(scheduleFit);
    ro.observe(el);
    void document.fonts.ready.then(scheduleFit);
    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [fitDesktopElectromontazh]);

  useLayoutEffect(() => {
    let raf = 0;
    const scheduleFit = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        fitMobileElectromontazh();
      });
    };
    fitMobileElectromontazh();
    const el = mobileTitleBoxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(scheduleFit);
    ro.observe(el);
    void document.fonts.ready.then(scheduleFit);
    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [fitMobileElectromontazh]);

  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const viewportH = window.innerHeight;
      const scrolled = -rect.top;
      const scrollRange = sectionHeight - viewportH;
      const p = clamp(scrolled / scrollRange, 0, 1);
      setProgress(p);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  useEffect(() => {
    let raf = 0;
    let pending: { x: number; y: number } | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      pending = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (pending) setMouse(pending);
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const scale = 1 - progress * 0.15;
  const borderRadius = progress * 24;
  const gap = progress * 16;
  const sideOpacity = clamp(progress * 2.5 - 0.5, 0, 1);
  const sideScale = 0.85 + sideOpacity * 0.15;
  const textScale = 1 - progress * 0.2;

  return (
    <>
      {/* Desktop: scroll-driven grid animation */}
      <section
        ref={sectionRef}
        className="relative hidden md:block"
        style={{ height: "250vh", backgroundColor: "var(--bg)" }}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            className="h-full flex flex-col"
            style={{ padding: `${gap}px`, gap: `${gap}px` }}
          >
            {/* Top row: service1 | HERO | service2 */}
            <div className="flex min-h-0 min-w-0 flex-1" style={{ gap: `${gap}px` }}>
              <div style={{ flex: `0 0 ${progress * 20}%` }}>
                <ServiceCard
                  title={services[0].title}
                  slug={services[0].slug}
                  opacity={sideOpacity}
                  scale={sideScale}
                  borderRadius={borderRadius}
                  {...resolveServiceCardMedia(services[0])}
                  shortDescription={services[0].shortDescription}
                  imagePriority={serviceCardHasVisualMedia(services[0])}
                />
              </div>

              {/* Center — main hero */}
              <Link
                href="/services"
                className="relative flex min-h-0 min-w-0 flex-1 cursor-pointer flex-col overflow-hidden"
                style={{
                  borderRadius: `${borderRadius}px`,
                  transform: `scale(${scale})`,
                  backgroundColor: "var(--bg)",
                  boxShadow: progress > 0.1 ? "0 0 0 1px var(--border)" : "none",
                }}
              >
                {/* Ghost text */}
                <div
                  className="pointer-events-none absolute inset-0 flex select-none items-center justify-center"
                  style={{
                    transform: `translate(${mouse.x * -15}px, ${mouse.y * -10}px) scale(${textScale})`,
                    transition: "transform 0.3s ease-out",
                  }}
                >
                  <h2
                    className="font-heading text-[12vw] leading-[0.85] text-center whitespace-nowrap opacity-[0.03]"
                    style={{ color: "var(--text)" }}
                  >
                    {(() => {
                      const u = SITE_NAME.toUpperCase().split(/\s+/).filter(Boolean);
                      return u.length >= 2 ? (
                        <>
                          {u[0]}
                          <br />
                          {u.slice(1).join(" ")}
                        </>
                      ) : (
                        SITE_NAME.toUpperCase()
                      );
                    })()}
                  </h2>
                </div>

                {/* Текст по центру: сначала «под ключ», затем заголовок, затем проектирование… */}
                <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col justify-center px-6 sm:px-10 lg:px-14">
                  <div
                    className="container mx-auto w-full min-w-0 max-w-5xl"
                    style={{
                      containerType: "inline-size",
                      transform: `translate(${mouse.x * 8}px, ${mouse.y * 5}px) scale(${textScale})`,
                      transition: "transform 0.2s ease-out",
                      transformOrigin: "center center",
                    }}
                  >
                    <p
                      className="mb-3 max-w-full text-[clamp(11px,1.25vw,18px)] font-light uppercase tracking-[0.22em]"
                      style={{ color: "var(--accent)" }}
                    >
                      Полный цикл работ под ключ
                    </p>
                    <div ref={desktopTitleBoxRef} className="w-full min-w-0">
                      <h1
                        ref={desktopTitleRef}
                        className="font-heading max-w-full whitespace-nowrap leading-[0.9] tracking-tight"
                        style={{ color: "var(--text)" }}
                      >
                        ДОМА ПОД КЛЮЧ
                      </h1>
                    </div>
                    <p
                      className="mt-5 max-w-3xl text-[clamp(10px,1.05vw,14px)] uppercase leading-relaxed tracking-[0.28em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {getHeroGeoSubtitle()}
                    </p>
                  </div>
                </div>

                {/* Контакты + широкая кнопка «Услуги» как на баннере */}
                <div
                  className="relative z-10 flex w-full shrink-0 flex-col gap-4 px-[7%] pb-10 pt-2 lg:pb-12 lg:pr-[max(3%,5rem)]"
                  style={{
                    transform: `scale(${textScale})`,
                    transformOrigin: "center bottom",
                  }}
                >
                  <div
                    className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-[11px] sm:text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span className="whitespace-nowrap">{contact.email}</span>
                    <span style={{ color: "var(--text-subtle)" }}>/</span>
                    <span className="whitespace-nowrap">{contact.phone2}</span>
                  </div>

                  <div
                    className="relative flex min-h-[48px] w-full min-w-0 cursor-pointer items-center justify-center overflow-hidden px-6 py-2.5 transition-colors duration-700 sm:px-10 md:py-2.5"
                    style={{
                      border: `1px solid rgba(0,0,0,0.15)`,
                      borderRadius: "14px",
                      backgroundColor: "rgba(255,255,255,0.92)",
                      boxShadow:
                        "2px 0 12px rgba(255,255,255,0.7), 4px 0 24px rgba(255,255,255,0.4)",
                    }}
                    onMouseEnter={() => setHeroServicesCtaHovered(true)}
                    onMouseLeave={() => setHeroServicesCtaHovered(false)}
                  >
                    <div
                      className="absolute inset-0 origin-left transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
                      style={{
                        backgroundColor: "rgba(15,61,46,0.98)",
                        transform: heroServicesCtaHovered ? "scaleX(1)" : "scaleX(0)",
                      }}
                    />
                    <span
                      className="relative z-10 block w-full min-w-0 pl-2 pr-10 text-center font-heading text-xs uppercase leading-tight tracking-[0.1em] transition-colors duration-700 sm:pr-12 sm:text-sm md:text-[clamp(13px,1.05vw,15px)]"
                      style={{
                        color: "var(--accent-contrast)",
                      }}
                    >
                      Услуги
                    </span>
                    <ArrowRight
                      size={18}
                      className="pointer-events-none absolute right-3 top-1/2 z-10 shrink-0 -translate-y-1/2 transition-colors duration-700 sm:right-4 md:right-5"
                      style={{
                        color: "var(--accent-contrast)",
                      }}
                    />
                  </div>
                </div>
              </Link>

              <div style={{ flex: `0 0 ${progress * 22}%` }}>
                <ServiceCard
                  title={services[1].title}
                  slug={services[1].slug}
                  opacity={sideOpacity}
                  scale={sideScale}
                  borderRadius={borderRadius}
                  {...resolveServiceCardMedia(services[1])}
                  shortDescription={services[1].shortDescription}
                />
              </div>
            </div>

            {/* Bottom row: 3 services */}
            <div
              className="flex min-h-0"
              style={{
                flex: `0 0 ${progress * 35}%`,
                gap: `${gap}px`,
                opacity: sideOpacity,
              }}
            >
              {services.slice(2).map((s) => (
                <div key={s.id} className="flex-1 flex">
                  <ServiceCard
                    title={s.title}
                    slug={s.slug}
                    opacity={sideOpacity}
                    scale={sideScale}
                    borderRadius={borderRadius}
                    {...resolveServiceCardMedia(s)}
                    shortDescription={s.shortDescription}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile: static hero + service links */}
      <section
        className="md:hidden relative overflow-hidden"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {/* Hero content */}
        <div className="relative flex min-h-[70vh] min-w-0 flex-col justify-center px-5 py-12 sm:px-8">
          {/* Ghost text */}
          <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center">
            <h2
              className="font-heading text-[28vw] leading-[0.85] text-center whitespace-nowrap opacity-[0.03]"
              style={{ color: "var(--text)" }}
            >
              {(() => {
                const u = SITE_NAME.toUpperCase().split(/\s+/).filter(Boolean);
                return u.length >= 2 ? (
                  <>
                    {u[0]}
                    <br />
                    {u.slice(1).join(" ")}
                  </>
                ) : (
                  SITE_NAME.toUpperCase()
                );
              })()}
            </h2>
          </div>

          <div className="relative z-10 w-full min-w-0" style={{ containerType: "inline-size" }}>
            <Link href="/services" className="block min-w-0 max-w-full">
              <p
                className="mb-2 text-[10px] sm:text-[11px] uppercase tracking-[0.22em]"
                style={{ color: "var(--accent)" }}
              >
                Полный цикл работ под ключ
              </p>
              <div ref={mobileTitleBoxRef} className="w-full min-w-0">
                <h1
                  ref={mobileTitleRef}
                  className="font-heading max-w-full whitespace-nowrap leading-[0.92] tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  ДОМА ПОД КЛЮЧ
                </h1>
              </div>
              <p
                className="mt-4 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {getHeroGeoSubtitle()}
              </p>
            </Link>
            <div className="mt-8 flex flex-col gap-4">
              <div
                className="flex flex-col gap-1.5 text-[10px] sm:text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="break-all">{contact.email}</span>
                <span>{contact.phone2}</span>
              </div>
              <Link
                href="/services"
                className="relative flex min-h-[48px] w-full items-center justify-center overflow-hidden px-6 py-2.5 transition-colors duration-700 active:scale-[0.99]"
                style={{
                  border: `1px solid rgba(0,0,0,0.15)`,
                  borderRadius: "14px",
                  backgroundColor: "rgba(255,255,255,0.92)",
                  boxShadow:
                    "2px 0 12px rgba(255,255,255,0.7), 4px 0 24px rgba(255,255,255,0.4)",
                }}
                onMouseEnter={() => setHeroServicesCtaHovered(true)}
                onMouseLeave={() => setHeroServicesCtaHovered(false)}
              >
                <div
                  className="absolute inset-0 origin-left transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
                  style={{
                    backgroundColor: "rgba(15,61,46,0.98)",
                    transform: heroServicesCtaHovered ? "scaleX(1)" : "scaleX(0)",
                  }}
                />
                <span
                  className="relative z-10 block w-full min-w-0 pl-2 pr-10 text-center font-heading text-xs uppercase tracking-[0.1em]"
                  style={{
                        color: "var(--accent-contrast)",
                  }}
                >
                  Услуги
                </span>
                <ArrowRight
                  size={18}
                  className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2"
                  style={{
                        color: "var(--accent-contrast)",
                  }}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile services list */}
        <div className="px-5 sm:px-8 pb-8">
          <p
            className="text-[9px] uppercase tracking-[0.25em] mb-4"
            style={{ color: "var(--text-subtle)" }}
          >
            Наши услуги
          </p>
          <div className="border-t" style={{ borderColor: "var(--border)" }}>
            {services.map((service) => (
              <MobileServiceLink
                key={service.id}
                title={service.title}
                slug={service.slug}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
