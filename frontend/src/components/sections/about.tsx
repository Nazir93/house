"use client";

import { useRef, useState, useEffect, useLayoutEffect, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useModal } from "@/lib/modal-context";

type SlideAction =
  | { type: "link"; href: string; label: string }
  | { type: "modal"; label: string };

interface Slide {
  number: string;
  heading: string;
  highlight: string;
  description: string;
  action: SlideAction;
}

const SLIDES: Slide[] = [
  {
    number: "01",
    heading: "Проектирование под ваш участок",
    highlight: "Типовые решения и индивидуальные планировки",
    description:
      "Подбираем проект из каталога или адаптируем под рельеф, подъездные пути и инженерию участка. На выходе — понятная документация и смета до старта стройки.",
    action: { type: "modal", label: "Обсудить проект" },
  },
  {
    number: "02",
    heading: "Прозрачная смета и этапы",
    highlight: "Оплата по факту выполненных работ",
    description:
      "Фиксируем состав работ и сроки этапов в договоре. Контроль качества на каждой стройке: акты скрытых работ и фотоотчёты по запросу.",
    action: { type: "modal", label: "Обсудить проект" },
  },
  {
    number: "03",
    heading: "Технология строительства",
    highlight: "От фундамента до кровли и узлов примыкания",
    description:
      "Работаем с проверенными материалами и узлами. Прораб на объекте координирует бригады и соблюдение проекта — без «сюрпризов» на финишной отделке.",
    action: { type: "modal", label: "Обсудить проект" },
  },
  {
    number: "04",
    heading: "Полный цикл под ключ",
    highlight: "Коробка, инженерия, отделка — в одном подряде",
    description:
      "Не нужно искать отдельно проектировщика, кровельщиков и отделку: единая ответственность и согласованные сроки между этапами.",
    action: { type: "link", href: "/services/projecting", label: "Направления работ" },
  },
  {
    number: "05",
    heading: "Каталог и готовые объекты",
    highlight: "Типовые проекты и портфолио построенных домов",
    description:
      "Смотрите площади, планировки и реальные фото объектов. Можно сопоставить несколько проектов и выбрать оптимальный под бюджет.",
    action: { type: "link", href: "/portfolio", label: "Наши проекты" },
  },
  {
    number: "06",
    heading: "География и выезд",
    highlight: "Санкт-Петербург и ЛО, другие регионы по запросу",
    description:
      "Офис в Санкт-Петербурге, работаем в Ленинградской области и по согласованию в других регионах. Организуем выезд на участок и консультацию по подключению коммуникаций.",
    action: { type: "modal", label: "Обсудить проект" },
  },
  {
    number: "07",
    heading: "Гарантия и сопровождение",
    highlight: "Гарантия на работы и поддержка после сдачи",
    description:
      "Фиксируем гарантийные обязательства по договору. После сдачи дома остаёмся на связи по вопросам эксплуатации и сервиса.",
    action: { type: "link", href: "/contacts", label: "Связаться с нами" },
  },
];

/** Скролл двигает currentTime — в MP4 должны быть частые keyframes (напр. ffmpeg -g 6), иначе щит визуально не «заполняется». */
const VIDEO_ABOUT_DESKTOP = "/panel-assembly-seek.mp4";
const VIDEO_ABOUT_MOBILE = "/panel-assembly-mobile.mp4";
const VIDEO_ABOUT_POSTER = "/panel-assembly-poster.jpg";

function subscribeMin768(cb: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeMin768,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false
  );
}

