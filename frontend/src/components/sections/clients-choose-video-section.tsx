"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const VIDEO_SRC = "/videos/home-clients-why.mp4";

const POINTS: { lines: [string] | [string, string] }[] = [
  { lines: ["За понятную и честную смету"] },
  { lines: ["За контроль стройки без вашего участия"] },
  { lines: ["За заботу о вашем бюджете", "Строим без лишнего"] },
  { lines: ["За уверенность в результате", "Смета, график, этапы"] },
  { lines: ["За надёжных прорабов и поставщиков"] },
];

export function ClientsChooseVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (mq.matches) video.pause();
      else void video.play().catch(() => {});
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section
      className="relative w-full overflow-x-hidden bg-[var(--bg)] transition-colors duration-500"
      aria-labelledby="clients-choose-video-heading"
    >
      <div
        className={cn(
          "mx-auto flex min-h-0 min-w-0 max-w-[1440px] flex-col",
          "lg:min-h-[min(58vh,520px)] lg:flex-row lg:items-stretch xl:min-h-[min(60vh,560px)]",
          /* Альбомный телефон / короткий экран: компактнее блок с видео, текст ниже без лишней высоты */
          "max-lg:landscape:min-h-0",
        )}
      >
        {/* Текст */}
        <div
          className={cn(
            "section-inline-pad order-2 flex min-w-0 flex-col justify-center",
            "py-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-5 sm:py-9 sm:pb-[max(2rem,env(safe-area-inset-bottom))] sm:pt-7 md:py-10",
            "lg:order-1 lg:w-[min(44%,540px)] lg:flex-shrink-0 lg:py-10 lg:pb-10 lg:pt-10",
            "xl:w-[min(42%,580px)] xl:py-11",
            "lg:pr-5 xl:pr-10",
            "max-lg:landscape:py-5 max-lg:landscape:pb-[max(1rem,env(safe-area-inset-bottom))]",
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] md:text-xs">
            Узнайте, за что клиенты
          </p>
          <h2
            id="clients-choose-video-heading"
            className="mt-2.5 text-balance font-heading text-[clamp(1.35rem,4.2vw,2.15rem)] font-bold normal-case leading-[1.14] tracking-[-0.02em] text-[var(--text)] sm:mt-3 md:mt-4 md:text-[clamp(1.45rem,3.6vw,2.45rem)] lg:text-[clamp(1.5rem,3.2vw,2.65rem)] xl:text-[clamp(1.55rem,2.85vw,2.85rem)]"
          >
            ВЫБИРАЮТ НАШИ ДОМА
          </h2>

          <ul className="mt-5 max-w-xl space-y-4 text-pretty sm:mt-6 sm:space-y-5 md:mt-8 md:space-y-6">
            {POINTS.map((item, idx) => (
              <li
                key={idx}
                className="border-l-[3px] border-[var(--accent)]/45 pl-4 sm:pl-5 md:border-l-[4px] md:pl-6"
              >
                {item.lines.map((line, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "text-[15px] font-semibold leading-snug text-[var(--text)] sm:text-[0.98rem] md:text-[1.05rem] md:leading-snug lg:text-[1.0625rem]"
                        : "mt-1.5 text-[14px] leading-relaxed text-[var(--text-muted)] sm:mt-2 sm:text-[15px] md:text-[15px] lg:text-[0.98rem]"
                    }
                  >
                    {line}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </div>

        {/* Видео */}
        <div
          className={cn(
            "relative order-1 min-h-0 min-w-0 w-full flex-1 lg:order-2",
            "lg:min-h-[min(58vh,520px)] xl:min-h-[min(60vh,560px)]",
            "max-lg:landscape:max-h-[min(40vh,260px)] max-lg:landscape:min-h-[min(30vh,168px)] max-lg:landscape:flex-none",
          )}
        >
          <div
            className={cn(
              "relative h-full min-h-[180px] w-full overflow-hidden rounded-none sm:min-h-[200px]",
              "aspect-video max-lg:max-h-[min(44vh,300px)] max-lg:min-h-[180px] sm:max-lg:max-h-[min(46vh,340px)]",
              "sm:rounded-b-[1.25rem]",
              "lg:mx-0 lg:aspect-auto lg:max-h-none lg:min-h-full lg:rounded-none",
              "lg:absolute lg:inset-y-0 lg:left-0 lg:right-[-5%] xl:right-[-6%]",
              "lg:[clip-path:polygon(11%_0,100%_0,100%_100%,0_100%)]",
              "max-lg:landscape:aspect-auto max-lg:landscape:max-h-none max-lg:landscape:min-h-[min(32vh,200px)] max-lg:landscape:rounded-none max-lg:landscape:sm:rounded-b-xl",
            )}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover object-center"
              src={VIDEO_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden
            />

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-black/25 lg:from-black/28 lg:via-transparent lg:to-black/12"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
}
