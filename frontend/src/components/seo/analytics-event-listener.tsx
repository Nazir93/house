"use client";

import { useEffect } from "react";

import { METRIKA_GOALS, trackMetrikaGoal } from "@/lib/analytics-goals";
import { PHONE_RAW, SOCIAL_LINKS } from "@/lib/constants";

function closestTrackedLink(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest("a[href]");
}

function normalizeHref(href: string): string {
  return href.trim().toLowerCase();
}

function isPhoneHref(href: string): boolean {
  const normalized = normalizeHref(href);
  if (!normalized.startsWith("tel:")) return false;
  const digits = normalized.replace(/\D/g, "");
  const expected = PHONE_RAW.replace(/\D/g, "");
  return digits.endsWith(expected) || expected.endsWith(digits);
}

function isTelegramHref(href: string): boolean {
  try {
    const url = new URL(href, typeof window !== "undefined" ? window.location.origin : "https://chastdushi.ru");
    return url.hostname === "t.me" || url.hostname.endsWith(".t.me");
  } catch {
    const normalized = normalizeHref(href);
    return normalized.includes("t.me/") || normalized.includes("telegram.me/");
  }
}

function isMaxMessengerHref(href: string): boolean {
  try {
    const url = new URL(href, typeof window !== "undefined" ? window.location.origin : "https://chastdushi.ru");
    if (url.hostname !== "max.ru") return false;
    const chatPath = SOCIAL_LINKS.maxChat.replace(/^https?:\/\/max\.ru/i, "");
    const channelPath = SOCIAL_LINKS.maxChannel.replace(/^https?:\/\/max\.ru/i, "");
    return (
      url.pathname.startsWith("/u/") ||
      url.pathname.includes("_biz") ||
      url.pathname === chatPath ||
      url.pathname === channelPath
    );
  } catch {
    return false;
  }
}

function isProposalDownloadHref(href: string): boolean {
  try {
    const url = new URL(href, typeof window !== "undefined" ? window.location.origin : "https://chastdushi.ru");
    return url.pathname.includes("/api/leads/proposal");
  } catch {
    return normalizeHref(href).includes("/api/leads/proposal");
  }
}

function trackHref(href: string) {
  if (isPhoneHref(href)) {
    trackMetrikaGoal(METRIKA_GOALS.phoneClick, { href });
    return;
  }
  if (isTelegramHref(href)) {
    trackMetrikaGoal(METRIKA_GOALS.telegramClick, { href });
    return;
  }
  if (isMaxMessengerHref(href)) {
    trackMetrikaGoal(METRIKA_GOALS.maxClick, { href });
    return;
  }
  if (isProposalDownloadHref(href)) {
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
