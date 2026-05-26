import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

import { YANDEX_MAPS_RATING_SCORE, YANDEX_REVIEWS_URL } from "@/lib/constants";

/**
 * Блок под сеткой отзывов: текст как в макете + кнопка на Яндекс.Карты.
 */
export function YandexReviewsCta() {
  const href = YANDEX_REVIEWS_URL.trim();

  return (
    <section
      className="mt-10 border-t pt-8 sm:mt-12 sm:pt-10 lg:mt-14 lg:pt-12"
      style={{ borderColor: "var(--border)" }}
      aria-labelledby="yandex-reviews-cta-heading"
    >
      <div
        className="relative overflow-hidden rounded-2xl border px-4 py-6 sm:rounded-[1.5rem] sm:px-6 sm:py-8 md:px-10 md:py-10"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div
          className="pointer-events-none absolute -right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full opacity-[0.12] blur-3xl sm:h-52 sm:w-52"
          style={{ backgroundColor: "#fc3f1d" }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="min-w-0 text-center md:max-w-[58%] md:text-left">
            <h2
              id="yandex-reviews-cta-heading"
              className="sr-only"
            >
              Отзывы на Яндекс Картах
            </h2>
            <p
              className="text-[13px] leading-relaxed sm:text-sm md:text-[15px]"
              style={{ color: "var(--text-muted)" }}
            >
              Ещё оценки и публикации — в карточке компании на Яндексе или по запросу менеджера.{" "}
              <Link
                href="/contacts"
                className="font-semibold underline-offset-4 transition hover:underline"
                style={{ color: "var(--accent)" }}
              >
                Связаться
              </Link>
            </p>
          </div>

          {href ? (
            <div className="flex w-full shrink-0 justify-center md:w-auto md:justify-end">
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full max-w-md touch-manipulation flex-col gap-3 rounded-2xl border bg-[var(--bg)] p-4 shadow-sm transition hover:shadow-md sm:max-w-none sm:min-w-[280px] sm:p-5 md:min-w-[300px]"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FC3F1D] text-xl font-black text-white shadow-[0_8px_24px_rgba(252,63,29,0.4)] transition group-hover:scale-[1.02]">
                    Я
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Яндекс Карты
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <div className="flex gap-0.5 text-[var(--accent)]" aria-hidden>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                        ))}
                      </div>
                      <span className="text-lg font-bold tabular-nums text-[var(--text)]">
                        {YANDEX_MAPS_RATING_SCORE}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#FC3F1D] px-5 py-3 text-[13px] font-bold uppercase tracking-[0.07em] text-white shadow-[0_10px_28px_rgba(252,63,29,0.35)] transition group-hover:brightness-110 sm:text-sm">
                  Отзывы на Яндексе
                  <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                </span>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
