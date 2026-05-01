import { SITE_NAME, CITY } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { CompanyPageHeader } from "@/components/company/company-page-header";
import { Section } from "@/components/ui/section";
import { Briefcase } from "lucide-react";

export async function generateMetadata() {
  return getPageMeta({
    title: `Вакансии | ${SITE_NAME}`,
    description: `Вакансии ${SITE_NAME} в ${CITY}. Актуальные предложения о работе в строительной компании.`,
    path: "/partners/vacancies",
    keywords: ["вакансии", "работа", SITE_NAME, CITY],
  });
}

export default function PartnersVacanciesPage() {
  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <CompanyPageHeader
        breadcrumbCurrent="Вакансии"
        title="Вакансии"
        description={`Карьера в ${SITE_NAME}: офис и производственные роли в ${CITY} и регионе.`}
      />
      <Section dark className="!border-t-0 !pt-4 pb-16 md:!pt-6 md:pb-24">
        <div className="mx-auto max-w-2xl px-4">
          <div
            className="rounded-2xl px-6 py-10 text-center sm:px-10 sm:py-12"
            style={{
              border: "1px solid var(--border)",
              backgroundColor: "var(--card-bg)",
            }}
          >
            <div className="mb-6 flex justify-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: "rgba(15,61,46,0.08)",
                  border: "1px solid rgba(15,61,46,0.2)",
                }}
              >
                <Briefcase size={26} style={{ color: "var(--accent)" }} aria-hidden />
              </div>
            </div>
            <p className="font-heading text-xl sm:text-2xl" style={{ color: "var(--text)" }}>
              Нет свободных вакансий
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
              Следите за обновлениями на сайте или напишите через раздел «Контакты» — мы сохраним резюме и свяжемся при появлении позиции.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
