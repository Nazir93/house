import { getPageMeta } from "@/lib/get-page-meta";
import { CONSTRUCTION_SERVICES } from "@/lib/construction-service-data";
import { getConstructionServiceSeo } from "@/lib/construction-service-seo";
import { ConstructionServiceTemplate } from "@/components/construction/service-page-template";

export async function generateMetadata() {
  const seo = getConstructionServiceSeo("engineering");
  return getPageMeta({
    title: seo.title,
    description: seo.description,
    path: "/services/engineering",
    keywords: seo.keywords,
  });
}

export default function EngineeringServicePage() {
  return <ConstructionServiceTemplate service={CONSTRUCTION_SERVICES.engineering} />;
}
