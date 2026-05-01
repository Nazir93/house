import { getPageMeta, getPageMetaFields } from "@/lib/get-page-meta";
import { getBuiltObjects } from "@/lib/construction-data";
import { SITE_NAME } from "@/lib/constants";
import { BuiltPortfolioContent } from "./built-content";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Портфолио — реализованные проекты | ${SITE_NAME}`,
    description: `Портфолио ${SITE_NAME}: этапы строительства и галерея по объектам, карта реализованных домов.`,
    path: "/portfolio",
    keywords: ["построенные дома", "портфолио строительства", "карта объектов", SITE_NAME],
  });
}

export default async function PortfolioPage({ searchParams }: { searchParams?: { view?: string } }) {
  await getPageMetaFields("/portfolio");
  const objects = await getBuiltObjects();
  const initialView = searchParams?.view === "map" ? ("map" as const) : ("grid" as const);
  return <BuiltPortfolioContent objects={objects} initialView={initialView} />;
}
