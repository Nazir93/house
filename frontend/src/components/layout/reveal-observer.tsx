"use client";

import { useEffect } from "react";

const VISIBLE_CLASS = "is-visible";
const READY_CLASS = "reveal-animations-ready";

function isInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh * 0.88 && rect.bottom > 0;
}

/**
 * Запускаем только после гидратации (useEffect), иначе classList.add ломает SSR-сверку.
 */
export function RevealObserver() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (reduced || typeof IntersectionObserver === "undefined") {
      elements.forEach((el) => el.classList.add(VISIBLE_CLASS));
      return;
    }

    const markVisibleIfInView = (el: HTMLElement) => {
      if (el.classList.contains(VISIBLE_CLASS)) return true;
      if (isInViewport(el)) {
        el.classList.add(VISIBLE_CLASS);
        return true;
      }
      return false;
    };

    elements.forEach((el) => markVisibleIfInView(el));
    document.documentElement.classList.add(READY_CLASS);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(VISIBLE_CLASS);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.08 }
    );

    const observe = (el: HTMLElement) => {
      if (el.classList.contains(VISIBLE_CLASS)) return;
      io.observe(el);
    };

    elements.forEach((el) => observe(el));

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches("[data-reveal]")) {
            if (!markVisibleIfInView(node)) observe(node);
          }
          node.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
            if (!markVisibleIfInView(el)) observe(el);
          });
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      document.documentElement.classList.remove(READY_CLASS);
    };
  }, []);

  return null;
}
