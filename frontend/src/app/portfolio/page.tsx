import { getPageMeta, getPageMetaFields } from "@/lib/get-page-meta";
import { getBuiltObjects } from "@/lib/construction-data";
import { SITE_NAME } from "@/lib/constants";
import { BuiltPortfolioContent } from "./built-content";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Наши проекты — построенные дома | ${SITE_NAME}`,
    description: `Наши проекты ${SITE_NAME}: реализованные объекты, этапы строительства и карта объектов.`,
    path: "/portfolio",
    keywords: ["построенные дома", "портфолио строительства", "карта объектов", SITE_NAME],
  });
}

export default async function PortfolioPage(props: { searchParams?: Promise<{ view?: string }> }) {
  const searchParams = await props.searchParams;
  await getPageMetaFields("/portfolio");
  const objects = await getBuiltObjects();
  const initialView = searchParams?.view === "map" ? ("map" as const) : ("grid" as const);
  return <BuiltPortfolioContent objects={objects} initialView={initialView} />;
}
