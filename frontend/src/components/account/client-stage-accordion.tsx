"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { StageIcon } from "@/components/account/stage-icon";
import {
  getChildStages,
  getEffectiveStageStatus,
  getTopLevelStages,
  isStageSubtreeComplete,
  type ClientStageNode,
} from "@/lib/client-project-stage-status";
import { stageStatusLabel } from "@/lib/client-portal-labels";
import type { ClientStageStatus } from "@prisma/client";

export type ClientStageAccordionItem = ClientStageNode & {
  order: number;
  title: string;
  iconKey: string;
};

function defaultExpandedIds(top: ClientStageAccordionItem[], all: ClientStageAccordionItem[]): Set<string> {
  const ids = new Set<string>();
  for (const parent of top) {
    const children = getChildStages(parent.id, all);
    if (children.length === 0) continue;
    const effective = getEffectiveStageStatus(parent, all);
    if (effective === "IN_PROGRESS") ids.add(parent.id);
  }
  if (ids.size === 0) {
    const firstWithChildren = top.find((p) => getChildStages(p.id, all).length > 0);
    if (firstWithChildren) ids.add(firstWithChildren.id);
  }
  return ids;
}

export function ClientStageAccordion({ stages }: { stages: ClientStageAccordionItem[] }) {
  const all: ClientStageAccordionItem[] = useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages]
  );
  const topLevel = useMemo(() => getTopLevelStages(all) as ClientStageAccordionItem[], [all]);
  const [expanded, setExpanded] = useState<Set<string>>(() => defaultExpandedIds(topLevel, all));

  if (topLevel.length === 0) {
    return <p style={{ color: "var(--text-muted)" }}>Этапы ещё не добавлены.</p>;
  }

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {topLevel.map((parent, idx) => {
        const children = (getChildStages(parent.id, all) as ClientStageAccordionItem[]).sort(
          (a, b) => a.order - b.order
        );
        const hasChildren = children.length > 0;
        const isOpen = expanded.has(parent.id);
        const effective = getEffectiveStageStatus(parent, all);
        const complete = isStageSubtreeComplete(parent.id, all);

        return (
          <section
            key={parent.id}
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
          >
            <button
              type="button"
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              onClick={() => hasChildren && toggle(parent.id)}
              aria-expanded={hasChildren ? isOpen : undefined}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold border"
                style={{ borderColor: "var(--border)" }}
              >
                {idx + 1}
              </span>
              {complete ? (
                <CheckCircle2 className="h-7 w-7 text-emerald-500 shrink-0" aria-hidden />
              ) : (
                <StageIcon iconKey={parent.iconKey} className="h-7 w-7 shrink-0 opacity-85" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-base leading-snug">{parent.title}</span>
                <span className="block text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {stageStatusLabel(hasChildren ? effective : parent.status)}
                </span>
              </span>
              {hasChildren ? (
                <ChevronDown
                  className={`h-5 w-5 shrink-0 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              ) : (
                <span className="w-5 shrink-0" aria-hidden />
              )}
            </button>

            {hasChildren && isOpen ? (
              <ul className="border-t px-4 py-2 space-y-1" style={{ borderColor: "var(--border)" }}>
                {children.map((child) => (
                  <SubStageRow key={child.id} stage={child} status={child.status} />
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function SubStageRow({ stage, status }: { stage: ClientStageAccordionItem; status: ClientStageStatus }) {
  const done = status === "DONE";
  return (
    <li className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ backgroundColor: "var(--bg)" }}>
      <span className="w-5 text-center text-xs opacity-40">•</span>
      {done ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" aria-hidden />
      ) : (
        <StageIcon iconKey={stage.iconKey} className="h-5 w-5 shrink-0 opacity-75" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{stage.title}</span>
        <span className="block text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {stageStatusLabel(status)}
        </span>
      </span>
    </li>
  );
}
