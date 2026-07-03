import Link from "next/link";
import { getPageMeta, getPageMetaFields } from "@/lib/get-page-meta";
import { getBuiltObjects } from "@/lib/construction-data";
import { SITE_NAME, BUILT_HOMES_SECTION_LABEL } from "@/lib/constants";
import { PortfolioObjectMapExplorer } from "@/components/portfolio/portfolio-object-map-explorer";
import { parseBuiltObjectSiteStatusFilterParam } from "@/lib/built-object-site-status";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Карта построенных объектов | ${SITE_NAME}`,
    description: `Интерактивная карта реализованных объектов ${SITE_NAME}: фильтры по региону, площади и этажности. Выберите маркер и откройте карточку построенного дома.`,
    path: "/portfolio/map",
    keywords: ["карта объектов", "построенные дома", "стройплощадка", SITE_NAME],
  });
}

export default async function PortfolioMapPage(props: {
  searchParams?: Promise<{ object?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  await getPageMetaFields("/portfolio/map");
  const objects = await getBuiltObjects();
  const initialObjectSlug = searchParams?.object?.trim() || null;
  const initialSiteStatus = parseBuiltObjectSiteStatusFilterParam(searchParams?.status);

  return (
    <>
      <section className="page-top-offset pb-24" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <div className="container mx-auto max-w-[1320px] px-5">
          <nav className="text-[12px] tracking-[0.02em] text-[var(--text-muted)] sm:text-[13px]" aria-label="Навигация по разделу">
            <Link href="/" className="transition-colors hover:text-[var(--accent)]">
              Главная
            </Link>
            <span className="mx-1.5 text-[var(--text-subtle)] sm:mx-2" aria-hidden>
              {" > "}
            </span>
            <Link href="/portfolio" className="transition-colors hover:text-[var(--accent)]">
              {BUILT_HOMES_SECTION_LABEL}
            </Link>
            <span className="mx-1.5 text-[var(--text-subtle)] sm:mx-2" aria-hidden>
              {" > "}
            </span>
            <span className="text-[var(--text)]">Карта</span>
          </nav>

          <div className="mt-8">
            <PortfolioObjectMapExplorer
              objects={objects}
              layout="page"
              initialObjectSlug={initialObjectSlug}
              initialSiteStatus={initialSiteStatus}
            />
          </div>
        </div>
      </section>
    </>
  );
}
