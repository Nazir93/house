"use client";

import { useEffect } from "react";

import { METRIKA_GOALS, trackMetrikaGoal } from "@/lib/analytics-goals";

function closestTrackedLink(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest("a[href]");
}

function trackHref(href: string) {
  const normalized = href.toLowerCase();
  if (normalized.startsWith("tel:")) {
    trackMetrikaGoal(METRIKA_GOALS.phoneClick, { href });
    return;
  }
  if (normalized.includes("t.me") || normalized.includes("telegram")) {
    trackMetrikaGoal(METRIKA_GOALS.telegramClick, { href });
    return;
  }
  if (normalized.includes("max.ru") || normalized.includes("max")) {
    trackMetrikaGoal(METRIKA_GOALS.maxClick, { href });
    return;
  }
  if (normalized.includes("/api/leads/proposal")) {
    trackMetrikaGoal(METRIKA_GOALS.proposalDownload, { href });
  }
}

export function AnalyticsEventListener() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = closestTrackedLink(event.target);
      if (!link) return;
      trackHref(link.href || link.getAttribute("href") || "");
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

