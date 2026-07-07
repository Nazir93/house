"use client";

import { useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import {
  getRemainingLoaderDelay,
  isStandaloneDisplayMode,
  MOBILE_STARTUP_LOADER_FADE_MS,
  MOBILE_STARTUP_LOADER_MIN_MS,
  shouldShowMobileStartupLoader,
} from "@/lib/mobile-startup-loader";

type MaybeStandaloneNavigator = Navigator & {
  standalone?: boolean;
};

export function MobileStartupLoader() {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const legacyStandalone = (window.navigator as MaybeStandaloneNavigator).standalone;
    const show = shouldShowMobileStartupLoader({
      isMobileViewport: mediaQuery.matches,
      isStandaloneMode: isStandaloneDisplayMode(displayModeStandalone, legacyStandalone),
    });

    if (!show) {
      setVisible(false);
      return;
    }

    startedAtRef.current = performance.now();

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    let removeTimer: ReturnType<typeof setTimeout> | undefined;

    const startHide = () => {
      const remainingDelay = getRemainingLoaderDelay(
        startedAtRef.current,
        MOBILE_STARTUP_LOADER_MIN_MS,
        performance.now(),
      );
      hideTimer = window.setTimeout(() => {
        setFadingOut(true);
        removeTimer = window.setTimeout(() => setVisible(false), MOBILE_STARTUP_LOADER_FADE_MS);
      }, remainingDelay);
    };

    if (document.readyState === "complete") {
      startHide();
    } else {
      window.addEventListener("load", startHide, { once: true });
    }

    return () => {
      window.removeEventListener("load", startHide);
      if (hideTimer) window.clearTimeout(hideTimer);
      if (removeTimer) window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-[var(--bg)] px-6 transition-opacity duration-300 ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <BrandLogo height={52} />
        <div className="h-[3px] w-24 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--border)_75%,transparent)]">
          <div className="h-full w-full animate-[skeleton-sweep_1.1s_ease-in-out_infinite] bg-[var(--accent)]" />
        </div>
      </div>
    </div>
  );
}
