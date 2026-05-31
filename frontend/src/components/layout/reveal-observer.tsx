"use client";

import { useEffect } from "react";

const VISIBLE_CLASS = "is-visible";

export function RevealObserver() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => el.classList.add(VISIBLE_CLASS));
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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    const observe = (el: HTMLElement) => {
      if (el.classList.contains(VISIBLE_CLASS)) return;
      io.observe(el);
    };

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(observe);

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches("[data-reveal]")) observe(node);
          node.querySelectorAll<HTMLElement>("[data-reveal]").forEach(observe);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
