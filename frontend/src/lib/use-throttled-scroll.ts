"use client";

import { useEffect, useRef } from "react";

export function useThrottledScroll(callback: () => void, delay = 16) {
  const lastRun = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    const handler = () => {
      const now = performance.now();
      if (now - lastRun.current < delay) return;
      lastRun.current = now;
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(callback);
    };

    window.addEventListener("scroll", handler, { passive: true });
    callback();
    return () => {
      window.removeEventListener("scroll", handler);
      cancelAnimationFrame(rafId.current);
    };
  }, [callback, delay]);
}
