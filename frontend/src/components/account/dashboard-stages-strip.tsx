import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { StageIcon } from "@/components/account/stage-icon";
import { stageStatusLabel } from "@/lib/client-portal-labels";
import type { ClientStageStatus } from "@prisma/client";

export type DashboardStageCard = {
  id: string;
  title: string;
  iconKey: string;
  displayStatus: ClientStageStatus;
  complete: boolean;
};

/**
 * Компактная сетка этапов на главной ЛК (п. 4 ТЗ): без горизонтального скролла,
 * карточки подстраиваются под ширину экрана.
 */
export function DashboardStagesStrip({ stages }: { stages: DashboardStageCard[] }) {
  if (stages.length === 0) return null;

  return (
    <section>
      <h2 className="font-heading text-base sm:text-lg font-bold mb-2.5">Этапы строительства</h2>
      <ul
        className="grid gap-1.5 sm:gap-2 list-none p-0 m-0"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(4.75rem, 1fr))",
        }}
      >
        {stages.map((stage, idx) => (
          <li
            key={stage.id}
            className="min-w-0 rounded-lg border px-1.5 py-2 sm:px-2 sm:py-2.5 text-center flex flex-col items-center"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
          >
            <span
              className="mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold border tabular-nums"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              {idx + 1}
            </span>
            <span className="flex justify-center mb-1 h-6 w-6 items-center">
              {stage.complete ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" aria-hidden />
              ) : (
                <StageIcon iconKey={stage.iconKey} className="h-5 w-5 shrink-0" colored />
              )}
            </span>
            <p className="text-[10px] sm:text-[11px] font-semibold leading-tight line-clamp-2 w-full min-h-[2.2em]">
              {stage.title}
            </p>
            <p
              className="text-[9px] sm:text-[10px] mt-0.5 leading-tight line-clamp-2 w-full"
              style={{ color: "var(--text-muted)" }}
            >
              {stageStatusLabel(stage.displayStatus)}
            </p>
          </li>
        ))}
      </ul>
      <Link
        href="/account/stages"
        className="inline-block mt-2.5 text-sm font-medium underline-offset-2 hover:underline"
        style={{ color: "var(--accent)" }}
      >
        Все этапы
      </Link>
    </section>
  );
}
