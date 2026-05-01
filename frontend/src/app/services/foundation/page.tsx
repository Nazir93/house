import { getPageMeta } from "@/lib/get-page-meta";
import { CONSTRUCTION_SERVICES } from "@/lib/construction-service-data";
import { getConstructionServiceSeo } from "@/lib/construction-service-seo";
import { ConstructionServiceTemplate } from "@/components/construction/service-page-template";

export async function generateMetadata() {
  const seo = getConstructionServiceSeo("foundation");
  return getPageMeta({
    title: seo.title,
    description: seo.description,
    path: "/services/foundation",
    keywords: seo.keywords,
  });
}

export default function FoundationServicePage() {
  return <ConstructionServiceTemplate service={CONSTRUCTION_SERVICES.foundation} />;
}
