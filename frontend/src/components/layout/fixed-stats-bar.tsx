"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { STATS } from "@/lib/constants";
import { useThrottledScroll } from "@/lib/use-throttled-scroll";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          timerRef.current = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              if (timerRef.current) clearInterval(timerRef.current);
              timerRef.current = null;
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString("ru-RU")}
      {suffix}
    </span>
  );
}

export function FixedStatsBar() {
  const [show, setShow] = useState(false);

  const handleScroll = useCallback(() => {
    const aboutSection = document.getElementById("about");
    const footer = document.querySelector("footer");
    if (!aboutSection) return;

    const aboutRect = aboutSection.getBoundingClientRect();
    const reachedAbout = aboutRect.top <= window.innerHeight * 0.5;

    let reachedFooter = false;
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      reachedFooter = footerRect.top <= window.innerHeight;
    }

    setShow(reachedAbout && !reachedFooter);
  }, []);

  useThrottledScroll(handleScroll, 50);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[40] border-t transition-all duration-500 hidden lg:block"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "var(--bg)",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(100%)",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 py-2 sm:py-2.5 md:py-3 gap-y-2 sm:gap-y-2.5">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className={`group relative px-2 sm:px-3 md:px-4 ${stat.detail ? "cursor-default" : ""}`}
            >
              {stat.detail ? (
                <div
                  className="pointer-events-none absolute bottom-full left-1/2 z-[50] mb-2 w-[min(100vw-2rem,18rem)] -translate-x-1/2 rounded-lg border px-3 py-2 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border)",
                  }}
                >
                  <p
                    className="text-center text-[10px] leading-snug normal-case tracking-normal"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {stat.detail}
                  </p>
                </div>
              ) : null}
              <div
                className="mb-0.5 font-heading text-lg tabular-nums leading-none tracking-tight sm:text-xl md:text-[1.625rem] lg:text-[1.75rem]"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p
                className="text-[8px] sm:text-[9px] md:text-[10px] leading-snug tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
