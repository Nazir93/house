import { notFound } from "next/navigation";
import { getPageMeta } from "@/lib/get-page-meta";
import { getServiceLandingPageData, getServiceMetadataDefaults } from "@/lib/get-service-landing-page";
import { ServiceLandingRenderer } from "@/components/landing/service-landing-renderer";

/** Свежие данные из БД и SEO из админки без ожидания ребилда. */
export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const defaults = await getServiceMetadataDefaults(params.slug);
  if (!defaults) {
    return { title: "Услуга" };
  }
  return getPageMeta({
    title: defaults.title,
    description: defaults.description,
    path: `/services/${params.slug}`,
    keywords: defaults.keywords,
  });
}

export default async function ServiceLandingPage({ params }: Props) {
  const data = await getServiceLandingPageData(params.slug);
  if (!data) notFound();
  if (!data.published) notFound();

  return <ServiceLandingRenderer document={data.document} pagePath={`/services/${params.slug}`} />;
}
