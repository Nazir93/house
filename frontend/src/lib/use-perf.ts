"use client";

import { useState, useEffect } from "react";

let cachedIsLow: boolean | null = null;

function detectLowPerf(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedIsLow !== null) return cachedIsLow;

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = navigator.hardwareConcurrency || 4;
  const memory = nav.deviceMemory || 8;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  let score = 0;
  if (cores <= 2) score += 3;
  else if (cores <= 4) score += 1;
  if (memory <= 2) score += 3;
  else if (memory <= 4) score += 2;
  if (isMobile) score += 1;

  cachedIsLow = score >= 3;
  return cachedIsLow;
}

export function useLowPerf(): boolean {
  const [low, setLow] = useState(false);
  useEffect(() => {
    setLow(detectLowPerf());
  }, []);
  return low;
}

export function isLowPerfDevice(): boolean {
  return detectLowPerf();
}
