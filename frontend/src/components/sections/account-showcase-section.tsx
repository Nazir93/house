import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { ACCOUNT_SHOWCASE_ITEMS } from "@/lib/account-showcase";
import { AccountShowcaseMockup } from "@/components/sections/account-showcase-mockup";

export function AccountShowcaseSection() {
  return (
    <section
      id="account-showcase"
      data-reveal="section"
      className="relative overflow-clip border-t border-[var(--border)] py-16 sm:py-20 lg:py-28"
      style={{ backgroundColor: "var(--bg)" }}
      aria-labelledby="account-showcase-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_62%)]"
        aria-hidden
      />
      <div className="container relative z-[1] mx-auto max-w-[1180px]">
        <div className="mb-10 grid gap-6 lg:mb-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.6fr)] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Личный кабинет клиента
            </p>
            <h2
              id="account-showcase-heading"
              className="mt-3 max-w-4xl text-balance font-heading text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl md:text-[2.45rem] md:leading-[1.08]"
            >
              Показываем стройку так, чтобы клиент видел порядок, сроки и деньги
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-[15px]">
              Это не просто вход по договору. В кабинете собраны этапы, фотоотчёты, документы и платежи — поэтому
              заказчик понимает, что происходит на объекте, а компания выглядит системно и прозрачно.
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-secondary)_72%,transparent)] p-5 shadow-[0_16px_50px_rgba(15,61,46,0.08)]">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" strokeWidth={1.9} aria-hidden />
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                Сильная сторона ЛК — он снимает тревогу клиента: всё видно, всё хранится, по каждому объекту есть
                понятная история.
              </p>
            </div>
          </div>
        </div>

        <div className="relative space-y-6 lg:space-y-0">
          {ACCOUNT_SHOWCASE_ITEMS.map((item, index) => {
            const Icon = item.Icon;
            return (
              <article
                key={item.id}
                data-reveal="card"
                className="group relative grid min-h-[34rem] overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg-secondary)] shadow-[0_20px_70px_rgba(15,61,46,0.11)] lg:sticky lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-8"
                style={{
                  top: `calc(var(--site-header-sticky-offset) + ${index * 1.15}rem + 1.5rem)`,
                  zIndex: index + 1,
                  "--reveal-delay": `${index * 80}ms`,
                } as CSSProperties}
              >
                <div className="flex min-h-[22rem] flex-col justify-between p-6 sm:p-8 lg:min-h-[34rem] lg:p-10">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.accent }} aria-hidden />
                      {item.kicker}
                    </div>
                    <div className="mt-7 flex items-center gap-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_14px_40px_color-mix(in_srgb,var(--accent)_28%,transparent)]">
                        <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden />
                      </span>
                      <h3 className="font-heading text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                        {item.title}
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

                <div className="p-4 pt-0 sm:p-6 sm:pt-0 lg:p-8 lg:pl-0">
                  <AccountShowcaseMockup item={item} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
            Такой подход помогает продавать не обещание, а управляемый процесс: клиент видит, что стройка ведётся
            системно.
          </p>
          <Link
            href="/account/login"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[var(--accent-contrast)] shadow-[0_14px_40px_color-mix(in_srgb,var(--accent)_25%,transparent)] transition hover:bg-[var(--accent-hover)]"
          >
            Войти в кабинет
            <ArrowRight className="h-4 w-4" strokeWidth={2.1} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
