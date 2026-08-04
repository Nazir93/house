import type { CSSProperties } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import {
  ACCOUNT_SHOWCASE_ITEMS,
  ACCOUNT_SHOWCASE_SECTION_CALLOUT,
  ACCOUNT_SHOWCASE_SECTION_EYEBROW,
  ACCOUNT_SHOWCASE_SECTION_INTRO,
  ACCOUNT_SHOWCASE_SECTION_TITLE,
} from "@/lib/account-showcase";
import { ACCOUNT_SHOWCASE_ICON_BY_ID } from "@/lib/account-showcase-icons";
import { AccountShowcaseFooter } from "@/components/sections/account-showcase-footer";
import { AccountShowcaseMockup } from "@/components/sections/account-showcase-mockup";

export function AccountShowcaseSection() {
  return (
    <section
      id="account-showcase"
      className="relative overflow-clip scroll-mt-[var(--site-header-sticky-offset)] border-t border-[var(--border)] py-12 sm:py-16 lg:py-28"
      style={{ backgroundColor: "var(--bg)" }}
      aria-labelledby="account-showcase-heading"
    >
      <div className="container relative z-[1] mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div
          data-reveal="section"
          className="relative z-10 mb-8 grid gap-5 bg-[var(--bg)] sm:mb-10 sm:gap-6 lg:mb-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.6fr)] lg:items-end"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)] sm:text-[11px]">
              {ACCOUNT_SHOWCASE_SECTION_EYEBROW}
            </p>
            <h2
              id="account-showcase-heading"
              className="mt-3 max-w-4xl text-balance font-heading text-[clamp(1.35rem,5.4vw,2.45rem)] font-bold leading-[1.12] tracking-tight text-[var(--text)] sm:mt-3.5 sm:leading-[1.08]"
            >
              {ACCOUNT_SHOWCASE_SECTION_TITLE}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:mt-5 sm:text-[15px]">
              {ACCOUNT_SHOWCASE_SECTION_INTRO}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-secondary)_72%,transparent)] p-4 shadow-[0_16px_50px_rgba(15,61,46,0.08)] sm:rounded-[1.4rem] sm:p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.9} aria-hidden />
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                {ACCOUNT_SHOWCASE_SECTION_CALLOUT}
              </p>
            </div>
          </div>
        </div>

        <div className="relative space-y-0">
          {ACCOUNT_SHOWCASE_ITEMS.map((item, index) => {
            const Icon = ACCOUNT_SHOWCASE_ICON_BY_ID[item.id];
            return (
              <article
                key={item.id}
                data-reveal="card"
                className="group relative sticky grid min-h-[calc(100dvh-var(--site-header-sticky-offset)-var(--mobile-bottom-nav-offset))] grid-rows-[auto_minmax(22rem,1fr)] overflow-hidden bg-[var(--bg)] lg:min-h-[38rem] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:grid-rows-none lg:gap-6"
                style={{
                  top: "var(--site-header-sticky-offset)",
                  zIndex: index + 1,
                  "--reveal-delay": `${index * 80}ms`,
                } as CSSProperties}
              >
                <div className="flex min-h-[22rem] flex-col justify-between p-5 sm:p-7 lg:min-h-[38rem] lg:p-10">
                  <div>
                    <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {item.index}
                    </div>
                    <div className="mt-7 flex items-center gap-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)]">
                        <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden />
                      </span>
                      <h3 className="font-heading text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                        {item.headline}
                      </h3>
                    </div>
                    <p className="mt-5 max-w-lg text-sm leading-relaxed text-[var(--text-muted)] sm:text-[15px]">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-8 space-y-3">
                    {item.points.map((point) => (
                      <div key={point} className="flex items-center gap-3 text-sm font-medium text-[var(--text)]">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={2} aria-hidden />
                        {point}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex min-h-[22rem] w-full flex-1 flex-col px-4 pb-4 pt-0 sm:px-6 sm:pb-6 lg:min-h-[38rem] lg:flex-none lg:items-stretch lg:py-8 lg:pr-10 lg:pl-0">
                  <AccountShowcaseMockup
                    itemId={item.id}
                    image={item.image}
                    images={item.images}
                    metrics={item.metrics}
                  />
                </div>
              </article>
            );
          })}
        </div>

        <div className="relative z-[20]" style={{ backgroundColor: "var(--bg)" }}>
          <AccountShowcaseFooter />
        </div>
      </div>
    </section>
  );
}