/** Кнопка по центру поверх видео (десктоп и мобайл) */
function AboutSlideCtaLayer({ activeIndex }: { activeIndex: number }) {
  const { openModal } = useModal();
  const ctaClass =
    "group inline-flex max-w-[min(100%,320px)] items-center justify-center gap-2 rounded-full border px-5 py-3 text-center backdrop-blur-sm transition-all duration-500 sm:px-6 sm:py-3.5";
  const ctaStyle = {
    borderColor: "rgba(15,61,46,0.55)",
    backgroundColor: "rgba(0,0,0,0.45)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
  } as const;

  return (
    <>
      {SLIDES.map((slide, i) => (
        <div
          key={`cta-${slide.number}`}
          className="absolute inset-0 z-[8] flex items-center justify-center px-3 sm:px-5 transition-opacity duration-500"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            pointerEvents: i === activeIndex ? "auto" : "none",
          }}
        >
          {slide.action.type === "link" ? (
            <Link href={slide.action.href} className={ctaClass} style={ctaStyle}>
              <span className="text-[10px] uppercase tracking-[0.12em] font-heading transition-colors duration-300 group-hover:text-[rgba(15,61,46,1)] sm:text-xs" style={{ color: "rgba(255,255,255,0.92)" }}>
                {slide.action.label}
              </span>
              <ArrowRight size={14} className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" style={{ color: "rgba(15,61,46,0.95)" }} />
            </Link>
          ) : (
            <button type="button" onClick={openModal} className={ctaClass} style={ctaStyle}>
              <span className="text-[10px] uppercase tracking-[0.12em] font-heading transition-colors duration-300 group-hover:text-[rgba(15,61,46,1)] sm:text-xs" style={{ color: "rgba(255,255,255,0.92)" }}>
                {slide.action.label}
              </span>
              <ArrowRight size={14} className="flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" style={{ color: "rgba(15,61,46,0.95)" }} />
            </button>
          )}
        </div>
      ))}
    </>
  );
}

