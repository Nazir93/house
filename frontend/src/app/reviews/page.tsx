import Link from "next/link";
import { Star } from "lucide-react";
import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME, CITY } from "@/lib/constants";
import { CompanyPageHeader } from "@/components/company/company-page-header";
import { getPublicReviews } from "@/lib/get-public-reviews";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { RoundAvatar } from "@/components/ui/round-avatar";

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
        <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} aria-hidden />
      ))}
    </div>
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
      <div style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <CompanyPageHeader
          breadcrumbCurrent="Отзывы"
          title="Отзывы клиентов"
          description="Мнения тех, кто уже прошёл путь от проекта до готового дома."
        />
        <section className="pb-20 pt-4 md:pb-28" aria-labelledby="reviews-grid-heading">
          <h2 id="reviews-grid-heading" className="sr-only">
            Список отзывов
          </h2>
          <div className="container mx-auto max-w-[1200px] px-5">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="rounded-[1.25rem] border p-6 md:p-8 flex flex-col h-full"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
                >
                  <div className="flex items-start gap-4">
                    {r.authorPhoto ? (
                      <RoundAvatar src={r.authorPhoto} alt={`Фото: ${r.authorName}`} size={56} />
                    ) : (
                      <div
                        className="h-14 w-14 shrink-0 rounded-full flex items-center justify-center text-lg font-heading font-bold"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--accent) 15%, var(--bg))",
                          color: "var(--accent)",
                        }}
                        aria-hidden
                      >
                        {r.authorName.trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <StarsRow rating={r.rating} />
                      <p className="mt-2 font-semibold leading-snug" style={{ color: "var(--text)" }}>
                        {r.authorName}
                      </p>
                      {(r.objectName || r.serviceLabel) && (
                        <p className="mt-1 text-xs leading-snug" style={{ color: "var(--text-muted)" }}>
                          {[r.objectName, r.serviceLabel].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <p
                    className="mt-4 text-sm leading-relaxed flex-1 whitespace-pre-line"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {r.text}
                  </p>
                  {r.videoUrl ? (
                    <p className="mt-4">
                      <a
                        href={r.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium underline-offset-4 hover:underline"
                        style={{ color: "var(--accent)" }}
                      >
                        Видеоотзыв
                      </a>
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
            <p className="mt-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Ещё оценки и публикации — в карточке компании на Яндексе или по запросу менеджера.{" "}
              <Link href="/contacts" className="font-medium underline-offset-4 hover:underline" style={{ color: "var(--accent)" }}>
                Связаться
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
