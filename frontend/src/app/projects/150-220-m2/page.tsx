import { ProjectCatalogSliceLandingPage, generateProjectCatalogSliceMetadata } from "../catalog-slice-landing-page";

export const revalidate = 60;

export function generateMetadata() {
  return generateProjectCatalogSliceMetadata("150-220-m2");
}

export default function Area150220M2ProjectsPage() {
  return <ProjectCatalogSliceLandingPage slug="150-220-m2" />;
}
