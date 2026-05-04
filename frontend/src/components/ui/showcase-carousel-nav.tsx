"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type ShowcaseCarouselNavProps = {
  slideCount: number;
  activeIndex: number;
  onSelectSlide: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  autoAdvanceMs: number;
  /** После окончании анимации на текущем сегменте — следующий кадр */
  onProgressAnimationComplete: () => void;
};

/**
 * Сегменты-полоски: пройденные залиты, на текущем — анимация. Без лишних теней/blur — легче на desktop.
 */
export function ShowcaseCarouselNav({
  slideCount,
  activeIndex,
  onSelectSlide,
  onPrev,
  onNext,
  autoAdvanceMs,
  onProgressAnimationComplete,
}: ShowcaseCarouselNavProps) {
  return (
    <div className="mt-8 w-full min-w-0">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition hover:border-white/30 hover:bg-black/55 sm:h-11 sm:w-11"
          aria-label="Предыдущий кадр"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div
          className="flex min-w-0 flex-1 items-stretch gap-1.5 px-0.5 sm:gap-2"
          role="tablist"
          aria-label="Кадры карусели"
        >
          {Array.from({ length: slideCount }, (_, idx) => {
            const done = idx < activeIndex;
            const current = idx === activeIndex;
            const upcoming = idx > activeIndex;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSlide(idx)}
                className={cn(
                  "relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/18 shadow-[inset_0_1px_3px_rgba(0,0,0,0.28)]",
                  current && "ring-1 ring-white/35",
                  upcoming && "bg-white/10",
                )}
                aria-label={`Кадр ${idx + 1} из ${slideCount}`}
                aria-current={current}
              >
                {done ? (
                  <span
                    className="absolute inset-0 rounded-full bg-white/88"
                    aria-hidden
                  />
                ) : null}

                {current ? (
                  <span
                    key={`seg-anim-${activeIndex}`}
                    className={cn(
                      "login-showcase-progress-fill absolute left-0 top-0 h-full w-full rounded-full",
                      "bg-gradient-to-r from-emerald-400/95 to-white/95",
                    )}
                    style={{ animationDuration: `${autoAdvanceMs}ms` }}
                    onAnimationEnd={(e) => {
                      e.stopPropagation();
                      if (e.target !== e.currentTarget) return;
                      const ne = e.nativeEvent;
                      if (
                        ne instanceof AnimationEvent &&
                        (ne.animationName ?? "").includes("login-showcase-progress")
                      ) {
                        onProgressAnimationComplete();
                      }
                    }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onNext}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition hover:border-white/30 hover:bg-black/55 sm:h-11 sm:w-11"
          aria-label="Следующий кадр"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
