import {
  builtObjectMaterialLabel,
  normalizeBuiltObjectMaterialEnum,
} from "@/lib/construction-shared";
import type { ProjectMaterialSeoSlug } from "@/lib/seo/project-material-seo";

/**
 * Перелинковка со страницы построенного дома (ТЗ SEO §6).
 * Материал → уже живые `/projects/{материал}`, не `/stroitelstvo-domov-iz-*`.
 */

export const BUILT_OBJECT_SIMILAR_HOUSE_H2 = "Хотите построить похожий дом?";

export type BuiltObjectSimilarHouseLink = {
  id: string;
  label: string;
  href: string;
};

const PROJECTS_LINK: BuiltObjectSimilarHouseLink = {
  id: "projects",
  label: "Похожие проекты",
  href: "/projects",
};

const CALCULATOR_LINK: BuiltObjectSimilarHouseLink = {
  id: "calculator",
  label: "Расчет стоимости",
  href: "/calculator",
};

/** Enum материала объекта → SEO-слаг каталога проектов. */
const MATERIAL_TO_PROJECTS_SLUG: Partial<Record<string, ProjectMaterialSeoSlug>> = {
  GAS_BLOCK: "gazobeton",
  BRICK: "kirpich",
  CERAMIC_BLOCK: "keramoblok",
};

const MATERIAL_LINK_LABEL: Record<ProjectMaterialSeoSlug, string> = {
  gazobeton: "Строительство домов из газобетона",
  kirpich: "Строительство домов из кирпича",
  keramoblok: "Строительство домов из керамоблока",
};

export function builtObjectMaterialProjectsPath(
  material: string | null | undefined,
): `/projects/${ProjectMaterialSeoSlug}` | null {
  const enumValue = normalizeBuiltObjectMaterialEnum(material);
  const slug = MATERIAL_TO_PROJECTS_SLUG[enumValue];
  return slug ? `/projects/${slug}` : null;
}

export function builtObjectMaterialTechnologyLink(
  material: string | null | undefined,
): BuiltObjectSimilarHouseLink | null {
  const href = builtObjectMaterialProjectsPath(material);
  if (!href) return null;
  const slug = href.replace("/projects/", "") as ProjectMaterialSeoSlug;
  return {
    id: `material-${slug}`,
    label: MATERIAL_LINK_LABEL[slug] ?? `Дома из ${builtObjectMaterialLabel(material ?? "")}`,
    href,
  };
}

/** Ссылки блока: проекты, калькулятор, при наличии — материал. */
export function builtObjectSimilarHouseLinks(
  material: string | null | undefined,
): BuiltObjectSimilarHouseLink[] {
  const links: BuiltObjectSimilarHouseLink[] = [PROJECTS_LINK, CALCULATOR_LINK];
  const technology = builtObjectMaterialTechnologyLink(material);
  if (technology) links.push(technology);
  return links;
}
