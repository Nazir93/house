"use client";

import type { ReactNode } from "react";
import { AlertCircle, Check, Loader2, Save } from "lucide-react";
import type { ClientProjectDraftSection } from "@/lib/client-project-draft";
import { CLIENT_PROJECT_DRAFT_SECTION_LABELS } from "@/lib/client-project-draft";

export type DraftSectionSaveUiState = "idle" | "saving" | "saved" | "error" | "dirty";

export function draftSectionStatusMessage(
  state: DraftSectionSaveUiState,
  errorMessage?: string
): string | null {
  switch (state) {
    case "saving":
      return "Сохранение…";
    case "saved":
      return "Изменения сохранены";
    case "error":
      return errorMessage?.trim() || "Ошибка сохранения";
    case "dirty":
      return "Есть несохранённые изменения";
    default:
      return null;
  }
}

const STATUS_CLASS: Record<Exclude<DraftSectionSaveUiState, "idle">, string> = {
  saving: "text-white/55",
  saved: "text-emerald-400",
  error: "text-red-400",
  dirty: "text-amber-400/95",
};

export function AdminDraftSectionStatus({
  state,
  errorMessage,
  className = "",
}: {
  state: DraftSectionSaveUiState;
  errorMessage?: string;
  className?: string;
}) {
  const message = draftSectionStatusMessage(state, errorMessage);
  if (!message || state === "idle") return null;

  const Icon =
    state === "saving"
      ? Loader2
      : state === "saved"
        ? Check
        : state === "error"
          ? AlertCircle
          : null;

  return (
    <p
      role="status"
      aria-live="polite"
      className={`flex items-center gap-1.5 text-xs font-medium ${STATUS_CLASS[state as keyof typeof STATUS_CLASS]} ${className}`}
    >
      {Icon ? (
        <Icon size={14} className={state === "saving" ? "animate-spin shrink-0" : "shrink-0"} />
      ) : null}
      <span>{message}</span>
    </p>
  );
}

type AdminDraftSectionSaveButtonProps = {
  section: ClientProjectDraftSection;
  uiState: DraftSectionSaveUiState;
  onClick: () => void | Promise<void>;
  className?: string;
};

export function AdminSectionSaveButton({
  saveLabel,
  uiState,
  onClick,
  className = "",
}: {
  saveLabel: string;
  uiState: DraftSectionSaveUiState;
  onClick: () => void | Promise<void>;
  className?: string;
}) {
  const saving = uiState === "saving";

  const buttonTone =
    uiState === "dirty"
      ? "border-amber-500/45 bg-amber-500/10 text-amber-100"
      : uiState === "saved"
        ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-100"
        : uiState === "error"
          ? "border-red-500/35 bg-red-500/10 text-red-200"
          : "border-white/[0.12] bg-white/[0.06] text-white/80 hover:bg-white/[0.1] hover:text-white";

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={saving}
      title={saveLabel}
      aria-label={saveLabel}
      aria-busy={saving}
      className={
        "inline-flex items-center justify-center p-2 rounded-lg border transition-colors disabled:opacity-60 " +
        buttonTone +
        " " +
        className
      }
    >
      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
    </button>
  );
}

export function AdminSectionSaveControl({
  saveLabel,
  uiState,
  errorMessage,
  onSave,
}: {
  saveLabel: string;
  uiState: DraftSectionSaveUiState;
  errorMessage?: string;
  onSave: () => void | Promise<void>;
}) {
  return (
    <div className="flex flex-col items-end gap-1 min-w-[10rem]">
      <div className="flex items-center gap-2">
        <AdminDraftSectionStatus state={uiState} errorMessage={errorMessage} className="text-right" />
        <AdminSectionSaveButton saveLabel={saveLabel} uiState={uiState} onClick={onSave} />
      </div>
    </div>
  );
}

export function AdminDraftSectionSaveButton({
  section,
  uiState,
  onClick,
  className = "",
}: AdminDraftSectionSaveButtonProps) {
  const label = `Сохранить: ${CLIENT_PROJECT_DRAFT_SECTION_LABELS[section]}`;
  return (
    <AdminSectionSaveButton saveLabel={label} uiState={uiState} onClick={onClick} className={className} />
  );
}

export function AdminDraftSectionSaveControl({
  section,
  uiState,
  errorMessage,
  onSave,
}: {
  section: ClientProjectDraftSection;
  uiState: DraftSectionSaveUiState;
  errorMessage?: string;
  onSave: () => void | Promise<void>;
}) {
  return (
    <AdminSectionSaveControl
      saveLabel={`Сохранить: ${CLIENT_PROJECT_DRAFT_SECTION_LABELS[section]}`}
      uiState={uiState}
      errorMessage={errorMessage}
      onSave={onSave}
    />
  );
}

type AdminSectionHeaderProps = {
  title: string;
  actions?: ReactNode;
  status?: ReactNode;
};

export function AdminSectionHeader({ title, actions, status }: AdminSectionHeaderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        {actions ? <div className="flex items-center gap-2 flex-wrap justify-end">{actions}</div> : null}
      </div>
      {status}
    </div>
  );
}

export function draftSectionSurfaceClass(uiState: DraftSectionSaveUiState): string {
  if (uiState === "dirty") {
    return "ring-1 ring-amber-500/30 border-amber-500/20";
  }
  if (uiState === "saved") {
    return "ring-1 ring-emerald-500/25 border-emerald-500/15";
  }
  if (uiState === "error") {
    return "ring-1 ring-red-500/25 border-red-500/15";
  }
  return "";
}
