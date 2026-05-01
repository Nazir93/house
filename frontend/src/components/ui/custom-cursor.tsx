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
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const hoveringRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (isLowPerfDevice()) return;
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    setVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };

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

    let animationId: number;
    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.25;
      pos.current.y += (target.current.y - pos.current.y) * 0.25;

      if (blobRef.current) {
        blobRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }

      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
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
          willChange: "transform",
        }}
      >
        <svg viewBox="0 0 56 56" fill="none" className="w-full h-full" aria-hidden>
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
