import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { JsonLdInline } from "@/components/seo/json-ld-inline";
import { getHouseProjects } from "@/lib/construction-data";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { AUTHOR_HOUSE_PROJECT_CATALOG } from "@/lib/house-project-catalog";
import { getHomeHeroBannerConfig } from "@/lib/home-hero-banner-config";
import { getPageMeta } from "@/lib/get-page-meta";
import {
  getProjectCatalogSliceSeo,
  getProjectCatalogSliceSeoPages,
  type ProjectCatalogSliceSeoSlug,
} from "@/lib/seo/project-catalog-slice-seo";
import { getProjectMaterialSeoPages } from "@/lib/seo/project-material-seo";
import { ProjectsCatalogContent } from "./content";

export async function generateProjectCatalogSliceMetadata(slug: ProjectCatalogSliceSeoSlug) {
  const seo = getProjectCatalogSliceSeo(slug);
  if (!seo) return { title: "Проекты домов" };

  return getPageMeta({
    title: seo.title,
    description: seo.description,
    path: seo.path,
    keywords: seo.keywords,
  });
}

export async function ProjectCatalogSliceLandingPage({ slug }: { slug: ProjectCatalogSliceSeoSlug }) {
  const seo = getProjectCatalogSliceSeo(slug);
  if (!seo) notFound();

  const [projects, homeBanner] = await Promise.all([
    getHouseProjects("author"),
    getHomeHeroBannerConfig(),
  ]);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seo.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo.h1,
    description: seo.description,
    url: `${SITE_URL}${seo.path}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  const seoLinks = [...getProjectCatalogSliceSeoPages(), ...getProjectMaterialSeoPages()].map((page) => ({
    href: page.path,
    label: page.h1,
    description: page.keywords.slice(0, 3).join(", "),
  }));
  const searchParams: Record<string, string> = {
    ...(seo.filters.floors ? { floors: seo.filters.floors } : {}),
    ...(seo.filters.areaMin != null ? { areaMin: String(seo.filters.areaMin) } : {}),
    ...(seo.filters.areaMax != null ? { areaMax: String(seo.filters.areaMax) } : {}),
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Каталог проектов", path: "/projects" },
          { name: seo.h1, path: seo.path },
        ]}
      />
      <JsonLdInline schema={collectionSchema} />
      <JsonLdInline schema={faqSchema} />

      <ProjectsCatalogContent
        projects={projects}
        searchParams={searchParams}
        catalog={AUTHOR_HOUSE_PROJECT_CATALOG}
        pageTitle={seo.h1}
        pageDescription={seo.intro}
        breadcrumbLabel={seo.h1}
        homePromos={homeBanner.promos}
        seoLandingLinks={seoLinks}
      />

      <section className="pb-20 md:pb-28" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1100px] px-5">
          <div className="grid gap-8 rounded-3xl border p-5 md:grid-cols-[1fr_1fr] md:p-8" style={{
            borderColor: "color-mix(in srgb, var(--text) 10%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--bg-secondary) 55%, var(--bg))",
          }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-subtle)" }}>
                Подбор по этажности
              </p>
              <h2 className="mt-3 font-heading text-2xl font-bold md:text-3xl" style={{ color: "var(--text)" }}>
                Как выбрать проект под участок и бюджет
              </h2>
              <p className="mt-4 text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
                Этажность влияет на фундамент, кровлю, инженерные трассы, площадь пятна застройки и сценарии жизни.
                Поэтому этот срез отделен от материаловых страниц и калькулятора стоимости.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/calculator"
                  className="rounded-full px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
                >
                  Рассчитать стоимость
                </Link>
                <Link
                  href="/projects"
                  className="rounded-full border px-5 py-3 text-sm font-semibold transition hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--text) 14%, transparent)",
                    color: "var(--text)",
                  }}
                >
                  Все проекты
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading text-xl font-bold" style={{ color: "var(--text)" }}>
                Частые вопросы
              </h3>
              {seo.faq.map((item) => (
                <details
                  key={item.question}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "color-mix(in srgb, var(--text) 10%, transparent)",
                    backgroundColor: "var(--bg)",
                  }}
                >
                  <summary className="cursor-pointer text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
