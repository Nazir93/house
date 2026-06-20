"use client";

import type { CSSProperties, Ref } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { CLIENTS_CHOOSE_SERVICES } from "@/lib/clients-choose-services";
import {
  getClientsChooseScrollState,
  resolveClientsChooseSlideVisual,
  resolveClientsChooseVideoProgress,
} from "@/lib/clients-choose-scroll-state";

/** Высота скролл-трека на один пункт услуги (vh). */
const SCROLL_VH_PER_ITEM_MOBILE = 72;
const SCROLL_VH_PER_ITEM_DESKTOP = 100;

const SERVICES_VIDEO_SRC = "/videos/14654251600401.mp4";

const SERVICES = CLIENTS_CHOOSE_SERVICES;

function warmUpVideo(v: HTMLVideoElement) {
  if ((v as unknown as { _warmedUp?: boolean })._warmedUp) return;
  (v as unknown as { _warmedUp?: boolean })._warmedUp = true;
  const p = v.play();
  if (p) p.then(() => v.pause()).catch(() => {});
}

function ServicesScrollCue({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div
      className="flex flex-col items-center justify-center gap-2 px-2 py-3 md:px-3 md:py-0"
      aria-hidden
    >
      <div
        className="services-scroll-cue-wheel flex h-11 w-7 items-start justify-center rounded-full border pt-1.5"
        style={{
          borderColor: "color-mix(in srgb, var(--text-muted) 45%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--bg-secondary) 65%, var(--bg))",
        }}
      >
        <span className="services-scroll-cue-dot h-1.5 w-1 rounded-full bg-[var(--accent)]" />
      </div>
      <p className="max-w-[5.5rem] text-center text-[9px] font-bold uppercase leading-tight tracking-[0.14em] text-[var(--text-muted)] md:max-w-none md:text-[10px]">
        Прокрутите
      </p>
    </div>
  );
}

