"use client";

import { useEffect } from "react";
import type Lenis from "lenis";
import { scrollPageToElement } from "@/lib/scroll-page-to-element";
import { isLowPerfDevice } from "@/lib/use-perf";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScroll() {
  /** Единый обработчик якорей: Lenis на десктопе или нативный скролл на таче / без Lenis */
  useEffect(() => {
    const handleAnchor = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href?.startsWith("#") || href === "#") return;
      const el = document.querySelector(href);
      if (!(el instanceof HTMLElement)) return;
      e.preventDefault();
      scrollPageToElement(el);
    };
    document.addEventListener("click", handleAnchor);
    return () => document.removeEventListener("click", handleAnchor);
  }, []);

  useEffect(() => {
    if (isLowPerfDevice()) return;

    const coarsePointer =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;

    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Телефоны/планшеты — нативный скролл без Lenis (меньше «рваности» и лишней скорости). */
    if (coarsePointer || reducedMotion) {
      return;
    }

    let cancelled = false;
    let rafId = 0;
    let lenis: Lenis | undefined;

    void import("lenis").then(({ default: LenisCtor }) => {
      if (cancelled) return;

      lenis = new LenisCtor({
        duration: 1.35,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.82,
        touchMultiplier: 1,
        syncTouch: false,
      });

      window.__lenis = lenis;

      function raf(time: number) {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
