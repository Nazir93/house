"use client";

import type { CSSProperties, Ref } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

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
    description: "Надежное основание под тип грунта и проект вашего дома.",
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
    <div className="relative w-full overflow-hidden rounded-[22px] shadow-[0_20px_56px_rgba(0,0,0,0.08)] md:rounded-[30px]">
      <div className="relative aspect-[16/10] max-h-[min(38vh,260px)] w-full overflow-hidden rounded-[inherit] md:aspect-[4/3] md:max-h-none">
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

export function ClientsChooseVideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastSeekRef = useRef<number>(NaN);
  const [activeIndex, setActiveIndex] = useState(0);
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
    const scaled = progress * SERVICES.length;
    const idx = Math.min(Math.floor(scaled), SERVICES.length - 1);
    setScrollProgress(progress);
    setActiveIndex((prev) => {
      if (prev !== idx) lastSeekRef.current = NaN;
      return prev === idx ? prev : idx;
    });

    const video = videoRef.current;
    if (!video) return;
    if (!video.duration || Number.isNaN(video.duration) || !Number.isFinite(video.duration)) {
      warmUpVideo(video);
      return;
    }

    let t = progress * video.duration;
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

  const activeService = SERVICES[activeIndex]!;

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
      {/*
        Видео закреплено под шапкой; скролл секции меняет кадр и активную услугу
        (мобильные, планшет и десктоп).
      */}
      <div
        className={cn(
          "sticky z-10 overflow-hidden",
          "top-[var(--site-header-sticky-offset)]",
          "h-[calc(100dvh-var(--site-header-sticky-offset))]",
        )}
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[1380px] flex-col md:flex-row md:items-center md:justify-between md:gap-8 md:px-8 lg:gap-10 lg:px-12">
          {/* Видео — сверху на телефоне/планшете, справа на lg+ */}
          <div className="shrink-0 px-4 pt-3 sm:px-6 md:order-2 md:flex-none md:w-[46%] md:px-0 md:pt-0">
            <div className="mx-auto w-full max-w-[640px] md:max-w-[560px]">
              <VideoPanel videoRef={videoRef} />
              <ServiceProgressBars scrollProgress={scrollProgress} className="mt-3 md:mt-4" />
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center px-4 pb-6 pt-4 sm:px-6 md:order-1 md:max-w-[560px] md:px-0 md:pb-0 md:pt-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] md:text-xs">
              Что мы делаем
            </p>
            <h2
              id="clients-choose-video-heading"
              className="mt-2 text-balance font-heading text-[clamp(1.25rem,3.8vw,2rem)] font-bold uppercase leading-[1.14] tracking-[-0.02em] text-[var(--text)] md:mt-3 md:text-[clamp(1.5rem,2.5vw,2.35rem)]"
            >
              Наши услуги
            </h2>

            {/* Мобильный / узкий планшет: одна активная услуга, меняется при скролле */}
            <div className="mt-5 min-h-[5.5rem] md:hidden" aria-live="polite">
              <p className="border-l-[3px] border-[var(--accent)] pl-4 text-[15px] font-semibold leading-snug text-[var(--text)]">
                <Link
                  href={activeService.href}
                  className="rounded-sm underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  {activeService.title}
                </Link>
              </p>
              <p className="mt-2 pl-[calc(1rem+3px)] text-[14px] leading-relaxed text-[var(--text-muted)]">
                {activeService.description}
              </p>
            </div>

            {/* Десктоп: полный список с подсветкой активного */}
            <div className="mt-6 hidden md:block">
              <ul className="max-w-xl space-y-4 text-pretty sm:space-y-5">
                {SERVICES.map((item, idx) => {
                  const on = idx === activeIndex;
                  return (
                    <li
                      key={item.title}
                      className={cn(
                        "border-l-[4px] pl-6 transition-all duration-500 ease-out",
                        on ? "border-[var(--accent)] opacity-100" : "border-[var(--border)] opacity-50",
                      )}
                    >
                      <p
                        className={cn(
                          "text-[1.05rem] font-semibold leading-snug transition-colors duration-500",
                          on ? "text-[var(--text)]" : "text-[var(--text-muted)]",
                        )}
                      >
                        <Link
                          href={item.href}
                          className="rounded-sm underline-offset-4 transition-colors hover:text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                        >
                          {item.title}
                        </Link>
                      </p>
                      <p
                        className={cn(
                          "mt-2 text-[15px] leading-relaxed transition-colors duration-500",
                          on ? "text-[var(--text)]" : "text-[var(--text-muted)]",
                        )}
                      >
                        {item.description}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-6 md:mt-10">
              <Link
                href="/services"
                className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[var(--text)] underline-offset-4 transition hover:text-[var(--accent)] hover:underline sm:text-sm"
              >
                Все услуги
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
