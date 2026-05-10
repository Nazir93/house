import { notFound } from "next/navigation";
import { getPageMeta } from "@/lib/get-page-meta";
import { getServiceLandingPageData, getServiceMetadataDefaults } from "@/lib/get-service-landing-page";
import { ServiceLandingRenderer } from "@/components/landing/service-landing-renderer";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";

/** Свежие данные из БД и SEO из админки без ожидания ребилда. */
export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props) {
  const params = await props.params;
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

export default async function ServiceLandingPage(props: Props) {
  const params = await props.params;
  const data = await getServiceLandingPageData(params.slug);
  if (!data) notFound();
  if (!data.published) notFound();

  const hero = data.document.sections.find((s) => s.type === "hero");
  const crumbTitle = hero && "title" in hero ? hero.title : params.slug;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Услуги", path: "/services" },
          { name: crumbTitle, path: `/services/${params.slug}` },
        ]}
      />
      <ServiceLandingRenderer document={data.document} pagePath={`/services/${params.slug}`} />
    </>
  );
}
