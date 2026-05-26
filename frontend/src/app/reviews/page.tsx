import { Star } from "lucide-react";
import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME, CITY } from "@/lib/constants";
import { CompanyPageHeader } from "@/components/company/company-page-header";
import { getPublicReviews } from "@/lib/get-public-reviews";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { RoundAvatar } from "@/components/ui/round-avatar";
import { ReviewSubmitForm } from "@/components/reviews/review-submit-form";
import { YandexReviewsCta } from "@/components/reviews/yandex-reviews-cta";
import type { PublicReviewItem } from "@/lib/get-public-reviews";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Отзывы | ${SITE_NAME}`,
    description: `Отзывы клиентов ${SITE_NAME} о строительстве загородных домов в ${CITY} и регионе.`,
    path: "/reviews",
    keywords: ["отзывы", "строительство домов", SITE_NAME, CITY],
  });
}

function StarsRow({ rating }: { rating: number }) {
  const n = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <div className="flex gap-0.5 text-[var(--accent)]" aria-label={`Оценка ${n} из 5`}>
      {Array.from({ length: n }, (_, i) => (
        <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" strokeWidth={0} aria-hidden />
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: PublicReviewItem }) {
  const initial = r.authorName.trim().charAt(0).toUpperCase();
  const meta = [r.objectName, r.serviceLabel].filter(Boolean).join(" · ");

  return (
    <article
      className="flex h-full min-w-0 flex-col rounded-xl border p-4 sm:rounded-[1.25rem] sm:p-6 md:p-8"
      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {r.authorPhoto ? (
          <RoundAvatar src={r.authorPhoto} alt={`Фото: ${r.authorName}`} size={56} />
        ) : (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-heading font-bold sm:h-14 sm:w-14 sm:text-lg"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 15%, var(--bg))",
              color: "var(--accent)",
            }}
            aria-hidden
          >
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <StarsRow rating={r.rating} />
          <p
            className="mt-1.5 break-words text-[15px] font-semibold leading-snug sm:mt-2 sm:text-base"
            style={{ color: "var(--text)" }}
          >
            {r.authorName}
          </p>
          {meta ? (
            <p
              className="mt-0.5 break-words text-[11px] leading-snug sm:mt-1 sm:text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {meta}
            </p>
          ) : null}
        </div>
      </div>
      <p
        className="mt-3 flex-1 break-words text-[13px] leading-relaxed whitespace-pre-line sm:mt-4 sm:text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        {r.text}
      </p>
      {r.videoUrl ? (
        <p className="mt-3 sm:mt-4">
          <a
            href={r.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center text-sm font-medium underline-offset-4 hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Видеоотзыв
          </a>
        </p>
      ) : null}
    </article>
  );
}

export default async function ReviewsPage() {
  const reviews = await getPublicReviews();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Отзывы", path: "/reviews" },
        ]}
      />
      <div className="min-w-0 overflow-x-hidden" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <CompanyPageHeader
          breadcrumbCurrent="Отзывы"
          title="Отзывы клиентов"
          description="Мнения тех, кто уже прошёл путь от проекта до готового дома."
        />
        <section
          className="pb-[max(4rem,env(safe-area-inset-bottom,0px))] pt-2 sm:pb-20 sm:pt-4 md:pb-28"
          aria-labelledby="reviews-grid-heading"
        >
          <h2 id="reviews-grid-heading" className="sr-only">
            Список отзывов
          </h2>
          <div className="container mx-auto max-w-[1200px] min-w-0 px-4 sm:px-5 lg:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {reviews.map((r) => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </div>

            <YandexReviewsCta />

            <div className="mt-10 sm:mt-12 lg:mt-14">
              <ReviewSubmitForm />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
