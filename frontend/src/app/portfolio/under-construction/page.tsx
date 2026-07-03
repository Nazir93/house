import { getPageMeta, getPageMetaFields } from "@/lib/get-page-meta";
import { getBuiltObjects } from "@/lib/construction-data";
import { SITE_NAME, UNDER_CONSTRUCTION_SECTION_LABEL } from "@/lib/constants";
import { BuiltPortfolioContent } from "../built-content";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `${UNDER_CONSTRUCTION_SECTION_LABEL} | ${SITE_NAME}`,
    description: `Строящиеся дома ${SITE_NAME}: объекты в работе, карта стройплощадок и этапы строительства.`,
    path: "/portfolio/under-construction",
    keywords: ["строящиеся дома", "стройплощадка", "карта объектов", SITE_NAME],
  });
}

export default async function UnderConstructionPortfolioPage(props: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const searchParams = await props.searchParams;
  await getPageMetaFields("/portfolio/under-construction");
  const objects = await getBuiltObjects();
  const initialView = searchParams?.view === "map" ? ("map" as const) : ("grid" as const);

  return (
    <BuiltPortfolioContent
      objects={objects}
      initialView={initialView}
      siteScope="UNDER_CONSTRUCTION"
      pageTitle={UNDER_CONSTRUCTION_SECTION_LABEL}
      pageDescription={`Дома, которые сейчас строит ${SITE_NAME}. Можно посмотреть на карте и записаться на экскурсию.`}
      breadcrumbLabel={UNDER_CONSTRUCTION_SECTION_LABEL}
    />
  );
}
