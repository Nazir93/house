import { StageIcon } from "@/components/account/stage-icon";
import type { CurrentStageInProgress } from "@/lib/client-project-stage-status";

/** Блок готовности и текущих этапов в карточке объекта (п. 6 ТЗ). */
export function AccountObjectCardProgress({
  overallProgress,
  currentStages,
}: {
  overallProgress: number;
  currentStages: CurrentStageInProgress[];
}) {
  const progress = Math.min(100, Math.max(0, overallProgress));

  return (
    <div className="mt-6 space-y-4 w-full">
      <div>
        <div className="flex justify-between text-sm mb-1.5 gap-3">
          <span style={{ color: "var(--text-muted)" }}>Готовность объекта</span>
          <span className="font-bold tabular-nums shrink-0">{progress}%</span>
        </div>
        <div
          className="h-2.5 w-full rounded-full overflow-hidden"
          style={{ background: "color-mix(in srgb, var(--text) 12%, transparent)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: "var(--accent)" }}
          />
        </div>
      </div>

      {currentStages.length > 0 ? (
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            {currentStages.length === 1 ? "Текущий этап" : "Текущие этапы"}
          </p>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {currentStages.map((stage) => (
              <li key={stage.id}>
                <div
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium border w-full min-w-0"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
                >
                  <StageIcon iconKey={stage.iconKey} className="h-4 w-4 shrink-0 opacity-90" colored />
                  <span className="min-w-0 leading-snug">{stage.title}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
