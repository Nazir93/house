"use client";

import { useRef, useEffect, useState } from "react";
import { CmsImage } from "@/components/ui/cms-image";

interface LandingHeroProps {
  title: string;
  subtitle: string;
  service: string;
  tag: string;
  features: string[];
  goals: string;
  bannerImageDesktop?: string;
  bannerImageMobile?: string;
}

export function LandingHero({
  title,
  subtitle,
  tag,
  features,
  goals,
  bannerImageDesktop,
  bannerImageMobile,
}: LandingHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <section ref={ref} className="page-top-offset pb-12 sm:pb-14 md:pb-16" style={{ backgroundColor: "var(--bg)" }}>
      <div className="container mx-auto max-w-5xl">
        {/* Tag */}
        <div
          className="transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <span
            className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.12em] px-3 py-1.5 rounded-full mb-4 sm:mb-5"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            {tag}
          </span>
        </div>

        {/* Title — без vw/clamp, чтобы на широких экранах не раздувалось */}
        <h1
          className="mb-5 w-full max-w-none break-words font-heading text-xl leading-[1.2] tracking-tight transition-all duration-700 ease-out sm:mb-6 sm:text-2xl md:text-[1.85rem] lg:text-[2rem]"
          style={{
            color: "var(--text)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
            transitionDelay: "100ms",
          }}
        >
          {title}
        </h1>

        {(bannerImageDesktop || bannerImageMobile) && (
          <div
            className="mb-8 sm:mb-10 transition-all duration-700 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transitionDelay: "150ms",
            }}
          >
            <div className="relative h-[min(46vh,420px)] min-h-[180px] w-full overflow-hidden rounded-xl border border-[var(--border)]">
              {bannerImageDesktop ? (
                <CmsImage
                  src={bannerImageDesktop}
                  alt=""
                  fill
                  priority
                  className="hidden object-cover md:block"
                  sizes="100vw"
                />
              ) : null}
              <CmsImage
                src={(bannerImageMobile || bannerImageDesktop)!}
                alt=""
                fill
                priority
                className={`object-cover ${bannerImageDesktop ? "md:hidden" : ""}`}
                sizes="100vw"
              />
            </div>
          </div>
        )}

        {/* Две колонки: подпись и списки — min-w-0 против вылезания текста */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-14">
          <div
            className="min-w-0 transition-all duration-700 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transitionDelay: "200ms",
            }}
          >
            <p
              className="text-sm sm:text-base leading-relaxed break-words"
              style={{ color: "var(--text-muted)" }}
            >
              {subtitle}
            </p>
          </div>

          <div
            className="min-w-0 transition-all duration-700 ease-out"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transitionDelay: "280ms",
            }}
          >
            <ul className="space-y-2.5 mb-6 md:mb-8">
              {features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm leading-relaxed break-words"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="mt-2 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--accent)" }} />
                  {f}
                </li>
              ))}
            </ul>
            <div className="border-t pt-5" style={{ borderColor: "var(--border)" }}>
              <p className="text-[10px] uppercase tracking-[0.12em] font-semibold mb-2" style={{ color: "var(--text)" }}>
                Ключевые задачи:
              </p>
              <p className="text-sm leading-relaxed break-words" style={{ color: "var(--text-muted)" }}>
                {goals}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
