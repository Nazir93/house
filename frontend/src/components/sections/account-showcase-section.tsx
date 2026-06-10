import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { ACCOUNT_SHOWCASE_ITEMS } from "@/lib/account-showcase";
import { ACCOUNT_SHOWCASE_ICON_BY_ID } from "@/lib/account-showcase-icons";
import { AccountShowcaseMockup } from "@/components/sections/account-showcase-mockup";
import { cn } from "@/lib/utils";

export function AccountShowcaseSection() {
  return (
    <section
      id="account-showcase"
      data-reveal="section"
      className="relative scroll-mt-[var(--site-header-sticky-offset)] border-t border-[var(--border)]"
      style={{ backgroundColor: "var(--bg)" }}
      aria-labelledby="account-showcase-heading"
    >
      <div className="container relative z-[1] mx-auto max-w-[1180px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.6fr)] lg:items-end">
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
      </div>

      <div className="relative">
        {ACCOUNT_SHOWCASE_ITEMS.map((item, index) => {
          const Icon = ACCOUNT_SHOWCASE_ICON_BY_ID[item.id];
          return (
            <article
              key={item.id}
              data-reveal="card"
              className={cn(
                "relative w-full border-t border-[var(--border)] bg-[var(--bg-secondary)]",
                "min-h-[34rem] lg:min-h-[calc(100dvh-var(--site-header-sticky-offset))]",
                "lg:sticky lg:top-[var(--site-header-sticky-offset)]",
              )}
              style={{
                zIndex: index + 2,
                "--reveal-delay": `${index * 80}ms`,
              } as CSSProperties}
            >
              <div className="mx-auto grid h-full w-full max-w-[1380px] grid-cols-1 lg:min-h-[inherit] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-10 lg:px-8 xl:px-12">
                <div className="flex flex-col justify-center px-4 py-10 sm:px-6 lg:px-0 lg:py-14">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.accent }} aria-hidden />
                      {item.index}
                    </div>
                    <div className="mt-7 flex items-center gap-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_14px_40px_color-mix(in_srgb,var(--accent)_28%,transparent)]">
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

                <div className="relative min-h-[19rem] lg:min-h-[inherit]">
                  <AccountShowcaseMockup
                    itemId={item.id}
                    image={item.image}
                    images={item.images}
                    metrics={item.metrics}
                    fullBleed
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div
        className="relative z-[20] border-t border-[var(--border)]"
        style={{ backgroundColor: "var(--bg)" }}
      >
        <div className="container mx-auto flex max-w-[1180px] flex-col gap-3 px-4 py-10 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
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
