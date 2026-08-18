"use client";

import { useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import {
  getStartupLoaderHideDelay,
  isStandaloneDisplayMode,
  MOBILE_STARTUP_LOADER_FADE_MS,
  MOBILE_STARTUP_LOADER_MIN_MS,
  shouldShowMobileStartupLoader,
  STARTUP_LOADER_MAX_MS,
  STARTUP_LOADER_SETTLE_MS,
} from "@/lib/mobile-startup-loader";

type MaybeStandaloneNavigator = Navigator & {
  standalone?: boolean;
};

/**
 * Desktop: оверлей в SSR (max-md:hidden), чтобы с первого HTML перекрыть jank гидрации.
 * Mobile PWA: включается после mount (как раньше — не портит mobile LCP в PSI).
 * Mobile browser: сразу снимается.
 */
export function MobileStartupLoader() {
  const [active, setActive] = useState(true);
  const [mobileStandalone, setMobileStandalone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const startedAtRef = useRef<number>(0);
  const fadingRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const legacyStandalone = (window.navigator as MaybeStandaloneNavigator).standalone;
    const isMobileViewport = mediaQuery.matches;
    const isStandaloneMode = isStandaloneDisplayMode(displayModeStandalone, legacyStandalone);
    const show = shouldShowMobileStartupLoader({ isMobileViewport, isStandaloneMode });

    if (!show) {
      setActive(false);
      return;
    }

    if (isMobileViewport && isStandaloneMode) {
      setMobileStandalone(true);
    }

    startedAtRef.current = performance.now();

    let hideTimer: number | undefined;
    let removeTimer: number | undefined;
    let settleTimer: number | undefined;
    let maxTimer: number | undefined;
    let cancelled = false;

    const startFade = () => {
      if (cancelled || fadingRef.current) return;
      fadingRef.current = true;
      if (hideTimer) window.clearTimeout(hideTimer);
      if (settleTimer) window.clearTimeout(settleTimer);
      if (maxTimer) window.clearTimeout(maxTimer);
      setFadingOut(true);
      removeTimer = window.setTimeout(() => setActive(false), MOBILE_STARTUP_LOADER_FADE_MS);
    };

    const scheduleHideAfterMin = () => {
      if (cancelled || fadingRef.current) return;
      const delay = getStartupLoaderHideDelay({
        startedAtMs: startedAtRef.current,
        nowMs: performance.now(),
        minVisibleMs: MOBILE_STARTUP_LOADER_MIN_MS,
        maxVisibleMs: STARTUP_LOADER_MAX_MS,
      });
      hideTimer = window.setTimeout(startFade, delay);
    };

    const onDocumentReady = () => {
      if (cancelled || fadingRef.current) return;

      const settleAndHide = () => {
        settleTimer = window.setTimeout(scheduleHideAfterMin, STARTUP_LOADER_SETTLE_MS);
      };

      const afterPaint = () => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(settleAndHide);
        });
      };

      const fontsReady = document.fonts?.ready;
      if (fontsReady) {
        void fontsReady.then(afterPaint).catch(afterPaint);
      } else {
        afterPaint();
      }
    };

    maxTimer = window.setTimeout(startFade, STARTUP_LOADER_MAX_MS);

    if (document.readyState === "complete") {
      onDocumentReady();
    } else {
      window.addEventListener("load", onDocumentReady, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", onDocumentReady);
      if (hideTimer) window.clearTimeout(hideTimer);
      if (settleTimer) window.clearTimeout(settleTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
      if (maxTimer) window.clearTimeout(maxTimer);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-[var(--bg)] px-6 transition-opacity duration-300 ${
        mobileStandalone ? "" : "max-md:hidden"
      } ${fadingOut ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <div className="flex flex-col items-center gap-6">
        <BrandLogo height={mobileStandalone ? 52 : 64} />
        <div className="h-[3px] w-24 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--border)_75%,transparent)]">
          <div className="h-full w-full animate-[skeleton-sweep_1.1s_ease-in-out_infinite] bg-[var(--accent)]" />
        </div>
      </div>
    </div>
  );
}
