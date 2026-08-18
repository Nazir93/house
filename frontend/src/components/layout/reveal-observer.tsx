"use client";

import { useEffect } from "react";

const VISIBLE_CLASS = "is-visible";
const READY_CLASS = "reveal-animations-ready";

/**
 * Без синхронного getBoundingClientRect на всех [data-reveal] (forced layout в PSI).
 * READY включаем после первого кадра IO — above-the-fold успевает получить is-visible.
 */
export function RevealObserver() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (reduced || typeof IntersectionObserver === "undefined") {
      elements.forEach((el) => el.classList.add(VISIBLE_CLASS));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(VISIBLE_CLASS);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "12% 0px 12% 0px", threshold: 0.01 },
    );

    elements.forEach((el) => io.observe(el));

    let readyRaf = 0;
    readyRaf = window.requestAnimationFrame(() => {
      readyRaf = window.requestAnimationFrame(() => {
        document.documentElement.classList.add(READY_CLASS);
      });
    });

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches("[data-reveal]")) io.observe(node);
          node.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => io.observe(el));
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(readyRaf);
      mo.disconnect();
      io.disconnect();
      document.documentElement.classList.remove(READY_CLASS);
    };
  }, []);

  return null;
}
