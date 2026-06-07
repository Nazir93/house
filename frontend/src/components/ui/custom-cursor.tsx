"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { isLowPerfDevice } from "@/lib/use-perf";

const HOVER_SELECTOR =
  "a, button, [role='button'], input, textarea, select, label[for], summary, [data-cursor-hover], .cursor-pointer";

function isHoverTarget(el: Element | null): boolean {
  if (!el) return false;
  return el.closest(HOVER_SELECTOR) !== null;
}

function shouldUseCustomCursor(): boolean {
  if (typeof window === "undefined") return false;
  if (isLowPerfDevice()) return false;
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return false;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;
  } catch {
    return false;
  }
  return true;
}

export function CustomCursor() {
  const { resolvedTheme } = useTheme();
  const blobRef = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  useLayoutEffect(() => {
    const active = shouldUseCustomCursor();
    setEnabled(active);
    if (active) {
      document.documentElement.classList.add("custom-cursor-active");
    }
    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setVisible(true);
      const node = blobRef.current;
      if (node) {
        node.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      const isHover = isHoverTarget(e.target as Element);
      if (isHover !== hoveringRef.current) {
        hoveringRef.current = isHover;
        setHovering(isHover);
      }
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);
    const handleWindowBlur = () => setVisible(false);
    const handleWindowFocus = () => setVisible(true);

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [enabled]);

  if (!enabled) return null;

  const size = hovering ? 40 : 32;

  return (
    <div
      ref={blobRef}
      className="custom-cursor-blob fixed pointer-events-none z-[10050]"
      data-theme={resolvedTheme}
      aria-hidden
      style={{
        width: `${size}px`,
        height: `${size}px`,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s ease, width 0.2s ease, height 0.2s ease",
        transform: "translate3d(-100px, -100px, 0)",
      }}
    >
      <svg viewBox="0 0 56 56" fill="none" className="h-full w-full" aria-hidden>
        <circle
          cx="28"
          cy="28"
          r="22"
          stroke="var(--cursor-blob-stroke)"
          strokeWidth="1.75"
          fill={hovering ? "var(--cursor-blob-ring-hover)" : "var(--cursor-blob-ring)"}
        />
        <circle cx="28" cy="28" r="4" fill="var(--cursor-blob-dot)" />
      </svg>
    </div>
  );
}
