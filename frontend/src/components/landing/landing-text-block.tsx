"use client";

import { useRef, useState, useEffect } from "react";

interface LandingTextBlockProps {
  leftText: string;
  rightText: string;
  accent?: boolean;
}

export function LandingTextBlock({ leftText, rightText, accent }: LandingTextBlockProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-16 sm:py-24 md:py-32"
      style={{
        backgroundColor: accent ? "var(--bg-secondary)" : "var(--bg)",
        borderTop: accent ? "1px solid var(--border)" : undefined,
        borderBottom: accent ? "1px solid var(--border)" : undefined,
      }}
    >
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div
            className="min-w-0 transition-all duration-700 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-30px)",
            }}
          >
            <p className="text-sm md:text-base leading-relaxed break-words" style={{ color: "var(--text-muted)" }}>
              {leftText}
            </p>
          </div>
          <div
            className="min-w-0 transition-all duration-700 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(30px)",
              transitionDelay: "100ms",
            }}
          >
            <p className="text-sm md:text-base leading-relaxed break-words" style={{ color: "var(--text-muted)" }}>
              {rightText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
