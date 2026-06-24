"use client";

import { Upload } from "lucide-react";

type AdminBuiltObjectPublishBarProps = {
  publishing: boolean;
  hasUnpublishedDraft: boolean;
  disabled?: boolean;
  onPublish: () => void;
};

/** Плавающая кнопка публикации объекта на сайт — как в админке ЛК. */
export function AdminBuiltObjectPublishBar({
  publishing,
  hasUnpublishedDraft,
  disabled = false,
  onPublish,
}: AdminBuiltObjectPublishBarProps) {
  return (
    <div
      className="admin-built-object-publish-bar fixed z-[68] top-3 right-[4.35rem] sm:top-4 sm:right-[5rem] lg:top-5 lg:right-[5.75rem]"
      aria-label="Публикация в портфолио на сайте"
    >
      <button
        type="button"
        onClick={onPublish}
        disabled={publishing || disabled}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold sm:px-4 sm:text-sm bg-[#0F3D2E] text-white shadow-lg disabled:opacity-50 transition-opacity hover:brightness-110"
      >
        <Upload size={16} className="shrink-0" aria-hidden />
        <span className="hidden min-[420px]:inline md:hidden">
          {publishing ? "Публикация…" : "На сайт"}
        </span>
        <span className="hidden md:inline">
          {publishing ? "Публикация…" : "Опубликовать в портфолио на сайт"}
        </span>
        <span className="min-[420px]:hidden">{publishing ? "…" : "На сайт"}</span>
      </button>
      {hasUnpublishedDraft && !publishing && !disabled ? (
        <span
          className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-[var(--adm-theme-toggle-bg,#1a1d1c)]"
          title="Есть неопубликованные изменения"
        />
      ) : null}
    </div>
  );
}
