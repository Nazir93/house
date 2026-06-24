"use client";

import { Trash2 } from "lucide-react";
import { AdminDragImageUrlList } from "@/components/admin/admin-image-list-field";
import {
  normalizeCaseStudyPhaseDefinitions,
  type CaseStudyPhaseDefinition,
} from "@/lib/portfolio-case-study-phases";

const phaseTitleInputClass =
  "w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-2 text-sm text-[color:var(--adm-main-fg)] placeholder:text-[color:var(--adm-main-fg-faint)] focus:border-[#0F3D2E] focus:outline-none";

export function BuiltObjectCaseStudyPhasesEditor({
  phases,
  phaseMedia,
  onPhasesChange,
  onPhaseMediaChange,
  uploadingPhaseId,
  uploadProgress,
  onUploadFiles,
}: {
  phases: CaseStudyPhaseDefinition[];
  phaseMedia: Record<string, string[]>;
  onPhasesChange: (phases: CaseStudyPhaseDefinition[]) => void;
  onPhaseMediaChange: (phaseId: string, items: string[]) => void;
  uploadingPhaseId: string | null;
  uploadProgress: string;
  onUploadFiles: (phaseId: string, files: File[]) => void;
}) {
  function updatePhaseTitle(phaseId: string, title: string) {
    onPhasesChange(
      normalizeCaseStudyPhaseDefinitions(
        phases.map((phase) => (phase.id === phaseId ? { ...phase, title } : phase)),
      ),
    );
  }

  function removePhase(phaseId: string) {
    if (!confirm("Удалить этап и все его фото?")) return;
    onPhasesChange(normalizeCaseStudyPhaseDefinitions(phases.filter((phase) => phase.id !== phaseId)));
    onPhaseMediaChange(phaseId, []);
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {phases.map((phase) => (
        <div key={phase.id} className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-start gap-2">
            <input
              value={phase.title}
              onChange={(e) => updatePhaseTitle(phase.id, e.target.value)}
              placeholder="Название этапа"
              className={phaseTitleInputClass}
            />
            <button
              type="button"
              onClick={() => removePhase(phase.id)}
              className="shrink-0 rounded-lg border border-white/[0.08] p-2 text-red-300/80 hover:bg-white/[0.04]"
              aria-label={`Удалить этап ${phase.title}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <AdminDragImageUrlList
            title="Фото этапа"
            items={phaseMedia[phase.id] ?? []}
            onItemsChange={(items) => onPhaseMediaChange(phase.id, items)}
            uploading={uploadingPhaseId === phase.id}
            uploadProgress={uploadProgress}
            onUploadFiles={(files) => onUploadFiles(phase.id, files)}
          />
        </div>
      ))}
    </div>
  );
}
