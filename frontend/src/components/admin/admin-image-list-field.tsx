"use client";

import { useRef } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { CmsImage } from "@/components/ui/cms-image";
import { moveItemInArray, moveListItem } from "@/lib/reorder-list";
import { reverseGalleryUrls, sortFilesForGalleryOrder } from "@/lib/sort-files-for-gallery-order";

function pickFilesForUpload(list: FileList | null): File[] {
  const files = Array.from(list ?? []);
  return files.length > 1 ? sortFilesForGalleryOrder(files) : files;
}

type AdminImageUrlListProps = {
  title: string;
  items: string[];
  onItemsChange: (items: string[]) => void;
  uploading: boolean;
  uploadProgress: string;
  onUploadFiles: (files: File[]) => void;
  accept?: string;
  emptyHint?: string;
};

export function AdminImageUrlList({
  title,
  items,
  onItemsChange,
  uploading,
  uploadProgress,
  onUploadFiles,
  accept = "image/*",
  emptyHint,
}: AdminImageUrlListProps) {
  function move(index: number, direction: -1 | 1) {
    onItemsChange(moveListItem(items, index, index + direction));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">
          {title} ({items.length})
        </p>
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-white/70">
          <Plus size={14} aria-hidden />
          {uploading ? (uploadProgress ? `Загрузка ${uploadProgress}…` : "Загрузка…") : "Добавить"}
          <input
            type="file"
            accept={accept}
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const files = pickFilesForUpload(e.target.files);
              if (files.length) onUploadFiles(files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {emptyHint && items.length === 0 ? (
        <p className="text-xs leading-relaxed text-white/40">{emptyHint}</p>
      ) : null}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04]"
            >
              <CmsImage src={url} alt="" width={320} height={112} className="h-28 w-full object-cover" sizes="320px" />
              <div className="absolute bottom-2 left-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg bg-black/60 p-1 text-white/80 disabled:opacity-35"
                  aria-label="Переместить левее"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="rounded-lg bg-black/60 p-1 text-white/80 disabled:opacity-35"
                  aria-label="Переместить правее"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onItemsChange(items.filter((_, i) => i !== index))}
                className="absolute right-2 top-2 rounded-lg bg-black/60 p-1 text-white/70"
                aria-label="Удалить"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type AdminPlanInput = { url: string; label: string };

type AdminPlanImageListProps = {
  title: string;
  plans: AdminPlanInput[];
  onPlansChange: (plans: AdminPlanInput[]) => void;
  uploading: boolean;
  uploadProgress: string;
  onUploadFiles: (files: File[]) => void;
};

export function AdminPlanImageList({
  title,
  plans,
  onPlansChange,
  uploading,
  uploadProgress,
  onUploadFiles,
}: AdminPlanImageListProps) {
  function move(index: number, direction: -1 | 1) {
    onPlansChange(moveListItem(plans, index, index + direction));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">
          {title} ({plans.length})
        </p>
        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-white/70">
          <Plus size={14} aria-hidden />
          {uploading ? (uploadProgress ? `Загрузка ${uploadProgress}…` : "Загрузка…") : "Добавить"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const files = pickFilesForUpload(e.target.files);
              if (files.length) onUploadFiles(files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {plans.length > 0 ? (
        <div className="space-y-2">
          {plans.map((plan, index) => (
            <div
              key={`${plan.url}-${index}`}
              className="grid grid-cols-[72px_1fr_auto_auto] items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2"
            >
              <CmsImage src={plan.url} alt="" width={64} height={56} className="h-14 w-16 rounded-lg object-cover" sizes="64px" />
              <input
                value={plan.label}
                onChange={(e) =>
                  onPlansChange(plans.map((p, i) => (i === index ? { ...p, label: e.target.value } : p)))
                }
                placeholder="Подпись (например: 1 этаж)"
                className="rounded-lg bg-white/[0.05] px-3 py-2 text-sm text-white"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg bg-white/[0.06] p-2 text-white/70 disabled:opacity-35"
                  aria-label="Переместить выше"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === plans.length - 1}
                  className="rounded-lg bg-white/[0.06] p-2 text-white/70 disabled:opacity-35"
                  aria-label="Переместить ниже"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => onPlansChange(plans.filter((_, i) => i !== index))}
                className="p-2 text-red-300/70"
                aria-label="Удалить"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type AdminDragImageUrlListProps = {
  title: string;
  items: string[];
  onItemsChange: (items: string[]) => void;
  uploading: boolean;
  uploadProgress: string;
  onUploadFiles: (files: File[]) => void;
  accept?: string;
  emptyHint?: string;
};

/** Список фото с drag-and-drop, как фотоотчёты в ЛК. */
export function AdminDragImageUrlList({
  title,
  items,
  onItemsChange,
  uploading,
  uploadProgress,
  onUploadFiles,
  accept = "image/*",
  emptyHint,
}: AdminDragImageUrlListProps) {
  const dragIndex = useRef<number | null>(null);

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === index) return;
    onItemsChange(moveItemInArray(items, from, index));
    dragIndex.current = index;
  }

  function handleDragEnd() {
    dragIndex.current = null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold adm-muted">
          {title} ({items.length})
        </p>
        <div className="flex shrink-0 items-center gap-1.5">
          {items.length > 1 ? (
            <button
              type="button"
              onClick={() => onItemsChange(reverseGalleryUrls(items))}
              className="adm-btn-media text-xs"
              title="Перевернуть порядок: с конца в начало и наоборот"
              aria-label="Перевернуть порядок фото"
            >
              <ArrowUpDown size={14} aria-hidden />
              Порядок
            </button>
          ) : null}
          <label className="adm-btn-media cursor-pointer text-xs">
            <Plus size={14} aria-hidden />
            {uploading ? (uploadProgress ? `Загрузка ${uploadProgress}…` : "Загрузка…") : "Добавить"}
            <input
              type="file"
              accept={accept}
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const files = pickFilesForUpload(e.target.files);
                if (files.length) onUploadFiles(files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
      {emptyHint && items.length === 0 ? (
        <p className="text-xs leading-relaxed adm-faint">{emptyHint}</p>
      ) : null}
      {items.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-2 gap-2 sm:grid-cols-4">
          {items.map((url, index) => (
            <li
              key={`${url}-${index}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="group relative aspect-square cursor-grab overflow-hidden rounded-lg border border-white/[0.08] active:cursor-grabbing"
            >
              <CmsImage src={url} alt="" fill className="pointer-events-none object-cover" sizes="160px" />
              <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-black/55 px-1 py-0.5 text-[10px] text-white/80">
                <GripVertical size={12} aria-hidden />
                {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onItemsChange(items.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 rounded bg-black/60 p-1 text-red-300 opacity-0 transition group-hover:opacity-100"
                aria-label="Удалить фото"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
