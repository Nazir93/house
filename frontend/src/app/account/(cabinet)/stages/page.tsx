import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { StageIcon } from "@/components/account/stage-icon";
import { stageStatusLabel } from "@/lib/client-portal-labels";

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
      <ol className="space-y-4">
        {stages.map((stage, idx) => (
          <li
            key={stage.id}
            className="flex gap-4 rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold border"
              style={{ borderColor: "var(--border)" }}
            >
              {idx + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                {stage.status === "DONE" ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" aria-hidden />
                ) : (
                  <StageIcon iconKey={stage.iconKey} className="h-6 w-6 shrink-0 mt-0.5 opacity-80" />
                )}
                <div>
                  <h2 className="font-semibold text-lg">{stage.title}</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    {stageStatusLabel(stage.status)}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {stages.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Этапы ещё не добавлены.</p>
      ) : null}
    </div>
  );
}
