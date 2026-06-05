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
  fullBleed = false,
}: {
  title: string;
  subtitle: string;
  tag?: string;
  features?: string[];
  bannerImageDesktop?: string;
  bannerImageMobile?: string;
  /** Якорь оси timeline — нижняя граница hero-карточки */
  spineOriginRef?: RefObject<HTMLDivElement | null>;
  /** Баннер на весь экран (страница проектирования) */
  fullBleed?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const image = bannerImageDesktop || bannerImageMobile || "/images/hero/hero-01.png";

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <section
      className={cn(
        "relative isolate -mt-[var(--site-header-banner-overlap)] scroll-mt-[var(--site-header-sticky-offset)] pointer-events-none",
        fullBleed && "bg-[var(--bg)]"
      )}
      style={fullBleed ? undefined : { backgroundColor: "var(--bg)" }}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden transition-all duration-700 ease-out",
          fullBleed
            ? "min-h-[min(74svh,720px)]"
            : "mx-auto max-w-[1440px] min-h-[min(72vh,760px)] md:min-h-[min(78vh,820px)] rounded-b-[1.75rem] md:rounded-b-[2.25rem] lg:rounded-b-[2.75rem]"
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
              unoptimized={fullBleed}
              className={cn("object-cover object-center", bannerImageMobile ? "hidden md:block" : "")}
              sizes="100vw"
            />
          ) : null}
          <CmsImage
            src={bannerImageMobile || image}
            alt=""
            fill
            priority
            unoptimized={fullBleed}
            className={cn("object-cover object-center", bannerImageDesktop ? "md:hidden" : "")}
            sizes="100vw"
          />
          {!fullBleed ? (
            <>
              <div
                className="absolute inset-0"
                aria-hidden
                style={{
                  background:
                    "linear-gradient(to top, color-mix(in srgb, var(--bg) 92%, transparent) 0%, color-mix(in srgb, var(--bg) 35%, transparent) 42%, transparent 72%)",
                }}
              />
              <div
                className="absolute inset-0 hidden md:block"
                style={{
                  background:
                    "linear-gradient(to right, color-mix(in srgb, var(--bg) 88%, transparent) 0%, transparent 55%)",
                }}
                aria-hidden
              />
            </>
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to right, var(--bg) 0%, color-mix(in srgb, var(--bg) 96%, transparent) 18%, color-mix(in srgb, var(--bg) 72%, transparent) 38%, color-mix(in srgb, var(--bg) 20%, transparent) 58%, transparent 76%)",
                }}
                aria-hidden
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, color-mix(in srgb, var(--bg) 58%, transparent) 0%, transparent 22%, transparent 76%, var(--bg) 100%)",
                }}
                aria-hidden
              />
              <div
                className="absolute inset-y-0 left-0 w-[55%]"
                style={{
                  background:
                    "radial-gradient(circle at 18% 42%, color-mix(in srgb, var(--bg) 76%, white) 0%, color-mix(in srgb, var(--bg) 88%, transparent) 34%, transparent 72%)",
                }}
                aria-hidden
              />
            </>
          )}
        </div>

        <div
          className={cn(
            "relative z-[1] flex flex-col pointer-events-auto",
            fullBleed
              ? "min-h-[min(74svh,720px)] justify-center items-start px-5 pt-[calc(var(--site-header-sticky-offset)+2rem)] pb-12 sm:px-8 md:px-12 lg:px-16 xl:px-20"
              : "min-h-[inherit] justify-end px-5 pb-14 pt-[calc(var(--site-header-sticky-offset)+2.5rem)] md:px-10 md:pb-16 lg:px-14 lg:pb-20"
          )}
        >
          <div className={cn(fullBleed ? "w-full max-w-[1320px] text-left" : "container mx-auto w-full max-w-[1320px]")}>
            {tag ? (
              <span
                className={cn(
                  "mb-3 inline-block max-w-xl font-semibold uppercase tracking-[0.14em] sm:mb-4",
                  fullBleed ? "text-[11px] sm:text-xs" : "text-[10px] sm:text-[11px]"
                )}
                style={{ color: fullBleed ? "color-mix(in srgb, var(--text) 36%, transparent)" : "color-mix(in srgb, var(--text) 72%, transparent)" }}
              >
                {tag}
              </span>
            ) : null}
            <h1
              className={cn(
                "font-heading font-bold leading-[1.02] tracking-tight",
                fullBleed
                  ? "max-w-[25rem] text-[clamp(2.2rem,5.2vw,4.6rem)] font-medium tracking-[-0.04em]"
                  : "max-w-3xl text-[clamp(1.65rem,4.5vw,3.15rem)]"
              )}
              style={{ color: "var(--text)" }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                className={cn(
                  "leading-relaxed",
                  fullBleed
                    ? "mt-14 max-w-[18rem] text-sm sm:text-[15px] md:leading-[1.7]"
                    : "mt-4 max-w-2xl text-sm sm:text-base md:mt-5"
                )}
                style={{ color: fullBleed ? "color-mix(in srgb, var(--text) 72%, transparent)" : "color-mix(in srgb, var(--text) 78%, transparent)" }}
              >
                {subtitle}
              </p>
            ) : null}
            {fullBleed ? <div className="mt-10 h-px w-14 bg-[color-mix(in_srgb,var(--text)_55%,transparent)]" aria-hidden /> : null}
            {!fullBleed && features.length > 0 ? (
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
