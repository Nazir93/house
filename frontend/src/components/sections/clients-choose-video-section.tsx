"use client";

import type { CSSProperties, Ref } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getClientsChooseScrollState,
  resolveClientsChooseSlideVisual,
  resolveClientsChooseVideoProgress,
} from "@/lib/clients-choose-scroll-state";

/** Высота скролл-трека на один пункт услуги (vh). */
const SCROLL_VH_PER_ITEM_MOBILE = 72;
const SCROLL_VH_PER_ITEM_DESKTOP = 100;

const SERVICES_VIDEO_SRC = "/videos/14654251600401.mp4";

function warmUpVideo(v: HTMLVideoElement) {
  if ((v as unknown as { _warmedUp?: boolean })._warmedUp) return;
  (v as unknown as { _warmedUp?: boolean })._warmedUp = true;
  const p = v.play();
  if (p) p.then(() => v.pause()).catch(() => {});
}

const SERVICES = [
  {
    title: "Проект",
    href: "/services/proektirovanie" as const,
    description: "Архитектурное и планировочное решение, адаптированное под участок и задачи семьи.",
  },
  {
    title: "Фундамент",
    href: "/services/fundament" as const,
    description: "Надёжное основание под тип грунта и проект вашего дома.",
  },
  {
    title: "Кровля",
    href: "/services/krovlya" as const,
    description: "Теплая и герметичная кровельная система с правильными узлами.",
  },
  {
    title: "Коммуникации",
    href: "/services/inzheneriya" as const,
    description: "Вода, канализация, электричество и инженерия, готовые к эксплуатации.",
  },
  {
    title: "Отделка",
    href: "/services/otdelka" as const,
    description: "Чистовая отделка под ключ с аккуратной реализацией каждого этапа.",
  },
] as const;

function VideoPanel({ videoRef }: { videoRef: Ref<HTMLVideoElement> }) {
  return (
    <div className="relative w-full">
      <div
        className="pointer-events-none absolute -inset-3 rounded-[2rem] opacity-60 md:-inset-5 md:rounded-[2.5rem]"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-[1.5rem] shadow-[0_24px_64px_rgb(var(--accent-rgb)/0.12)] md:rounded-[2rem]">
        <div className="relative aspect-[4/3] min-h-[min(52vw,320px)] w-full overflow-hidden rounded-[inherit] sm:min-h-[340px] md:aspect-[3/4] md:min-h-[420px] lg:min-h-[480px]">
          <video
            ref={videoRef}
            src={SERVICES_VIDEO_SRC}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ pointerEvents: "none" }}
            aria-hidden="true"
          />
        </div>
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
    <div className={cn("flex items-center gap-2", className)} aria-hidden>
      {SERVICES.map((_, i) => {
        const fill = Math.max(0, Math.min(scrollProgress * SERVICES.length - i, 1));
        return (
          <div
            key={i}
            className="h-1 flex-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--text)_8%,transparent)] md:h-1.5"
          >
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-200 ease-linear"
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
      <div className="mb-5 flex items-end justify-between gap-4 md:mb-8">
        <p
          className="font-heading text-[clamp(3.5rem,14vw,6.5rem)] font-bold leading-[0.85] tabular-nums tracking-[-0.04em]"
          style={{ color: "color-mix(in srgb, var(--accent) 22%, var(--text))" }}
          aria-hidden
        >
          {String(displayNumber).padStart(2, "0")}
        </p>
        <p className="pb-1 text-right text-[11px] font-semibold tabular-nums tracking-[0.2em] text-[var(--text-muted)] md:text-xs">
          <span className="text-[var(--text)]">{String(displayNumber).padStart(2, "0")}</span>
          <span className="mx-1.5 opacity-40">/</span>
          {String(SERVICES.length).padStart(2, "0")}
        </p>
      </div>

      <div className="relative min-h-[8.5rem] overflow-hidden md:min-h-[11rem] lg:min-h-[12rem]">
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
              <h3 className="font-heading text-[clamp(1.75rem,5.5vw,3.25rem)] font-bold leading-[1.05] tracking-[-0.03em] text-[var(--text)]">
                <Link
                  href={item.href}
                  className="inline-block rounded-sm underline-offset-[6px] transition-colors hover:text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                  tabIndex={visual.visible ? 0 : -1}
                >
                  {item.title}
                </Link>
              </h3>
              <p className="mt-4 max-w-[36ch] text-[15px] leading-[1.55] text-[var(--text-muted)] md:mt-5 md:text-lg md:leading-relaxed lg:max-w-[42ch]">
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
    setActiveIndex((prev) => {
      if (prev !== baseIndex) lastSeekRef.current = NaN;
      return prev === baseIndex ? prev : baseIndex;
    });

    const video = videoRef.current;
    if (!video) return;
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
  }, []);

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
  }, [syncScrollToServices]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative touch-pan-y scroll-mt-[var(--site-header-sticky-offset)]",
        "h-[calc(var(--clients-choose-scroll-vh-mobile)*1vh*var(--clients-choose-count))]",
        "md:h-[calc(var(--clients-choose-scroll-vh-desktop)*1vh*var(--clients-choose-count))]",
      )}
      style={
        {
          "--clients-choose-count": SERVICES.length,
          "--clients-choose-scroll-vh-mobile": SCROLL_VH_PER_ITEM_MOBILE,
          "--clients-choose-scroll-vh-desktop": SCROLL_VH_PER_ITEM_DESKTOP,
          backgroundColor: "var(--bg-secondary)",
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
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[1440px] flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-10 xl:gap-16 xl:px-14">
          <div className="order-2 flex min-h-0 min-w-0 flex-1 flex-col justify-center px-5 pb-8 pt-5 sm:px-8 md:px-10 lg:order-1 lg:max-w-[52%] lg:px-0 lg:py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)] md:text-xs">
              Что мы делаем
            </p>
            <h2
              id="clients-choose-video-heading"
              className="mt-2 text-balance font-heading text-[clamp(1.75rem,5vw,3rem)] font-bold leading-[1.08] tracking-[-0.03em] text-[var(--text)] md:mt-3"
            >
              Наши услуги
            </h2>

            <ServiceSlideStack scrollProgress={scrollProgress} className="mt-6 md:mt-10" />

            <div className="mt-8 md:mt-12">
              <Link
                href="/services"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-[var(--accent-contrast)] transition hover:opacity-95 md:min-h-[52px] md:px-8 md:text-base"
              >
                Все услуги
                <ArrowUpRight className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
              </Link>
            </div>
          </div>

          <div className="order-1 shrink-0 px-5 pb-4 pt-2 sm:px-8 md:px-10 lg:order-2 lg:flex-none lg:w-[44%] lg:px-0 lg:pb-8 lg:pt-0 lg:py-10 xl:w-[42%]">
            <div className="mx-auto w-full lg:max-w-[560px]">
              <VideoPanel videoRef={videoRef} />
              <ServiceProgressBars scrollProgress={scrollProgress} className="mt-4 md:mt-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
