import { ProjectMaterialLandingPage, generateProjectMaterialMetadata } from "../material-landing-page";

export const revalidate = 60;

export function generateMetadata() {
  return generateProjectMaterialMetadata("kirpich");
}

export default function KirpichProjectsPage() {
  return <ProjectMaterialLandingPage slug="kirpich" />;
}
