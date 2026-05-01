"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";

interface LandingShowcaseProps {
  label?: string;
  dark?: boolean;
  /** Фон секции (например то же фото, что в hero услуги) */
  imageUrl?: string;
}

export function LandingShowcase({
  label = "Фото / Видео объекта",
  dark = true,
  imageUrl,
}: LandingShowcaseProps) {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = (windowH - rect.top) / (windowH + rect.height);
      setOffset(progress * 60 - 30);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{
        backgroundColor: dark ? "#0a0a0a" : "var(--bg-secondary)",
        height: "clamp(220px, 50vh, 700px)",
      }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-100"
        style={{
          transform: `translateY(${offset}px) scale(1.1)`,
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized={imageUrl.startsWith("/uploads/")}
              />
              <div
                className="absolute inset-0 z-[1]"
                style={{
                  background: dark
                    ? "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.55))"
                    : "linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.35))",
                }}
              />
            </>
          ) : null}
          <span
            className={`relative z-[2] text-[10px] uppercase tracking-[0.2em] px-4 text-center ${imageUrl ? "text-white/95 drop-shadow-md" : ""}`}
            style={imageUrl ? undefined : { color: dark ? "rgba(255,255,255,0.3)" : "var(--text-subtle)" }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Gradient fades */}
      <div
        className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{
          background: dark
            ? "linear-gradient(to bottom, #0a0a0a, transparent)"
            : "linear-gradient(to bottom, var(--bg-secondary), transparent)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{
          background: dark
            ? "linear-gradient(to top, #0a0a0a, transparent)"
            : "linear-gradient(to top, var(--bg-secondary), transparent)",
        }}
      />
    </section>
  );
}
