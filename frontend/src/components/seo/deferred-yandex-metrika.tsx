"use client";

import { useEffect } from "react";

import {
  ANALYTICS_DEFER_FALLBACK_MS,
  ANALYTICS_DEFER_IDLE_TIMEOUT_MS,
} from "@/lib/analytics-defer";
import {
  buildMetrikaInitOptions,
  YM_COUNTER_WINDOW_KEY,
} from "@/lib/analytics-metrika-config";

type Props = {
  ymId: string;
};

type YmFn = ((...args: unknown[]) => void) & { a?: unknown[]; l?: number };

/**
 * Метрика после idle / первого жеста / таймаута — не конкурирует с LCP и main-thread на старте.
 * Кеш mc.yandex.ru мы не контролируем (PSI «TTL 1 ч») — это у Яндекса.
 */
export function DeferredYandexMetrika({ ymId }: Props) {
  useEffect(() => {
    let cancelled = false;
    let loaded = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const cleanupWaiters = () => {
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId != null) window.clearTimeout(timeoutId);
      window.removeEventListener("scroll", onInteract);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };

    const load = () => {
      if (cancelled || loaded) return;
      loaded = true;
      cleanupWaiters();

      (window as Window & { [YM_COUNTER_WINDOW_KEY]?: number })[YM_COUNTER_WINDOW_KEY] = Number(ymId);

      const src = `https://mc.yandex.ru/metrika/tag.js?id=${ymId}`;
      for (let j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === src) return;
      }

      const w = window as Window & { ym?: YmFn };
      w.ym =
        w.ym ||
        function (...args: unknown[]) {
          (w.ym!.a = w.ym!.a || []).push(args);
        };
      w.ym.l = Date.now();

      const k = document.createElement("script");
      k.async = true;
      k.src = src;
      const first = document.getElementsByTagName("script")[0];
      first?.parentNode?.insertBefore(k, first);

      const nav = navigator as Navigator & { deviceMemory?: number };
      const init = buildMetrikaInitOptions({
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: nav.deviceMemory,
        userAgent: navigator.userAgent,
      });

      w.ym(Number(ymId), "init", {
        ...init,
        referrer: document.referrer,
        url: location.href,
      });
    };

    function onInteract() {
      load();
    }

    window.addEventListener("scroll", onInteract, { once: true, passive: true });
    window.addEventListener("pointerdown", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => load(), { timeout: ANALYTICS_DEFER_IDLE_TIMEOUT_MS });
    }
    timeoutId = window.setTimeout(load, ANALYTICS_DEFER_FALLBACK_MS);

    return () => {
      cancelled = true;
      cleanupWaiters();
    };
  }, [ymId]);

  return (
    <noscript>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element -- пиксель Метрики в noscript */}
        <img
          src={`https://mc.yandex.ru/watch/${ymId}`}
          style={{ position: "absolute", left: "-9999px" }}
          alt=""
        />
      </div>
    </noscript>
  );
}
