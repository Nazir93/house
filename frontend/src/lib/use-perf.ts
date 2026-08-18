"use client";

import { useState, useEffect } from "react";

import { isLowPerfFromSignals } from "@/lib/perf-device";

let cachedIsLow: boolean | null = null;

function detectLowPerf(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedIsLow !== null) return cachedIsLow;

  const nav = navigator as Navigator & { deviceMemory?: number };
  cachedIsLow = isLowPerfFromSignals({
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: nav.deviceMemory,
    userAgent: navigator.userAgent,
  });
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
