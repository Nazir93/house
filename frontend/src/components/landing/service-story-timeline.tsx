"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import Link from "next/link";
import { CmsImage } from "@/components/ui/cms-image";
import type { StoryTimelineItem } from "@/lib/service-landing-schema";
import {
  computeBeatReveal,
  computeSectionScrollProgress,
  computeTrackScrollProgress,
} from "@/lib/service-story-timeline-progress";
import { cn } from "@/lib/utils";

const SPINE = "color-mix(in srgb, var(--text) 32%, transparent)";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function Reveal({
  visible = true,
  className,
  style,
  children,
  ...rest
}: {
  visible?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={className}
      style={{
        ...style,
        visibility: visible ? "visible" : "hidden",
      }}
    >
      {children}
    </div>
  );
}

function TimelineBeat({
  item,
  index,
  reveal,
  reducedMotion,
}: {
  item: StoryTimelineItem;
  index: number;
  reveal: number;
  reducedMotion: boolean;
}) {
  const isRight = item.side === "right";
  const show = reducedMotion || reveal > 0.02;
  const imageSrc = item.imageUrl?.trim() || `/images/banner/banner-hero-0${(index % 6) + 1}.png`;

  return (
    <article
      className="relative flex min-h-[65svh] items-center py-12 md:py-16 lg:min-h-[70svh]"
      aria-labelledby={`story-beat-title-${item.id}`}
    >
      <div className="grid w-full grid-cols-1 items-center lg:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] lg:gap-x-8 xl:gap-x-12">
        <Reveal
          visible={show}
          className={cn(
            "hidden min-h-0 w-full lg:flex lg:items-center lg:justify-center",
            isRight ? "lg:justify-end lg:pr-2 xl:pr-4" : "lg:justify-end lg:pr-2 xl:pr-6",
          )}
        >
          {show ? (
            isRight ? (
              <BeatMedia imageSrc={imageSrc} title={item.title} reveal={reveal} />
            ) : (
              <BeatCopy item={item} reveal={reveal} align="right" />
            )
          ) : null}
        </Reveal>

        <div className="relative z-[2] mx-auto hidden min-h-0 w-full self-center lg:flex lg:w-[56px] lg:flex-col lg:items-center lg:justify-center">
          <div
            className="absolute top-1/2 hidden h-px origin-left lg:block"
            style={{
              width: "min(30vw, 220px)",
              left: "50%",
              backgroundColor: SPINE,
              opacity: reveal,
              transform: isRight ? `scaleX(${reveal})` : `scaleX(${reveal}) translateX(-100%)`,
              transformOrigin: isRight ? "left center" : "right center",
            }}
            aria-hidden
          />
          <span
            className="relative z-[1] flex h-[20px] w-[20px] items-center justify-center rounded-full border"
            style={{
              opacity: reveal,
              borderColor: SPINE,
              backgroundColor:
                reveal > 0.5 ? "color-mix(in srgb, var(--bg) 88%, var(--text) 12%)" : "var(--bg)",
            }}
          >
            <span
              className="block rounded-full"
              style={{
                width: reveal > 0.35 ? 9 : 0,
                height: reveal > 0.35 ? 9 : 0,
                backgroundColor: "var(--text)",
                opacity: reveal > 0.35 ? 0.9 : 0,
              }}
            />
          </span>
        </div>

        <Reveal
          visible={show}
          className={cn(
            "hidden min-h-0 w-full lg:flex lg:items-center lg:justify-center",
            isRight ? "lg:justify-start lg:pl-2 xl:pl-6" : "lg:justify-start lg:pl-2 xl:pl-4",
          )}
        >
          {show ? (
            isRight ? (
              <BeatCopy item={item} reveal={reveal} align="left" />
            ) : (
              <BeatMedia imageSrc={imageSrc} title={item.title} reveal={reveal} />
            )
          ) : null}
        </Reveal>

        <div className="col-span-full lg:hidden">
          <div className="mb-6 flex items-center gap-3" style={{ opacity: reveal }}>
            <span className="h-px flex-1 max-w-8" style={{ backgroundColor: SPINE }} aria-hidden />
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: "var(--text)", opacity: 0.75 }} aria-hidden />
            <span className="h-px flex-1" style={{ backgroundColor: SPINE }} aria-hidden />
          </div>
          {show ? (
            <div style={{ opacity: reveal }} className="grid gap-6">
              <BeatMedia imageSrc={imageSrc} title={item.title} reveal={reveal} />
              <BeatCopy item={item} reveal={reveal} align="left" />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function BeatMedia({ imageSrc, title, reveal }: { imageSrc: string; title: string; reveal: number }) {
  return (
    <div
      className="relative mx-auto aspect-[4/3] w-full max-h-[min(44svh,440px)] max-w-[620px] overflow-hidden rounded-[1.5rem] md:rounded-[1.85rem] lg:aspect-[5/4] lg:max-h-[min(48svh,480px)] lg:max-w-none"
      style={{
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 16}px) scale(${0.97 + reveal * 0.03})`,
      }}
    >
      <CmsImage
        src={imageSrc}
        alt={title}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 50vw, 640px"
      />
    </div>
  );
}

function BeatCopy({
  item,
  reveal,
  align,
}: {
  item: StoryTimelineItem;
  reveal: number;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn("w-full max-w-[34rem]", align === "right" ? "ml-auto text-right" : "mr-auto text-left")}
      style={{
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 16}px)`,
      }}
    >
      {item.eyebrow ? (
        <p
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs"
          style={{ color: "color-mix(in srgb, var(--text) 55%, transparent)" }}
        >
          {item.eyebrow}
        </p>
      ) : null}
      <h2
        id={`story-beat-title-${item.id}`}
        className="font-heading text-[clamp(1.75rem,3.2vw,3rem)] font-bold uppercase leading-[1.08] tracking-[0.03em]"
        style={{ color: "var(--text)" }}
      >
        {item.title}
      </h2>
      <p
        className="mt-5 text-base leading-relaxed sm:text-lg md:mt-6 md:leading-[1.65]"
        style={{ color: "color-mix(in srgb, var(--text) 72%, transparent)" }}
      >
        {item.body}
      </p>
      {item.href ? (
        <Link
          href={item.href}
          className={cn(
            "mt-6 inline-flex text-base font-semibold underline-offset-4 hover:underline",
            align === "right" && "ml-auto",
          )}
          style={{ color: "var(--accent)" }}
        >
          Подробнее
        </Link>
      ) : null}
    </div>
  );
}

