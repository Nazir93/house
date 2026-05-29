import { SITE_NAME, CITY } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { getPublicVacancies } from "@/lib/get-public-vacancies";
import { CompanyPageHeader } from "@/components/company/company-page-header";
import { VacanciesList } from "@/components/partners/vacancies-list";
import { Section } from "@/components/ui/section";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Вакансии | ${SITE_NAME}`,
    description: `Вакансии ${SITE_NAME} в ${CITY}. Актуальные предложения о работе в строительной компании.`,
    path: "/partners/vacancies",
    keywords: ["вакансии", "работа", SITE_NAME, CITY],
  });
}

export default async function PartnersVacanciesPage() {
  const vacancies = await getPublicVacancies();

  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <CompanyPageHeader
        breadcrumbCurrent="Вакансии"
        title="Вакансии"
        description={`Карьера в ${SITE_NAME}: офис и производственные роли в ${CITY} и регионе.`}
      />
      <Section dark className="!border-t-0 !pt-4 pb-16 md:!pt-6 md:pb-24">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-5">
          <VacanciesList vacancies={vacancies} />
        </div>
      </Section>
    </div>
  );
}
