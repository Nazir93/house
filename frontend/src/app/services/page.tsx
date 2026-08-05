import { getPageMeta, getPageMetaFields } from "@/lib/get-page-meta";
import { getServicesList } from "@/lib/get-services";
import {
  getServicesIndexSeo,
  resolveServicesIndexH1,
  resolveServicesIndexIntro,
} from "@/lib/seo/service-seo-defaults";
import { ServicesPageContent } from "./content";

export const revalidate = 60;

export async function generateMetadata() {
  const seo = getServicesIndexSeo();
  return getPageMeta({
    title: seo.title,
    description: seo.description,
    path: "/services",
    keywords: seo.keywords,
  });
}

export default async function ServicesPage() {
  const [services, meta] = await Promise.all([getServicesList(), getPageMetaFields("/services")]);

  const pageH1 = resolveServicesIndexH1(meta.h1);
  const introText = resolveServicesIndexIntro(meta.description);


  return (
    <ServicesPageContent
      services={services}
      pageH1={pageH1}
      introText={introText}
      bodyHtml={meta.bodyHtml}
    />
  );
}
