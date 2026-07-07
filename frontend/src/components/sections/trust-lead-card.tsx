import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TRUST_BENEFITS,
  TRUST_SECTION_QUOTE,
  TRUST_SECTION_QUOTE_ATTRIBUTION,
  TRUST_STATS,
  TRUST_WHY_EYEBROW,
  TRUST_WHY_INTRO,
  TRUST_WHY_TITLE_LINES,
} from "@/lib/trust-block-data";

export function TrustLeadCardShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border border-[var(--border)] md:rounded-[1.85rem]",
        "bg-gradient-to-br from-[var(--bg)] via-[var(--bg-secondary)]/45 to-[color-mix(in_srgb,var(--accent)_9%,var(--bg))]",
        "shadow-[0_22px_56px_rgba(15,61,46,0.08)] dark:from-[var(--bg)] dark:via-[var(--bg-secondary)]/30 dark:to-[var(--bg)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.35)]",
      )}
    >
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-[min(420px,85%)] w-[min(56%,480px)] -translate-y-1/2 rounded-[2rem] opacity-40 shadow-2xl dark:opacity-25"
        aria-hidden
      >
        <Image src="/images/banner/banner-hero-02.png" alt="" fill className="rounded-[2rem] object-cover" sizes="480px" />
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-l from-[var(--bg)] via-[var(--bg)]/70 to-transparent" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.65] dark:opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle_at_12%_20%, color-mix(in srgb, var(--accent) 14%, transparent) 0%, transparent 42%), radial-gradient(circle_at_88%_78%, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 38%)",
        }}
      />

      <div className="relative z-[1] px-5 py-8 md:px-8 md:py-10 lg:px-11 lg:py-12">{children}</div>
    </div>
  );
}

type TrustLeadCardBodyProps = {
  variant: "standalone" | "embedded";
  /** Вставка после шапки (логотипы партнёров на главной). */
  afterIntro?: ReactNode;
};

export function TrustLeadCardBody({ variant, afterIntro }: TrustLeadCardBodyProps) {
  const HeadingTag = "h2";
  const headingId = variant === "standalone" ? "trust-us-heading" : "trust-us-subheading";

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
            {TRUST_WHY_EYEBROW}
          </p>
          <HeadingTag
            id={headingId}
            className="mt-2.5 text-balance font-heading text-2xl font-bold uppercase tracking-tight text-[var(--text)] sm:text-3xl md:text-[2.25rem] md:leading-[1.12]"
          >
            {TRUST_WHY_TITLE_LINES.map((line, index) => (
              <span key={line} className={index > 0 ? "block" : undefined}>
                {line}
              </span>
            ))}
          </HeadingTag>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-[var(--text-muted)] sm:text-sm md:text-[15px]">
            {TRUST_WHY_INTRO}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-col xl:flex-row">
          <Link
            href="/reviews"
            className={cn(
              "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 text-[12px] font-bold uppercase tracking-[0.08em] shadow-md transition",
              "bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-[0.96] dark:shadow-none",
            )}
          >
            Отзывы клиентов
            <ArrowUpRight className="h-4 w-4 opacity-90" strokeWidth={2.25} aria-hidden />
          </Link>
          <Link
            href="/contacts"
            className={cn(
              "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-6 text-[12px] font-bold uppercase tracking-[0.08em] transition",
              "text-[var(--text)] hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] hover:bg-[var(--bg-secondary)]/60 dark:bg-[var(--bg)]/80",
            )}
          >
            Связаться с нами
            <ArrowUpRight className="h-4 w-4 opacity-80" strokeWidth={2.25} aria-hidden />
          </Link>
        </div>
      </div>

      {afterIntro}

      <ul className="mt-8 grid gap-4 sm:mt-9 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {TRUST_BENEFITS.map(({ title, description }) => (
          <li
            key={title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg)]/80 p-4 shadow-sm backdrop-blur-sm dark:bg-[var(--bg)]/60 dark:shadow-none"
          >
            <p className="font-heading text-[15px] font-bold leading-snug text-[var(--text)] sm:text-base">{title}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">{description}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {TRUST_STATS.map(({ icon: Icon, value, label, hint }) => (
          <div
            key={label}
            className={cn(
              "flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg)]/90 p-4 shadow-sm backdrop-blur-sm transition-colors",
              "dark:bg-[var(--bg)]/70 dark:shadow-none",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_12%,var(--bg-secondary))] text-[var(--accent)] dark:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)]">
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <p className="font-heading text-xl font-bold tabular-nums tracking-tight text-[var(--text)] sm:text-[1.35rem]">
                {value}
              </p>
            </div>
            <p className="mt-2 text-[13px] font-semibold leading-snug text-[var(--text)]">{label}</p>
            {hint ? (
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)] sm:text-[12px]">{hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <blockquote
        className={cn(
          "mt-8 rounded-2xl border border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_6%,var(--bg))] px-5 py-5 sm:mt-10 sm:px-6 sm:py-6",
          "dark:bg-[color-mix(in_srgb,var(--accent)_10%,var(--bg))]",
        )}
      >
        <p className="text-[15px] font-medium leading-relaxed text-[var(--text)] sm:text-base md:text-[17px]">
          «{TRUST_SECTION_QUOTE}»
        </p>
        <footer className="mt-3 text-[13px] font-semibold tracking-tight text-[var(--text-muted)] sm:text-sm">
          {TRUST_SECTION_QUOTE_ATTRIBUTION}
        </footer>
      </blockquote>
    </>
  );
}
