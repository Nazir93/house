import Link from "next/link";
import { getPageMeta, getPageMetaFields } from "@/lib/get-page-meta";
import { getBuiltObjects } from "@/lib/construction-data";
import { SITE_NAME } from "@/lib/constants";
import { PortfolioObjectMapExplorer } from "@/components/portfolio/portfolio-object-map-explorer";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Карта построенных объектов | ${SITE_NAME}`,
    description: `Интерактивная карта реализованных объектов ${SITE_NAME}: фильтры по региону, площади и этажности. Выберите маркер и откройте полный кейс в портфолио.`,
    path: "/portfolio/map",
    keywords: ["карта объектов", "построенные дома", "стройплощадка", SITE_NAME],
  });
}

export default async function PortfolioMapPage() {
  await getPageMetaFields("/portfolio/map");
  const objects = await getBuiltObjects();

  return (
    <>
      <section className="pb-24 pt-28" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <div className="container mx-auto max-w-[1320px] px-5">
          <nav className="text-[12px] tracking-[0.02em] text-[var(--text-muted)] sm:text-[13px]" aria-label="Навигация по разделу">
            <Link href="/" className="transition-colors hover:text-[var(--accent)]">
              Главная
            </Link>
            <span className="mx-1.5 text-[var(--text-subtle)] sm:mx-2" aria-hidden>
              {" > "}
            </span>
            <Link href="/portfolio" className="transition-colors hover:text-[var(--accent)]">
              Портфолио
            </Link>
            <span className="mx-1.5 text-[var(--text-subtle)] sm:mx-2" aria-hidden>
              {" > "}
            </span>
            <span className="text-[var(--text)]">Карта</span>
          </nav>

          <div className="mt-8">
            <PortfolioObjectMapExplorer objects={objects} layout="page" />
          </div>
        </div>
      </section>
    </>
  );
}
