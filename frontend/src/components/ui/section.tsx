"use client";

import { cn } from "@/lib/utils";
import { SECTION_LEAD_CLASSNAME } from "@/lib/responsive-copy";
import { HTMLAttributes, useEffect, useRef, useState } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  dark?: boolean;
}

export function Section({
  className,
  dark = false,
  children,
  id,
  ...props
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "py-20 md:py-32 transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{
        backgroundColor: dark ? "var(--bg-secondary)" : "var(--bg)",
        color: "var(--text)",
        borderBottom: "1px solid var(--border)",
      }}
      {...props}
    >
      <div className="container mx-auto">{children}</div>
    </section>
  );
}

export function SectionTitle({
  children,
  className,
  subtitle,
}: {
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}) {
  return (
    <div className={cn("mb-16 md:mb-20", className)}>
      <h2 className="mb-4 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
        {children}
      </h2>
      {subtitle && (
        <p className={cn(SECTION_LEAD_CLASSNAME, "text-base md:text-lg")} style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
