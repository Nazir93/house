import { redirect } from "next/navigation";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { ClientStageAccordion } from "@/components/account/client-stage-accordion";

export const metadata = {
  title: "Этапы строительства — личный кабинет",
  robots: { index: false, follow: true },
};

export default async function AccountStagesPage() {
  const projectId = await getClientProjectIdFromSession();
  if (!projectId) redirect("/account/login");

  const stages = await prisma.clientProjectStage.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-heading text-2xl font-bold">Этапы строительства</h1>
      <ClientStageAccordion stages={stages} />
    </div>
  );
}
