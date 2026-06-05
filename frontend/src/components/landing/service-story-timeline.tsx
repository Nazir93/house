"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
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
  computeBeatContentReveal,
  computeSectionScrollProgress,
  computeTrackScrollProgress,
  buildBeatBranchPath,
  isBeatSpinePassed,
  resolveBeatBranchDisplayProgress,
  resolveBeatVisualFromSpine,
  type BeatBranchGeometry,
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

function BeatBranchSvg({
  geometry,
  branchProgress,
  showNode,
  dotFill,
}: {
  geometry: BeatBranchGeometry | null;
  branchProgress: number;
  showNode: boolean;
  dotFill: number;
}) {
  if (!geometry || !showNode) return null;
  const path = buildBeatBranchPath(geometry, branchProgress);
  if (path.totalLength <= 0) return null;

  const dashOffset = Math.max(path.totalLength - path.visibleLength, 0);
  const innerR = 4.5 * Math.max(0, Math.min(dotFill, 1));

  return (
    <svg className="pointer-events-none absolute inset-0 z-[4] hidden overflow-visible lg:block" aria-hidden>
      {branchProgress > 0.001 ? (
        <path
          d={path.d}
          fill="none"
          stroke={SPINE}
          strokeWidth={1}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={path.totalLength}
          strokeDashoffset={dashOffset}
        />
      ) : null}
      <circle
        cx={path.dotX}
        cy={path.dotY}
        r={10}
        fill="var(--bg)"
        stroke={SPINE}
        strokeWidth={1}
        opacity={Math.min(0.35 + dotFill * 0.65, 1)}
      />
      <circle cx={path.dotX} cy={path.dotY} r={innerR} fill="var(--text)" opacity={Math.min(dotFill * 1.05, 1)} />
    </svg>
  );
}

