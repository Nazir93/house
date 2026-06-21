import { ProjectMaterialLandingPage, generateProjectMaterialMetadata } from "../material-landing-page";

export const revalidate = 60;

export function generateMetadata() {
  return generateProjectMaterialMetadata("gazobeton");
}

export default function GazobetonProjectsPage() {
  return <ProjectMaterialLandingPage slug="gazobeton" />;
}
