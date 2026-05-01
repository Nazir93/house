"use client";

import { useRef, useState, useEffect } from "react";

interface LandingPainProps {
  title: string;
  points: string[];
  conclusion: string;
}

export function LandingPain({ title, points, conclusion }: LandingPainProps) {
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
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 sm:py-24 md:py-32" style={{ backgroundColor: "var(--bg)" }}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-20">
          {/* Left: sticky title */}
          <div className="md:sticky md:top-32 md:self-start">
            <h2
              className="font-heading text-xl sm:text-2xl md:text-3xl leading-tight break-words transition-all duration-700"
              style={{
                color: "var(--text)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
              }}
            >
              {title}
            </h2>
            <p
              className="text-base sm:text-lg font-medium mt-6 sm:mt-8 max-w-sm transition-all duration-700"
              style={{
                color: "var(--text)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transitionDelay: "100ms",
              }}
            >
              {conclusion}
            </p>
          </div>

          {/* Right: pain points */}
          <div>
            {points.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-5 py-6 border-b transition-all duration-700"
                style={{
                  borderColor: "var(--border)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(40px)",
                  transitionDelay: `${i * 100 + 150}ms`,
                }}
              >
                <span
                  className="font-heading text-2xl md:text-3xl leading-none mt-0.5 shrink-0"
                  style={{ color: "var(--accent)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
