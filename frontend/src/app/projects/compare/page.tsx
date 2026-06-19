import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME } from "@/lib/constants";
import { getHouseProjectBySlug } from "@/lib/construction-data";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { ProjectComparePageContent } from "@/components/projects/project-compare-page-content";
import {
  parseCompareSearchParam,
  type ProjectCompareEntry,
} from "@/lib/project-compare";
import type { HouseProjectItem } from "@/lib/construction-data";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Сравнение проектов домов | ${SITE_NAME}`,
    description:
      "Сравните до 4 проектов домов: параметры, комплектация, планировки, график и стоимость при единых настройках — авторские и типовые решения.",
    path: "/projects/compare",
    keywords: ["сравнение проектов домов", "каталог домов", SITE_NAME],
  });
}

async function loadCompareColumns(entries: ProjectCompareEntry[]) {
  const columns: { entry: ProjectCompareEntry; project: HouseProjectItem }[] = [];
  const missing: ProjectCompareEntry[] = [];

  for (const entry of entries) {
    const project = await getHouseProjectBySlug(entry.slug, entry.catalogKind);
    if (project) columns.push({ entry, project });
    else missing.push(entry);
  }

  return { columns, missing };
}

export default async function ProjectComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const entries = parseCompareSearchParam(sp.p);
  const { columns, missing } = await loadCompareColumns(entries);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", path: "/" },
          { name: "Каталог авторских проектов", path: "/projects" },
          { name: "Сравнение проектов", path: "/projects/compare" },
        ]}
      />
      <ProjectComparePageContent columns={columns} missingEntries={missing} />
    </>
  );
}
