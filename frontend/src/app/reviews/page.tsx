import Link from "next/link";
import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME, CITY } from "@/lib/constants";
import { CompanyPageHeader } from "@/components/company/company-page-header";

const REVIEWS = [
  ["Семья Ивановых", "Помогли выбрать проект, адаптировали планировку и поэтапно показывали работы без лишней суеты."],
  ["Дом в ЛО", "Сроки и комплектация были понятны до старта строительства — удобно сравнивать с другими подрядчиками."],
  ["Частный заказчик", "После экскурсии по объекту проще было решить по материалам и планировке."],
] as const;

export async function generateMetadata() {
  return getPageMeta({
    title: `Отзывы | ${SITE_NAME}`,
    description: `Отзывы клиентов ${SITE_NAME} о строительстве загородных домов в ${CITY} и регионе.`,
    path: "/reviews",
    keywords: ["отзывы", "строительство домов", SITE_NAME, CITY],
  });
}

export default function ReviewsPage() {
  return (
    <div style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <CompanyPageHeader
        breadcrumbCurrent="Отзывы"
        title="Отзывы клиентов"
        description="Мнения тех, кто уже прошёл путь от проекта до готового дома."
      />
      <section className="pb-20 pt-4 md:pb-28">
        <div className="container mx-auto max-w-[1200px] px-5">
          <div className="grid gap-5 md:grid-cols-3">
            {REVIEWS.map(([author, text]) => (
              <article
                key={author}
                className="rounded-[1.25rem] border p-6 md:p-8"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {text}
                </p>
                <p className="mt-6 font-semibold" style={{ color: "var(--text)" }}>
                  {author}
                </p>
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
  );
}
