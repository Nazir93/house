"use client";

import { Check } from "lucide-react";

import type { MortgagePageSettings } from "@/lib/mortgage-settings-schema";

export function MortgageTrustFooter({ settings }: { settings: MortgagePageSettings }) {
  const { trustBanks, trustBanksNote, trustPoints, trustDisclaimer } = settings;
  return (
    <section className="mt-16 rounded-[28px] border md:mt-20" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
      <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-12 md:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Банки-партнёры</p>
          <div className="mt-4 flex flex-wrap gap-4">
            {trustBanks.map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-xl border bg-[var(--bg)] px-4 py-3 font-heading text-sm font-bold uppercase tracking-wide text-[var(--text)]"
                style={{ borderColor: "var(--border)" }}
              >
                {name}
              </span>
            ))}
          </div>
          {trustBanksNote.trim() ? (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-[var(--text-muted)]">
              {trustBanksNote.trim()}
            </p>
          ) : null}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Почему с нами проще купить стройку в ипотеку</p>
          <ul className="mt-4 grid gap-3">
            {trustPoints.map((text) => (
              <li key={text} className="flex gap-3 text-sm leading-snug">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15">
                  <Check className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={2.5} aria-hidden />
                </span>
                <span style={{ color: "var(--text)" }}>{text}</span>
              </li>
            ))}
          </ul>
          {trustDisclaimer.trim() ? (
            <p className="mt-6 whitespace-pre-line text-[11px] leading-relaxed text-[var(--text-muted)]">
              {trustDisclaimer.trim()}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
