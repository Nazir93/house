import type { CSSProperties } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { ACCOUNT_SHOWCASE_ITEMS } from "@/lib/account-showcase";
import { ACCOUNT_SHOWCASE_ICON_BY_ID } from "@/lib/account-showcase-icons";
import { AccountShowcaseFooter } from "@/components/sections/account-showcase-footer";
import { AccountShowcaseMockup } from "@/components/sections/account-showcase-mockup";
import { cn } from "@/lib/utils";

export function AccountShowcaseSection() {
  return (
    <section
      id="account-showcase"
      data-reveal="section"
      className="relative overflow-clip scroll-mt-[var(--site-header-sticky-offset)] border-t border-[var(--border)] py-16 sm:py-20 lg:py-28"
      style={{ backgroundColor: "var(--bg)" }}
      aria-labelledby="account-showcase-heading"
    >
      <div className="container relative z-[1] mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
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
            const Icon = ACCOUNT_SHOWCASE_ICON_BY_ID[item.id];
            return (
              <article
                key={item.id}
                data-reveal="card"
                className={cn(
                  "group relative grid min-h-[34rem] overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--bg-secondary)]",
                  "lg:sticky lg:top-[var(--site-header-sticky-offset)] lg:min-h-[calc(100dvh-var(--site-header-sticky-offset))]",
                  "lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:gap-8",
                )}
                style={{
                  zIndex: index + 1,
                  "--reveal-delay": `${index * 80}ms`,
                } as CSSProperties}
              >
                <div className="flex min-h-[22rem] flex-col justify-between p-6 sm:p-8 lg:min-h-[inherit] lg:p-10">
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

                <div className="relative min-h-[19rem] p-6 sm:p-8 lg:min-h-[inherit] lg:p-10">
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
