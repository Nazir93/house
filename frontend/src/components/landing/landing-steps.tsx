"use client";

import { useRef, useState, useEffect } from "react";

interface Step {
  title: string;
  description: string;
}

interface LandingStepsProps {
  title: string;
  steps: Step[];
}

function StepRow({ step, index, total }: { step: Step; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
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
    <div
      ref={ref}
      className="grid grid-cols-12 py-6 sm:py-8 md:py-10 border-b transition-all duration-700 ease-out"
      style={{
        borderColor: "var(--border)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${index * 120}ms`,
      }}
    >
      {/* Number */}
      <div className="col-span-2 md:col-span-1">
        <span className="font-heading text-3xl md:text-4xl leading-none" style={{ color: "var(--accent)" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Title */}
      <div className="col-span-10 md:col-span-4">
        <h3 className="font-heading text-xl md:text-2xl" style={{ color: "var(--text)" }}>
          {step.title}
        </h3>
      </div>

      {/* Description */}
      <div className="col-span-10 col-start-3 md:col-span-5 md:col-start-6 mt-2 md:mt-0">
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {step.description}
        </p>
      </div>

      {/* Progress */}
      <div className="hidden md:flex col-span-2 items-center justify-end">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>
          {index + 1} / {total}
        </span>
      </div>
    </div>
  );
}

export function LandingSteps({ title, steps }: LandingStepsProps) {
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
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-16 sm:py-24 md:py-32"
      style={{ backgroundColor: "var(--bg-secondary)", borderTop: "1px solid var(--border)" }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
          <h2
            className="font-heading text-xl sm:text-2xl md:text-3xl max-w-2xl break-words transition-all duration-700"
            style={{
              color: "var(--text)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
            }}
          >
            {title}
          </h2>
          <span
            className="hidden md:block text-[10px] uppercase tracking-[0.15em] transition-all duration-700"
            style={{
              color: "var(--text-muted)",
              opacity: visible ? 1 : 0,
              transitionDelay: "200ms",
            }}
          >
            Этапы работы
          </span>
        </div>

        <div className="border-t" style={{ borderColor: "var(--border)" }}>
          {steps.map((step, i) => (
            <StepRow key={i} step={step} index={i} total={steps.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
