import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SITE_NAME,
  BUILT_HOMES_SECTION_LABEL,
  UNDER_CONSTRUCTION_SECTION_LABEL,
} from "@/lib/constants";
import { getBuiltObjectBySlug } from "@/lib/construction-data";
import { getPublicFaqs } from "@/lib/get-public-faqs";
import { getBuiltObjectCover, builtObjectMaterialLabel } from "@/lib/construction-shared";
import { getPageMeta } from "@/lib/get-page-meta";
import { buildMetaDescription } from "@/lib/seo/build-meta-description";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { BuiltObjectSimilarHouseSection } from "@/components/portfolio/built-object-similar-house-section";
import { BuiltObjectDetailContent } from "./built-content";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

function portfolioSectionForObject(object: { siteStatus?: string | null }) {
  const isConstruction = object.siteStatus === "UNDER_CONSTRUCTION";
  return {
    label: isConstruction ? UNDER_CONSTRUCTION_SECTION_LABEL : BUILT_HOMES_SECTION_LABEL,
    path: isConstruction ? "/portfolio/under-construction" : "/portfolio",
    titleSuffix: isConstruction ? "строящийся объект" : "построенный дом",
  };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const object = await getBuiltObjectBySlug(params.slug);
  if (!object) return {};

  const section = portfolioSectionForObject(object);
  const path = `/portfolio/${object.slug}`;
  const keywords = [object.title, builtObjectMaterialLabel(object.material), object.location, SITE_NAME].filter(
    (k): k is string => Boolean(k && String(k).trim())
  );
  const cover = getBuiltObjectCover(object);

  return getPageMeta({
    title: `${object.title} — ${section.titleSuffix} | ${SITE_NAME}`,
    description: buildMetaDescription({
      html: object.description,
      title: object.title,
      kind: "portfolio",
      fallback: `${object.title} — ${section.titleSuffix} ${SITE_NAME}. Фото, этапы строительства и характеристики объекта.`,
    }),
    path,
    keywords,
    ...(cover?.url ? { ogImage: cover.url } : {}),
  });
}

export default async function CasePage(props: Props) {
  const params = await props.params;
  const [object, faqItems] = await Promise.all([getBuiltObjectBySlug(params.slug), getPublicFaqs()]);
  if (!object) notFound();
  const section = portfolioSectionForObject(object);
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: section.label, path: section.path },
          { name: object.title, path: `/portfolio/${object.slug}` },
        ]}
      />
      <BuiltObjectDetailContent object={object} faqItems={faqItems} />
      <BuiltObjectSimilarHouseSection material={object.material} />
    </>
  );
}
