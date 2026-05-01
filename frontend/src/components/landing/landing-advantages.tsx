"use client";

import { useState, useRef, useEffect } from "react";
import {
  Wrench,
  FileText,
  Zap,
  Shield,
  Users,
  Smartphone,
  Sun,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  wrench: Wrench,
  "file-text": FileText,
  zap: Zap,
  shield: Shield,
  users: Users,
  smartphone: Smartphone,
  sun: Sun,
};

interface AdvantageItem {
  icon: string;
  title: string;
  description: string;
}

interface LandingAdvantagesProps {
  title: string;
  items: AdvantageItem[];
}

function AdvantageCard({ item, index }: { item: AdvantageItem; index: number }) {
  const [hovered, setHovered] = useState(false);
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
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const Icon = ICON_MAP[item.icon] || Zap;

  return (
    <div
      ref={ref}
      className="relative p-6 sm:p-8 md:p-10 rounded-2xl transition-all duration-500 cursor-default"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: hovered ? "var(--text)" : "transparent",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${(index % 3) * 100}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start justify-between mb-8">
        <Icon
          size={28}
          strokeWidth={1.5}
          className="transition-colors duration-500"
          style={{ color: hovered ? "var(--bg)" : "var(--accent)" }}
        />
        <span
          className="font-heading text-4xl leading-none transition-colors duration-500"
          style={{ color: hovered ? "rgba(var(--bg-rgb), 0.15)" : "var(--border)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3
        className="font-heading text-xl md:text-2xl mb-3 transition-colors duration-500"
        style={{ color: hovered ? "var(--bg)" : "var(--text)" }}
      >
        {item.title}
      </h3>
      <p
        className="text-sm leading-relaxed transition-colors duration-500"
        style={{ color: hovered ? "var(--bg)" : "var(--text-muted)" }}
      >
        {item.description}
      </p>
    </div>
  );
}

export function LandingAdvantages({ title, items }: LandingAdvantagesProps) {
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
    <section ref={ref} className="py-16 sm:py-24 md:py-32" style={{ backgroundColor: "var(--bg)" }}>
      <div className="container mx-auto">
        <h2
          className="font-heading text-xl sm:text-2xl md:text-3xl mb-8 sm:mb-12 max-w-3xl break-words transition-all duration-700"
          style={{
            color: "var(--text)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
          }}
        >
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <AdvantageCard key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