function ImagePanel({
  activeIndex,
  scrollProgress,
  videoReady,
}: {
  activeIndex: number;
  scrollProgress: number;
  videoReady: boolean;
}) {
  const stripY = scrollProgress * 100;

  return (
    <div className="h-full relative overflow-hidden">
      <div
        className="absolute left-0 top-0 bottom-0 z-20 flex items-start"
        style={{ width: "40px" }}
      >
        <div className="absolute left-0 w-full flex items-center justify-center" style={{ height: "100%" }}>
          <div
            className="whitespace-nowrap font-heading text-[10px] uppercase tracking-[0.3em] select-none"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              color: "rgba(15,61,46,0.5)",
              transform: `translateY(${stripY - 50}%)`,
            }}
          >
            ЗАГОРОДНЫЕ ДОМА • ПРОЕКТИРОВАНИЕ И СТРОИТЕЛЬСТВО • ЗАГОРОДНЫЕ ДОМА • ПРОЕКТИРОВАНИЕ И СТРОИТЕЛЬСТВО
          </div>
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, var(--bg) 0%, transparent 15%, transparent 85%, var(--bg) 100%)" }}
        />
        <div className="absolute right-0 top-0 bottom-0 w-[1px]" style={{ backgroundColor: "var(--border)" }} />
      </div>

      <div className="relative w-full h-full" style={{ paddingLeft: "40px" }}>
        <video
          id="about-video-desktop"
          src={videoReady ? VIDEO_ABOUT_DESKTOP : undefined}
          poster={VIDEO_ABOUT_POSTER}
          muted
          playsInline
          preload={videoReady ? "auto" : "none"}
          className="relative z-0 h-full w-full object-cover"
          style={{ pointerEvents: "none" }}
          aria-hidden="true"
        />

        <AboutSlideCtaLayer activeIndex={activeIndex} />

        <div
          className="absolute left-2 top-1/2 z-[12] flex -translate-y-1/2 flex-col items-center gap-2 rounded-full px-2 py-3 backdrop-blur-md sm:left-3 sm:gap-2.5 sm:px-2.5 sm:py-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-500"
              style={{
                height: i === activeIndex ? "18px" : "6px",
                backgroundColor: i <= activeIndex ? "rgba(15,61,46,0.9)" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
          <span className="mt-0.5 text-[9px] font-heading tabular-nums tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>
            {String(activeIndex + 1).padStart(2, "0")}/{String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>
    </div>
  );
}

/**
 * На iOS/Android видео нельзя seek'ать, пока оно не было "активировано".
 * play()+pause() "прогревает" декодер — после этого currentTime работает.
 */
function warmUpVideo(v: HTMLVideoElement) {
  if ((v as unknown as { _warmedUp?: boolean })._warmedUp) return;
  (v as unknown as { _warmedUp?: boolean })._warmedUp = true;
  const p = v.play();
  if (p) p.then(() => v.pause()).catch(() => {/* autoplay blocked */});
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const isDesktop = useIsDesktop();

  const syncScrollToVideos = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const desktopVideo = document.getElementById("about-video-desktop") as HTMLVideoElement | null;
    const mobileVideo = document.getElementById("about-video-mobile") as HTMLVideoElement | null;

    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const viewportH = window.visualViewport?.height ?? window.innerHeight;
    const scrolled = -rect.top;
    const scrollRange = Math.max(sectionHeight - viewportH, 1);

    const progress = Math.max(0, Math.min(scrolled / scrollRange, 1));

    const seekVideo = (v: HTMLVideoElement | null) => {
      if (!v) return;
      if (!v.duration || Number.isNaN(v.duration) || !Number.isFinite(v.duration)) {
        warmUpVideo(v);
        return;
      }
      const t = progress * v.duration;
      try {
        v.pause();
        v.currentTime = t;
      } catch {
        /* ignore */
      }
    };
    seekVideo(desktopVideo);
    seekVideo(mobileVideo);

    setScrollProgress(progress);
    const idx = Math.min(Math.floor(progress * SLIDES.length), SLIDES.length - 1);
    setActiveIndex(idx);
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const marginFrac = 0.4;
    const inExpandedViewport = () => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const m = vh * marginFrac;
      return r.bottom >= -m && r.top <= vh + m;
    };

    if (inExpandedViewport()) {
      setVideoReady(true);
      return;
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVideoReady(true);
      },
      { rootMargin: "40% 0px", threshold: 0 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => syncScrollToVideos();
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
  }, [syncScrollToVideos]);

  /** Пока секция в зоне видимости — кадр за кадром (iOS / Lenis) */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    let active = false;
    const tick = () => {
      if (!active) return;
      syncScrollToVideos();
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        const next = e.isIntersecting;
        if (next && !active) {
          active = true;
          syncScrollToVideos();
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
  }, [syncScrollToVideos]);

  useEffect(() => {
    if (!videoReady) return;
    const desktop = document.getElementById("about-video-desktop") as HTMLVideoElement | null;
    const mobile = document.getElementById("about-video-mobile") as HTMLVideoElement | null;
    const onReady = () => syncScrollToVideos();
    const events = ["loadedmetadata", "loadeddata", "canplay"] as const;
    events.forEach((evt) => {
      desktop?.addEventListener(evt, onReady);
      mobile?.addEventListener(evt, onReady);
    });
    [desktop, mobile].forEach((v) => { if (v) warmUpVideo(v); });
    syncScrollToVideos();
    return () => {
      events.forEach((evt) => {
        desktop?.removeEventListener(evt, onReady);
        mobile?.removeEventListener(evt, onReady);
      });
    };
  }, [videoReady, isDesktop, syncScrollToVideos]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative"
      style={{
        height: `${SLIDES.length * 100}vh`,
        backgroundColor: "var(--bg)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <div className="h-full flex flex-col md:flex-row">

          <div className="flex-1 md:w-[42%] md:flex-none h-full flex flex-col relative z-10">
            {/* Мобильное видео только при ширине < md — не монтируем на десктопе, чтобы не качать лишний файл */}
            {!isDesktop && (
              <div className="relative w-full pt-20" style={{ height: "35dvh", minHeight: "200px" }}>
                <video
                  id="about-video-mobile"
                  src={videoReady ? VIDEO_ABOUT_MOBILE : undefined}
                  poster={VIDEO_ABOUT_POSTER}
                  muted
                  playsInline
                  preload={videoReady ? "auto" : "none"}
                  className="h-full w-full object-cover"
                  style={{ pointerEvents: "none" }}
                  aria-hidden="true"
                />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full px-3 py-1.5 backdrop-blur-md"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  {SLIDES.map((_, i) => (
                    <div
                      key={i}
                      className="h-[3px] rounded-full transition-all duration-500"
                      style={{
                        width: i === activeIndex ? "14px" : "5px",
                        backgroundColor: i <= activeIndex ? "rgba(15,61,46,0.9)" : "rgba(255,255,255,0.25)",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Mobile progress dots */}
            <div className="md:hidden flex items-center gap-2 px-5 sm:px-6 pt-4">
              {SLIDES.map((s, i) => (
                <div key={s.number} className="flex items-center gap-1.5">
                  <div
                    className="h-[2px] transition-all duration-500"
                    style={{
                      width: i === activeIndex ? "20px" : "10px",
                      backgroundColor: i <= activeIndex ? "var(--accent)" : "var(--text-subtle)",
                    }}
                  />
                  {i === activeIndex && (
                    <span className="text-[9px] tabular-nums" style={{ color: "var(--text-muted)" }}>
                      {s.number}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop slide counter */}
            <div className="hidden md:flex items-center gap-3 px-10 lg:px-16 pt-16 md:pt-20">
              <span className="text-[10px] font-heading tracking-[0.2em]" style={{ color: "var(--text-subtle)" }}>
                {String(activeIndex + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
              </span>
              <div className="flex-1 h-[1px] max-w-[120px]" style={{ backgroundColor: "var(--border)" }}>
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${((activeIndex + 1) / SLIDES.length) * 100}%`,
                    backgroundColor: "var(--accent)",
                  }}
                />
              </div>
            </div>

            {/* Background large number */}
            <div className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden">
              {SLIDES.map((slide, i) => (
                <div
                  key={`bg-${slide.number}`}
                  className="absolute inset-0 flex items-center transition-opacity duration-700"
                  style={{ opacity: i === activeIndex ? 1 : 0 }}
                >
                  <span
                    className="font-heading text-[30vw] md:text-[20vw] leading-none pl-4 md:pl-8"
                    style={{ color: "var(--text)", opacity: 0.04 }}
                  >
                    {slide.number}
                  </span>
                </div>
              ))}
            </div>

            {/* Text slides */}
            <div className="flex-1 flex items-center relative">
              {SLIDES.map((slide, i) => (
                <div
                  key={`text-${slide.number}`}
                  className="absolute inset-x-0 px-5 sm:px-8 md:px-10 lg:px-16 transition-all duration-700 ease-out"
                  style={{
                    opacity: i === activeIndex ? 1 : 0,
                    transform:
                      i === activeIndex
                        ? "translateY(0)"
                        : i < activeIndex
                        ? "translateY(-80px)"
                        : "translateY(80px)",
                    pointerEvents: i === activeIndex ? "auto" : "none",
                  }}
                >
                  <h3
                    className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-[1.05] mb-5 md:mb-8 max-w-md"
                    style={{ color: "var(--text)" }}
                  >
                    {slide.heading}
                  </h3>

                  <p
                    className="text-sm sm:text-base font-medium mb-4 md:mb-6 max-w-sm"
                    style={{ color: "var(--accent)" }}
                  >
                    {slide.highlight}
                  </p>

                  <p
                    className="text-xs sm:text-sm leading-relaxed max-w-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {slide.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: video panel — только на десктопе, чтобы на мобиле не качать тяжёлый ролик */}
          {isDesktop && (
            <div className="hidden md:block md:w-[58%] h-full relative">
              <ImagePanel activeIndex={activeIndex} scrollProgress={scrollProgress} videoReady={videoReady} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
