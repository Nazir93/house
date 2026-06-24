import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_NAME, BUILT_HOMES_SECTION_LABEL } from "@/lib/constants";
import { getBuiltObjectBySlug } from "@/lib/construction-data";
import { getPublicFaqs } from "@/lib/get-public-faqs";
import { getBuiltObjectCover } from "@/lib/construction-shared";
import { getPageMeta } from "@/lib/get-page-meta";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { BuiltObjectDetailContent } from "./built-content";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const object = await getBuiltObjectBySlug(params.slug);
  if (!object) return {};

  const path = `/portfolio/${object.slug}`;
  const keywords = [object.title, object.material, object.location, SITE_NAME].filter(
    (k): k is string => Boolean(k && String(k).trim())
  );
  const cover = getBuiltObjectCover(object);

  return getPageMeta({
    title: `${object.title} — построенный дом | ${SITE_NAME}`,
    description: object.description.replace(/<[^>]*>/g, "").slice(0, 180),
    path,
    keywords,
    ...(cover?.url ? { ogImage: cover.url } : {}),
  });
}

export default async function CasePage(props: Props) {
  const params = await props.params;
  const [object, faqItems] = await Promise.all([getBuiltObjectBySlug(params.slug), getPublicFaqs()]);
  if (!object) notFound();
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: BUILT_HOMES_SECTION_LABEL, path: "/portfolio" },
          { name: object.title, path: `/portfolio/${object.slug}` },
        ]}
      />
      <BuiltObjectDetailContent object={object} faqItems={faqItems} />
    </>
  );
}
