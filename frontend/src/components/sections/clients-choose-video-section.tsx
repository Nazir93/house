"use client";

import type { Ref } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

const SCROLL_VH_PER_ITEM = 100;
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
    description: "Архитектурное и планировочное решение, адаптированное под участок и задачи семьи.",
  },
  {
    title: "Фундамент",
    description: "Надежное основание под тип грунта и проект вашего дома.",
  },
  {
    title: "Кровля",
    description: "Теплая и герметичная кровельная система с правильными узлами.",
  },
  {
    title: "Коммуникации",
    description: "Вода, канализация, электричество и инженерия, готовые к эксплуатации.",
  },
  {
    title: "Отделка",
    description: "Чистовая отделка под ключ с аккуратной реализацией каждого этапа.",
  },
] as const;

function VideoPanel({ videoRef }: { videoRef: Ref<HTMLVideoElement> }) {
  return (
    <div className="relative w-full overflow-hidden rounded-[22px] shadow-[0_20px_56px_rgba(0,0,0,0.08)] lg:rounded-[30px]">
      <div className="relative aspect-video w-full overflow-hidden rounded-[inherit] lg:aspect-[4/3]">
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
      { root: null, rootMargin: "60% 0px", threshold: 0 }
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
      className="relative border-t border-[var(--border)]"
      style={{ height: `${SERVICES.length * SCROLL_VH_PER_ITEM}vh`, backgroundColor: "var(--bg)" }}
      aria-labelledby="clients-choose-video-heading"
    >
      <div
        className={cn(
          "sticky z-0 overflow-y-auto overscroll-y-contain lg:overflow-hidden",
          /* Под фиксированную шапку — иначе видео наезжает под header на мобилке */
          "max-lg:top-[var(--site-header-sticky-offset)] max-lg:h-[calc(100dvh-var(--site-header-sticky-offset)-env(safe-area-inset-bottom,0px))]",
          "lg:top-0 lg:h-[100dvh]",
        )}
      >
        <div className="mx-auto flex min-h-full w-full max-w-[1380px] flex-col lg:h-full lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-12">
          <div className="order-2 flex min-w-0 flex-1 flex-col justify-start px-4 pb-10 pt-1 max-md:mt-12 sm:px-6 lg:order-1 lg:max-w-[560px] lg:justify-center lg:px-0 lg:pb-0 lg:pt-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] md:text-xs">
              Что мы делаем
            </p>
            <h2
              id="clients-choose-video-heading"
              className="mt-2 text-balance font-heading text-[clamp(1.25rem,3.8vw,2rem)] font-bold uppercase leading-[1.14] tracking-[-0.02em] text-[var(--text)] md:mt-3 md:text-[clamp(1.5rem,2.5vw,2.35rem)]"
            >
              Наши услуги
            </h2>

            <div className="mt-4 flex items-center gap-1.5 md:hidden">
              {SERVICES.map((_, i) => (
                <div
                  key={i}
                  className="h-0.5 flex-1 rounded-full transition-all duration-500 ease-out"
                  style={{
                    backgroundColor: i <= activeIndex ? "var(--accent)" : "var(--text-subtle)",
                    opacity: i <= activeIndex ? 1 : 0.28,
                  }}
                />
              ))}
            </div>

            <div className="mt-6">
              <ul className="max-w-xl space-y-4 text-pretty sm:space-y-5">
                {SERVICES.map((item, idx) => {
                  const on = idx === activeIndex;
                  return (
                    <li
                      key={item.title}
                      className={cn(
                        "border-l-[3px] pl-4 transition-all duration-500 ease-out sm:pl-5 md:border-l-[4px] md:pl-6",
                        on ? "border-[var(--accent)] opacity-100" : "border-[var(--border)] opacity-[0.44] md:opacity-50"
                      )}
                    >
                      <p
                        className={cn(
                          "text-[15px] font-semibold leading-snug transition-colors duration-500 sm:text-[0.98rem] md:text-[1.05rem]",
                          on ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                        )}
                      >
                        {item.title}
                      </p>
                      <p
                        className={cn(
                          "mt-1.5 text-[14px] leading-relaxed transition-colors duration-500 sm:mt-2 sm:text-[15px]",
                          on ? "text-[var(--text)]" : "text-[var(--text-muted)]"
                        )}
                      >
                        {item.description}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-8 md:mt-10">
              <Link
                href="/services"
                className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[var(--text)] underline-offset-4 transition hover:text-[var(--accent)] hover:underline sm:text-sm"
              >
                Все услуги
                <ArrowUpRight className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          </div>

          <div className="order-1 w-full shrink-0 px-4 pt-4 sm:px-6 lg:order-2 lg:flex-none lg:w-[46%] lg:px-0 lg:pt-0">
            <div className="mx-auto w-full max-w-[640px] lg:max-w-[560px]">
              <VideoPanel videoRef={videoRef} />
              {/* До md прогресс уже под заголовком «Наши услуги»; под видео — с md, чтобы не было двух полос */}
              <div className="mt-4 hidden items-center gap-2 md:flex" aria-hidden>
                {SERVICES.map((_, i) => {
                  const fill = Math.max(0, Math.min(scrollProgress * SERVICES.length - i, 1));
                  return (
                    <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--border)]/65">
                      <div
                        className="h-full bg-[var(--accent)] transition-[width] duration-200 ease-linear"
                        style={{ width: `${fill * 100}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
