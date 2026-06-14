import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME, CITY } from "@/lib/constants";
import { AboutPageContent } from "@/components/company/about-page-content";

export async function generateMetadata() {
  return getPageMeta({
    title: `О нас — ${SITE_NAME}`,
    description: `«Часть Души»: проектируем и строим загородные дома в ${CITY}. Миссия, ценности и команда — архитектура, качество исполнения и внимание к деталям.`,
    path: "/about",
    keywords: ["о компании", "строительство домов", SITE_NAME, CITY, "ценности", "миссия"],
  });
}

export default function AboutPage() {
  return <AboutPageContent />;
}