function TimelineBeat({
  item,
  index,
  sectionProgress,
  total,
  spineBottomPx,
  reducedMotion,
}: {
  item: StoryTimelineItem;
  index: number;
  sectionProgress: number;
  total: number;
  spineBottomPx?: number;
  reducedMotion: boolean;
}) {
  const isRight = item.side === "right";
  const contentReveal = reducedMotion ? 1 : computeBeatContentReveal(sectionProgress, index, total);
  const [nodeTopInTrack, setNodeTopInTrack] = useState<number | null>(null);
  const passed = isBeatSpinePassed(sectionProgress, index, total);
  const branchState =
    spineBottomPx != null && nodeTopInTrack != null
      ? resolveBeatVisualFromSpine(spineBottomPx, nodeTopInTrack, passed, reducedMotion)
      : resolveBeatBranchDisplayProgress(sectionProgress, index, total, reducedMotion);
  const show = reducedMotion || contentReveal > 0.02;
  const imageSrc = item.imageUrl?.trim() || `/images/banner/banner-hero-0${(index % 6) + 1}.png`;
  const articleRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [branchGeometry, setBranchGeometry] = useState<BeatBranchGeometry | null>(null);

  const measureBranch = useCallback(() => {
    const article = articleRef.current;
    const copy = copyRef.current;
    if (!article || !copy) return;

    const articleRect = article.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    if (articleRect.width <= 0) return;

    const spineX = articleRect.width / 2;
    const nodeY = articleRect.height / 2;
    const maxBranch = Math.min(240, articleRect.width * 0.3);
    const rawEdge = isRight ? copyRect.left - articleRect.left - 12 : copyRect.right - articleRect.left + 12;
    const branchLen = Math.min(Math.abs(rawEdge - spineX), maxBranch);
    const textEdgeX = isRight ? spineX + branchLen : spineX - branchLen;

    const track = article.closest("[data-story-scroll-track]");
    if (track) {
      const trackRect = track.getBoundingClientRect();
      setNodeTopInTrack(articleRect.top - trackRect.top + nodeY);
    }

    setBranchGeometry({
      spineX,
      nodeY,
      textEdgeX,
      branchToRight: isRight,
    });
  }, [isRight]);

  useLayoutEffect(() => {
    measureBranch();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measureBranch) : null;
    if (articleRef.current) ro?.observe(articleRef.current);
    if (copyRef.current) ro?.observe(copyRef.current);
    window.addEventListener("resize", measureBranch);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measureBranch);
    };
  }, [measureBranch, item.id, sectionProgress]);

  return (
    <article
      ref={articleRef}
      className="relative flex min-h-[46svh] items-start py-8 md:py-10 lg:min-h-[360px]"
      aria-labelledby={`story-beat-title-${item.id}`}
    >
      <BeatBranchSvg
        geometry={branchGeometry}
        branchProgress={branchState.branch}
        showNode={branchState.showNode}
        dotFill={branchState.dotFill}
      />

      <div className="grid w-full grid-cols-1 items-start lg:grid-cols-[minmax(220px,0.48fr)_48px_minmax(0,1.52fr)] lg:gap-x-8 xl:gap-x-10">
        <Reveal
          visible={show || !isRight}
          className={cn(
            "hidden min-h-0 w-full lg:flex lg:items-start lg:justify-center",
            "lg:justify-end lg:pr-2 xl:pr-4",
          )}
        >
          <BeatCopy ref={copyRef} item={item} reveal={contentReveal} align="left" />
        </Reveal>

        <div aria-hidden className="hidden min-h-0 w-[56px] lg:block" />

        <Reveal
          visible={show || isRight}
          className={cn(
            "hidden min-h-0 w-full lg:flex lg:items-start lg:justify-center",
            "lg:justify-start lg:pl-2 xl:pl-4",
          )}
        >
          {show ? <BeatMedia imageSrc={imageSrc} title={item.title} reveal={contentReveal} /> : null}
        </Reveal>

        <div className="col-span-full lg:hidden">
          <div className="mb-6 flex items-center gap-3" style={{ opacity: contentReveal }}>
            <span className="h-px flex-1 max-w-8" style={{ backgroundColor: SPINE }} aria-hidden />
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: "var(--text)", opacity: 0.75 }} aria-hidden />
            <span className="h-px flex-1" style={{ backgroundColor: SPINE }} aria-hidden />
          </div>
          {show ? (
            <div style={{ opacity: contentReveal }} className="grid gap-6">
              <BeatCopy item={item} reveal={contentReveal} align="left" />
              <BeatMedia imageSrc={imageSrc} title={item.title} reveal={contentReveal} />
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
      className="relative mx-auto aspect-[3.05/1] w-full max-w-[820px] overflow-hidden rounded-none lg:max-w-none"
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
        sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 66vw, 900px"
      />
    </div>
  );
}

const BeatCopy = forwardRef(function BeatCopy(
  {
    item,
    reveal,
    align,
  }: {
    item: StoryTimelineItem;
    reveal: number;
    align: "left" | "right";
  },
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={cn("w-full max-w-[17rem] rounded-sm p-5", align === "right" ? "ml-auto text-right" : "mr-auto text-left")}
      style={{
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 16}px)`,
      }}
    >
      {item.eyebrow ? (
        <p
          className="mb-3 text-[15px] font-medium leading-none sm:text-base"
          style={{ color: "color-mix(in srgb, var(--text) 55%, transparent)" }}
        >
          {item.eyebrow}
        </p>
      ) : null}
      <h2
        id={`story-beat-title-${item.id}`}
        className="font-heading text-xl font-medium leading-tight"
        style={{ color: "var(--text)" }}
      >
        {item.title}
      </h2>
      <p
        className="mt-4 text-sm leading-relaxed"
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
});

export function ServiceStoryTimeline({
  items,
  sectionProgress: externalProgress,
  spineBottomPx,
  embedded = false,
}: {
  items: StoryTimelineItem[];
  sectionProgress?: number;
  spineBottomPx?: number;
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
      className={cn("relative", embedded ? "pb-0" : "-mt-px pb-10 pt-4 md:pb-14")}
      style={{ backgroundColor: "var(--bg)" }}
      aria-label="Этапы и направления"
    >
      <div className="container relative mx-auto w-full max-w-[1320px] px-5 md:px-8">
        {items.map((item, index) => (
          <TimelineBeat
            key={item.id}
            item={item}
            index={index}
            sectionProgress={sectionProgress}
            total={items.length}
            spineBottomPx={spineBottomPx}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </section>
  );
}
