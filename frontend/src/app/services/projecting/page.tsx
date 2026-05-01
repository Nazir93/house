import { getPageMeta } from "@/lib/get-page-meta";
import { CONSTRUCTION_SERVICES } from "@/lib/construction-service-data";
import { getConstructionServiceSeo } from "@/lib/construction-service-seo";
import { ConstructionServiceTemplate } from "@/components/construction/service-page-template";

export async function generateMetadata() {
  const seo = getConstructionServiceSeo("projecting");
  return getPageMeta({
    title: seo.title,
    description: seo.description,
    path: "/services/projecting",
    keywords: seo.keywords,
  });
}

export default function ProjectingServicePage() {
  return <ConstructionServiceTemplate service={CONSTRUCTION_SERVICES.projecting} />;
}
