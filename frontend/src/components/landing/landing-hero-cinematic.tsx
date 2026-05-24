"use client";

import { useEffect, useState, type RefObject } from "react";
import { CmsImage } from "@/components/ui/cms-image";
import { cn } from "@/lib/utils";

export function LandingHeroCinematic({
  title,
  subtitle,
  tag,
  features = [],
  bannerImageDesktop,
  bannerImageMobile,
  spineOriginRef,
}: {
  title: string;
  subtitle: string;
  tag?: string;
  features?: string[];
  bannerImageDesktop?: string;
  bannerImageMobile?: string;
  /** Якорь оси timeline — нижняя граница hero-карточки */
  spineOriginRef?: RefObject<HTMLDivElement | null>;
}) {
  const [visible, setVisible] = useState(false);
  const image = bannerImageDesktop || bannerImageMobile || "/images/hero/hero-01.png";

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <section
      className="relative isolate -mt-[var(--site-header-banner-overlap)] scroll-mt-[var(--site-header-sticky-offset)]"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className={cn(
          "relative mx-auto w-full max-w-[1440px] overflow-hidden rounded-b-[1.75rem] md:rounded-b-[2.25rem] lg:rounded-b-[2.75rem]",
          "min-h-[min(72vh,760px)] md:min-h-[min(78vh,820px)]",
          "transition-all duration-700 ease-out",
        )}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
        }}
      >
        <div className="absolute inset-0">
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
            src={bannerImageMobile || image}
            alt=""
            fill
            priority
            className={cn("object-cover", bannerImageDesktop ? "md:hidden" : "")}
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--bg) 92%, transparent) 0%, color-mix(in srgb, var(--bg) 35%, transparent) 42%, transparent 72%)",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              background:
                "linear-gradient(to right, color-mix(in srgb, var(--bg) 88%, transparent) 0%, transparent 55%)",
            }}
            aria-hidden
          />
        </div>

        <div className="relative z-[1] flex min-h-[inherit] flex-col justify-end px-5 pb-14 pt-[calc(var(--site-header-sticky-offset)+2.5rem)] md:px-10 md:pb-16 lg:px-14 lg:pb-20">
          {tag ? (
            <span
              className="mb-4 inline-block max-w-xl text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[11px]"
              style={{ color: "color-mix(in srgb, var(--text) 72%, transparent)" }}
            >
              {tag}
            </span>
          ) : null}
          <h1
            className="font-heading max-w-3xl text-[clamp(1.65rem,4.5vw,3.15rem)] font-bold leading-[1.08] tracking-tight"
            style={{ color: "var(--text)" }}
          >
            {title}
          </h1>
          <p
            className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-base md:mt-5"
            style={{ color: "color-mix(in srgb, var(--text) 78%, transparent)" }}
          >
            {subtitle}
          </p>
          {features.length > 0 ? (
            <ul className="mt-6 flex max-w-2xl flex-col gap-2 sm:mt-8">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2.5 text-sm leading-snug"
                  style={{ color: "color-mix(in srgb, var(--text) 70%, transparent)" }}
                >
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div
          ref={spineOriginRef}
          data-story-spine-origin
          className="pointer-events-none absolute bottom-0 left-1/2 z-[2] h-px w-px -translate-x-1/2"
          aria-hidden
        />
      </div>
    </section>
  );
}
