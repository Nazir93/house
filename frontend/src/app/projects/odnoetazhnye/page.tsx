import { ProjectCatalogSliceLandingPage, generateProjectCatalogSliceMetadata } from "../catalog-slice-landing-page";

export const revalidate = 60;

export function generateMetadata() {
  return generateProjectCatalogSliceMetadata("odnoetazhnye");
}

export default function OdnoetazhnyeProjectsPage() {
  return <ProjectCatalogSliceLandingPage slug="odnoetazhnye" />;
}
