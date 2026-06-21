import { ProjectCatalogSliceLandingPage, generateProjectCatalogSliceMetadata } from "../catalog-slice-landing-page";

export const revalidate = 60;

export function generateMetadata() {
  return generateProjectCatalogSliceMetadata("dvuhetazhnye");
}

export default function DvuhetazhnyeProjectsPage() {
  return <ProjectCatalogSliceLandingPage slug="dvuhetazhnye" />;
}
