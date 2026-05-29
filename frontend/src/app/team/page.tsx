import Link from "next/link";
import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME, CITY } from "@/lib/constants";
import { CompanyPageHeader } from "@/components/company/company-page-header";
import { TeamMembersGrid } from "@/components/company/team-members-grid";
import { getPublicTeam } from "@/lib/get-public-team";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Команда | ${SITE_NAME}`,
    description: `Команда ${SITE_NAME}: специалисты по проектированию и строительству загородных домов в ${CITY} и регионе.`,
    path: "/team",
    keywords: ["команда", "строительство домов", SITE_NAME, CITY],
  });
}

export default async function TeamPage() {
  const members = await getPublicTeam();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Команда", path: "/team" },
        ]}
      />
      <div style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <CompanyPageHeader
          breadcrumbCurrent="Команда"
          title="Наша команда"
          description="Люди, которые ведут проект от идеи до сдачи объекта и отвечают за качество на площадке."
        />
        <section className="pb-16 pt-2 sm:pb-20 md:pb-28 md:pt-4" aria-labelledby="team-grid-heading">
          <h2 id="team-grid-heading" className="sr-only">
            Состав команды
          </h2>
          <div className="container mx-auto w-full max-w-[1200px] px-4 sm:px-5">
            <TeamMembersGrid members={members} />
          </div>
        </section>
      </div>
    </>
  );
}
