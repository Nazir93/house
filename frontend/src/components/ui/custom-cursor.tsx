"use client";

import { useEffect, useRef, useState } from "react";
import { isLowPerfDevice } from "@/lib/use-perf";

const HOVER_SELECTOR = "a, button, [role='button'], input, textarea, select, [data-cursor-hover]";

function isHoverTarget(el: Element | null): boolean {
  if (!el) return false;
  return el.closest(HOVER_SELECTOR) !== null;
}

export function CustomCursor() {
  const blobRef = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (isLowPerfDevice()) return;
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    } catch {
      /* ignore */
    }

    setVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
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

    const handleMouseEnter = () => setVisible(true);
    const handleMouseLeave = () => setVisible(false);

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!visible) return null;

  const size = hovering ? 40 : 32;

  return (
    <>
      <style>{`@media (hover: hover) and (pointer: fine) { * { cursor: none !important; } }`}</style>

      <div
        ref={blobRef}
        className="fixed pointer-events-none z-[9999]"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          opacity: 1,
          transition: "width 0.2s ease, height 0.2s ease",
          transform: "translate3d(-100px, -100px, 0)",
        }}
      >
        <svg viewBox="0 0 56 56" fill="none" className="h-full w-full" aria-hidden>
          <circle
            cx="28"
            cy="28"
            r="22"
            stroke="rgba(15,61,46,0.95)"
            strokeWidth="1.75"
            fill={hovering ? "rgba(15,61,46,0.12)" : "rgba(255,255,255,0.07)"}
          />
          <circle cx="28" cy="28" r="4" fill="rgba(15,61,46,1)" />
        </svg>
      </div>
    </>
  );
}
