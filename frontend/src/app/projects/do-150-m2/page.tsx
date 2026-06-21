import { ProjectCatalogSliceLandingPage, generateProjectCatalogSliceMetadata } from "../catalog-slice-landing-page";

export const revalidate = 60;

export function generateMetadata() {
  return generateProjectCatalogSliceMetadata("do-150-m2");
}

export default function Do150M2ProjectsPage() {
  return <ProjectCatalogSliceLandingPage slug="do-150-m2" />;
}