export function ServiceStoryTimeline({
  items,
  sectionProgress: externalProgress,
  embedded = false,
}: {
  items: StoryTimelineItem[];
  sectionProgress?: number;
  embedded?: boolean;
  /** @deprecated */
  hideGlobalSpine?: boolean;
  /** @deprecated */
  embeddedSpine?: boolean;
  /** @deprecated */
  sectionRef?: RefObject<HTMLElement | null>;
  /** @deprecated */
  stageRef?: RefObject<HTMLDivElement | null>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [internalProgress, setInternalProgress] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const sectionProgress = externalProgress ?? internalProgress;

  const syncScroll = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vh = window.visualViewport?.height ?? window.innerHeight;
    if (embedded) {
      const track = el.parentElement;
      if (track) {
        setInternalProgress(computeTrackScrollProgress(rect.top - el.offsetTop + track.getBoundingClientRect().top, track.offsetHeight, vh));
      }
    } else {
      setInternalProgress(computeSectionScrollProgress(rect.top, el.offsetHeight, vh));
    }
  }, [embedded]);

  useEffect(() => {
    if (externalProgress !== undefined) return;
    if (reducedMotion) {
      setInternalProgress(1);
      return;
    }
    const onScroll = () => syncScroll();
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
  }, [externalProgress, reducedMotion, syncScroll]);

  return (
    <section
      ref={sectionRef}
      data-story-timeline-section
      className={cn("relative", embedded ? "pb-0" : "-mt-px pb-10 md:pb-14")}
      style={{ backgroundColor: "var(--bg)" }}
      aria-label="Этапы и направления"
    >
      <div className="container relative mx-auto w-full max-w-[1320px] px-5 md:px-8">
        {items.map((item, index) => (
          <TimelineBeat
            key={item.id}
            item={item}
            index={index}
            reveal={reducedMotion ? 1 : computeBeatReveal(sectionProgress, index, items.length)}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </section>
  );
}
