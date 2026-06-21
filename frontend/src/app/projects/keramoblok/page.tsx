import { ProjectMaterialLandingPage, generateProjectMaterialMetadata } from "../material-landing-page";

export const revalidate = 60;

export function generateMetadata() {
  return generateProjectMaterialMetadata("keramoblok");
}

export default function KeramoblokProjectsPage() {
  return <ProjectMaterialLandingPage slug="keramoblok" />;
}