function VideoPanel({
  videoRef,
  enabled,
}: {
  videoRef: Ref<HTMLVideoElement>;
  enabled: boolean;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-[22px] shadow-[0_20px_56px_rgba(0,0,0,0.08)] md:rounded-[30px]">
      <div className="relative aspect-[16/10] max-h-[min(46vh,320px)] w-full overflow-hidden rounded-[inherit] md:aspect-[4/3] md:max-h-[min(52vh,480px)] lg:max-h-none">
        <video
          ref={videoRef}
          src={enabled ? SERVICES_VIDEO_SRC : undefined}
          muted
          playsInline
          preload={enabled ? "metadata" : "none"}
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ pointerEvents: "none" }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function ServiceProgressBars({
  scrollProgress,
  className,
}: {
  scrollProgress: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5 md:gap-2", className)} aria-hidden>
      {SERVICES.map((_, i) => {
        const fill = Math.max(0, Math.min(scrollProgress * SERVICES.length - i, 1));
        return (
          <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]/65 md:h-1">
            <div
              className="h-full bg-[var(--accent)] transition-[width] duration-200 ease-linear"
              style={{ width: `${fill * 100}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function ServiceSlideStack({
  scrollProgress,
  className,
}: {
  scrollProgress: number;
  className?: string;
}) {
  const { baseIndex, localProgress, displayNumber } = getClientsChooseScrollState(
    scrollProgress,
    SERVICES.length,
  );

  return (
    <div className={cn("relative", className)} aria-live="polite">
      <p className="mb-4 text-xs font-semibold tabular-nums tracking-[0.18em] text-[var(--text-muted)] md:text-sm">
        {String(displayNumber).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
      </p>

      <div className="relative min-h-[6.25rem] overflow-hidden md:min-h-[10.5rem] lg:min-h-[11.5rem]">
        {SERVICES.map((item, idx) => {
          const visual = resolveClientsChooseSlideVisual(idx, baseIndex, localProgress, SERVICES.length);

          return (
            <div
              key={item.title}
              className="absolute inset-x-0 top-0 will-change-[opacity,transform]"
              style={{
                opacity: visual.opacity,
                transform: `translateY(${visual.translateY}px)`,
                pointerEvents: visual.visible ? "auto" : "none",
                visibility: visual.visible ? "visible" : "hidden",
                zIndex: visual.zIndex,
              }}
              aria-hidden={!visual.visible}
            >
              <p className="border-l-[3px] border-[var(--accent)] pl-4 font-heading text-[clamp(1.45rem,3.2vw,2.35rem)] font-bold uppercase leading-[1.08] tracking-[-0.02em] text-[var(--text)] md:border-l-[4px] md:pl-6 md:text-[clamp(1.65rem,2.6vw,2.65rem)]">
                <Link
                  href={item.href}
                  className="rounded-sm underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  tabIndex={visual.visible ? 0 : -1}
                >
                  {item.title}
                </Link>
              </p>
              <p className="mt-3 max-w-xl pl-[calc(1rem+3px)] text-[15px] leading-relaxed text-[var(--text-muted)] md:mt-4 md:pl-[calc(1.5rem+4px)] md:text-base lg:text-[17px] lg:leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ClientsChooseVideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSeekRef = useRef<number>(NaN);
  const [, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);

  const syncScrollToServices = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const viewportH = window.visualViewport?.height ?? window.innerHeight;
    const scrolled = -rect.top;
    const scrollRange = Math.max(sectionHeight - viewportH, 1);
    const progress = Math.max(0, Math.min(scrolled / scrollRange, 1));
    const { baseIndex } = getClientsChooseScrollState(progress, SERVICES.length);
    setScrollProgress(progress);
    if (progress > 0.04) setHasScrolled(true);
    setActiveIndex((prev) => {
      if (prev !== baseIndex) lastSeekRef.current = NaN;
      return prev === baseIndex ? prev : baseIndex;
    });

    const video = videoRef.current;
    if (!video || !videoEnabled) return;
    if (!video.duration || Number.isNaN(video.duration) || !Number.isFinite(video.duration)) {
      warmUpVideo(video);
      return;
    }

    const videoNorm = resolveClientsChooseVideoProgress(progress, SERVICES.length);
    let t = videoNorm * video.duration;
    try {
      const sb = video.seekable;
      if (sb && sb.length > 0) {
        const end = sb.end(sb.length - 1);
        if (Number.isFinite(end) && end > 0) t = Math.min(t, Math.max(0, end - 0.04));
      }
    } catch {
      /* ignore */
    }

    try {
      video.pause();
      if (!Number.isFinite(lastSeekRef.current) || Math.abs(t - lastSeekRef.current) >= 0.03) {
        video.currentTime = t;
        lastSeekRef.current = t;
      }
    } catch {
      /* ignore */
    }
  }, [videoEnabled]);

  useEffect(() => {
    const onScroll = () => syncScrollToServices();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.visualViewport?.addEventListener("resize", onScroll, { passive: true } as AddEventListenerOptions);

    let offLenis: (() => void) | undefined;
    const attachLenis = () => {
      const L = typeof window !== "undefined" ? window.__lenis : undefined;
      if (L && !offLenis) offLenis = L.on("scroll", onScroll);
    };
    attachLenis();
    const poll = window.setInterval(() => {
      attachLenis();
      if (offLenis) window.clearInterval(poll);
    }, 80);
    const stopPoll = window.setTimeout(() => window.clearInterval(poll), 4000);

    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      offLenis?.();
      window.clearInterval(poll);
      window.clearTimeout(stopPoll);
    };
  }, [syncScrollToServices]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    let active = false;

    const tick = () => {
      if (!active) return;
      syncScrollToServices();
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting;
        if (next) setVideoEnabled(true);
        if (next && !active) {
          active = true;
          syncScrollToServices();
          raf = requestAnimationFrame(tick);
        } else if (!next && active) {
          active = false;
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { root: null, rootMargin: "40% 0px", threshold: 0 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [syncScrollToServices]);

  useEffect(() => {
    if (!videoEnabled) return;
    const video = videoRef.current;
    if (!video) return;
    const onReady = () => syncScrollToServices();
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("canplay", onReady);
    video.load();
    return () => {
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("canplay", onReady);
    };
  }, [videoEnabled, syncScrollToServices]);

  const showScrollCue = !hasScrolled;

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative touch-pan-y scroll-mt-[var(--site-header-sticky-offset)] border-t border-[var(--border)]",
        "h-[calc(var(--clients-choose-scroll-vh-mobile)*1vh*var(--clients-choose-count))]",
        "md:h-[calc(var(--clients-choose-scroll-vh-desktop)*1vh*var(--clients-choose-count))]",
      )}
      style={
        {
          "--clients-choose-count": SERVICES.length,
          "--clients-choose-scroll-vh-mobile": SCROLL_VH_PER_ITEM_MOBILE,
          "--clients-choose-scroll-vh-desktop": SCROLL_VH_PER_ITEM_DESKTOP,
          backgroundColor: "var(--bg)",
        } as CSSProperties
      }
      aria-labelledby="clients-choose-video-heading"
    >
      <div
        className={cn(
          "sticky z-10 overflow-hidden",
          "top-[var(--site-header-sticky-offset)]",
          "h-[calc(100dvh-var(--site-header-sticky-offset))]",
        )}
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="mx-auto grid h-full min-h-0 w-full max-w-[1380px] grid-cols-1 content-center gap-y-1 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-x-6 md:px-8 lg:gap-x-10 lg:px-12">
          <div className="order-2 flex min-h-0 min-w-0 flex-col justify-center md:order-1 md:max-w-[560px] md:px-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] md:text-[13px]">
              Что мы делаем
            </p>
            <h2
              id="clients-choose-video-heading"
              className="mt-2 text-balance font-heading text-[clamp(1.35rem,4vw,2.2rem)] font-bold uppercase leading-[1.14] tracking-[-0.02em] text-[var(--text)] md:mt-3 md:text-[clamp(1.65rem,2.8vw,2.55rem)]"
            >
              Наши услуги
            </h2>

            <ServiceSlideStack scrollProgress={scrollProgress} className="mt-5 md:mt-8" />

            <div className="mt-6 md:mt-10">
              <Link
                href="/services"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--text)] underline-offset-4 transition hover:text-[var(--accent)] hover:underline sm:text-[15px]"
              >
                Все услуги
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>

          <div className="order-3 flex justify-center md:order-2">
            <ServicesScrollCue visible={showScrollCue} />
          </div>

          <div className="order-1 shrink-0 md:order-3 md:px-0">
            <div className="mx-auto w-full max-w-[680px] md:max-w-[620px] lg:max-w-[680px]">
              <VideoPanel videoRef={videoRef} enabled={videoEnabled} />
              <ServiceProgressBars scrollProgress={scrollProgress} className="mt-3 md:mt-4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
