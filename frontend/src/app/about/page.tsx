import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME, CITY } from "@/lib/constants";
import { AboutPageContent } from "@/components/company/about-page-content";

export async function generateMetadata() {
  return getPageMeta({
    title: `О нас — ${SITE_NAME}`,
    description: `Компания ${SITE_NAME}: строительство домов под ключ в ${CITY}, ценности, подход к работе и контакты.`,
    path: "/about",
    keywords: ["о компании", "строительство домов", SITE_NAME, CITY],
  });
}

export default function AboutPage() {
  return <AboutPageContent />;
}
