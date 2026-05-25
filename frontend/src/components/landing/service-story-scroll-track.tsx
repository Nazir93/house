"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LandingHeroCinematic } from "@/components/landing/landing-hero-cinematic";
import type { StoryTimelineItem } from "@/lib/service-landing-schema";
import {
  STORY_SPINE_LEAD_IN_PX,
  computeLineHeightPx,
  computeTrackScrollProgress,
} from "@/lib/service-story-timeline-progress";
import { ServiceStoryTimeline } from "@/components/landing/service-story-timeline";

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

type HeroProps = React.ComponentProps<typeof LandingHeroCinematic>;

export function ServiceStoryScrollTrack({
  hero,
  timelineItems,
}: {
  hero: Omit<HeroProps, "spineOriginRef">;
  timelineItems: StoryTimelineItem[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLDivElement>(null);
  const [trackProgress, setTrackProgress] = useState(0);
  const [lineLayout, setLineLayout] = useState({ top: 0, height: 0, maxHeight: 0 });
  const reducedMotion = usePrefersReducedMotion();

  const measure = useCallback(() => {
    const track = trackRef.current;
    const origin = originRef.current;
    if (!track || !origin) return;

    const trackRect = track.getBoundingClientRect();
    const originRect = origin.getBoundingClientRect();
    const vh = window.visualViewport?.height ?? window.innerHeight;

    const top = Math.max(0, originRect.bottom - trackRect.top);
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const rawProgress = reducedMotion ? 1 : computeTrackScrollProgress(trackRect.top, track.offsetHeight, vh);
    const progress = scrollY < 20 ? 0 : rawProgress;
    const maxHeight = Math.max(track.offsetHeight - top, 0);
    const height = computeLineHeightPx(progress, top, track.offsetHeight, STORY_SPINE_LEAD_IN_PX);

    setLineLayout({ top, height, maxHeight });
    setTrackProgress(progress);
  }, [reducedMotion]);

  useEffect(() => {
    measure();
    const onScroll = () => measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.visualViewport?.addEventListener("resize", onScroll, { passive: true } as AddEventListenerOptions);
    window.addEventListener("resize", onScroll, { passive: true });

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

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      window.removeEventListener("resize", onScroll);
      offLenis?.();
      window.clearInterval(poll);
      window.clearTimeout(stopPoll);
    };
  }, [measure]);

  return (
    <div ref={trackRef} className="relative" data-story-scroll-track>
      <LandingHeroCinematic {...hero} spineOriginRef={originRef} fullBleed />

      {lineLayout.maxHeight > 0 && lineLayout.height > 0 ? (
        <div
          className="pointer-events-none absolute left-1/2 z-[3] hidden w-px will-change-transform lg:block"
          style={{
            top: lineLayout.top,
            height: lineLayout.maxHeight,
            transform: `translateX(-50%) scaleY(${lineLayout.height / lineLayout.maxHeight})`,
            transformOrigin: "top center",
            backgroundColor: SPINE,
          }}
          aria-hidden
        />
      ) : null}

      <ServiceStoryTimeline
        items={timelineItems}
        sectionProgress={trackProgress}
        spineBottomPx={lineLayout.top + lineLayout.height}
        embedded
      />
    </div>
  );
}
