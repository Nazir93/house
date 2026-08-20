import Link from "next/link";
import { notFound } from "next/navigation";

import { MaterialCommercialLandingView } from "@/components/projects/material-commercial-landing-view";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { JsonLdInline } from "@/components/seo/json-ld-inline";
import { getBuiltObjects, getHouseProjects } from "@/lib/construction-data";
import { normalizeBuiltObjectMaterialEnum } from "@/lib/construction-shared";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { AUTHOR_HOUSE_PROJECT_CATALOG } from "@/lib/house-project-catalog";
import { getPageMeta } from "@/lib/get-page-meta";
import { projectMatchesMaterial } from "@/lib/project-filters";
import { getProjectCatalogSliceSeoPages } from "@/lib/seo/project-catalog-slice-seo";
import { getHouseConstructionCalculatorConfig } from "@/lib/house-construction-calculator-config";
import { getHomeHeroBannerConfig } from "@/lib/home-hero-banner-config";
import { getMaterialCommercialLanding } from "@/lib/seo/project-material-commercial";
import {
  getProjectMaterialSeo,
  getProjectMaterialSeoPages,
  type ProjectMaterialSeoSlug,
} from "@/lib/seo/project-material-seo";
import { ProjectsCatalogContent } from "./content";

const MATERIAL_ENUM_BY_SEO: Record<ProjectMaterialSeoSlug, string> = {
  gazobeton: "GAS_BLOCK",
  kirpich: "BRICK",
  keramoblok: "CERAMIC_BLOCK",
};

export async function generateProjectMaterialMetadata(slug: ProjectMaterialSeoSlug) {
  const seo = getProjectMaterialSeo(slug);
  if (!seo) return { title: "Проекты домов" };

  return getPageMeta({
    title: seo.title,
    description: seo.description,
    path: seo.path,
    keywords: seo.keywords,
  });
}

export async function ProjectMaterialLandingPage({ slug }: { slug: ProjectMaterialSeoSlug }) {
  const seo = getProjectMaterialSeo(slug);
  if (!seo) notFound();

  const [allProjects, allBuilt, calcConfig, homeBanner] = await Promise.all([
    getHouseProjects("author"),
    getBuiltObjects(),
    getHouseConstructionCalculatorConfig(),
    getHomeHeroBannerConfig(),
  ]);
  const commercial = getMaterialCommercialLanding(slug, calcConfig);

  const projects = allProjects.filter((p) => projectMatchesMaterial(p, seo.material));
  const materialEnum = MATERIAL_ENUM_BY_SEO[slug];
  const objects = allBuilt.filter(
    (o) => o.published && normalizeBuiltObjectMaterialEnum(o.material) === materialEnum,
  );

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

  if (commercial) {
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
        <MaterialCommercialLandingView
          seo={seo}
          commercial={commercial}
          catalog={AUTHOR_HOUSE_PROJECT_CATALOG}
          projects={projects}
          objects={objects}
        />
      </>
    );
  }

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
        projects={allProjects}
        searchParams={{ material: seo.material }}
        catalog={AUTHOR_HOUSE_PROJECT_CATALOG}
        pageTitle={seo.h1}
        pageDescription={seo.intro}
        breadcrumbLabel={seo.h1}
        homePromos={homeBanner.promos}
        seoLandingLinks={[...getProjectMaterialSeoPages(), ...getProjectCatalogSliceSeoPages()].map((page) => ({
          href: page.path,
          label: page.h1,
          description: page.keywords.slice(0, 3).join(", "),
        }))}
      />

      <section className="pb-20 md:pb-28" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1100px] px-5">
          <div
            className="grid gap-8 rounded-3xl border p-5 md:grid-cols-[1.1fr_0.9fr] md:p-8"
            style={{
              borderColor: "color-mix(in srgb, var(--text) 10%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--bg-secondary) 55%, var(--bg))",
            }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-subtle)" }}>
                SEO-кластер
              </p>
              <h2 className="mt-3 font-heading text-2xl font-bold md:text-3xl" style={{ color: "var(--text)" }}>
                Что важно учесть перед расчетом
              </h2>
              <p className="mt-4 text-sm leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
                Эта посадочная разведена с главной, калькулятором и информационной страницей материалов: здесь пользователь
                выбирает проект и материал стен, а расчет стоимости продолжает в карточке проекта или калькуляторе.
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
                  href="/technology/materials"
                  className="rounded-full border px-5 py-3 text-sm font-semibold transition hover:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]"
                  style={{
                    borderColor: "color-mix(in srgb, var(--text) 14%, transparent)",
                    color: "var(--text)",
                  }}
                >
                  Сравнить материалы
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
