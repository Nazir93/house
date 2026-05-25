"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadAdminMedia } from "@/lib/admin-upload";
import { CmsImage } from "@/components/ui/cms-image";

type Accept = "image" | "video";

export function AdminMediaUpload({
  label,
  accept,
  value,
  onChange,
  multiple = false,
  showHint = true,
  profile = "default",
  className = "",
}: {
  label: string;
  accept: Accept;
  value: string;
  onChange: (url: string) => void;
  /** Несколько файлов за один выбор (Ctrl/⌘ + клик); каждый загружается по очереди, URL передаётся в onChange по одному. */
  multiple?: boolean;
  showHint?: boolean;
  /** hero — до 3840px и выше качество (фоны баннера на весь экран). */
  profile?: "default" | "hero";
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [batchHint, setBatchHint] = useState("");
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setBatchHint("");
    setUploading(true);
    const res = await uploadAdminMedia(file, { profile });
    setUploading(false);
    if (res.error) setError(res.error);
    else if (res.url) onChange(res.url);
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setError("");
    setBatchHint("");
    setUploading(true);
    try {
      for (let i = 0; i < list.length; i++) {
        setBatchHint(`${i + 1} / ${list.length}`);
        const res = await uploadAdminMedia(list[i]!, { profile });
        if (res.error) {
          setError(`${res.error} (файл ${i + 1} из ${list.length}: ${list[i]!.name})`);
          break;
        }
        if (res.url) onChange(res.url);
      }
    } finally {
      setBatchHint("");
      setUploading(false);
    }
  }

  const acceptAttr =
    accept === "image"
      ? "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif"
      : "video/*,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.mkv,.m4v,.avi,image/gif,.gif";

  const btnLabel = uploading
    ? batchHint
      ? `Загрузка ${batchHint}…`
      : "Загрузка…"
    : multiple
      ? accept === "image"
        ? "Выбрать изображения (несколько)"
        : "Выбрать видео (несколько)"
      : accept === "image"
        ? "Выбрать изображение"
        : "Выбрать видеофайл";

  return (
    <div className={className}>
      <span className="block adm-uppercase-label font-medium mb-1.5">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <label className="adm-btn-media">
          <Upload size={16} />
          {btnLabel}
          <input
            type="file"
            accept={acceptAttr}
            className="hidden"
            disabled={uploading}
            multiple={multiple}
            onChange={(e) => {
              if (multiple) void onFiles(e.target.files);
              else void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/[0.06] text-white/50 hover:text-red-400 text-xs transition-colors"
          >
            <X size={14} /> Убрать файл
          </button>
        ) : null}
      </div>
      {error ? <p className="text-red-400 text-xs mt-1.5">{error}</p> : null}
      {showHint ? (
        <p className="text-[11px] adm-faint mt-1.5">
          {accept === "image"
            ? profile === "hero"
              ? "До 30 МБ. Для фона баннера: до 3840px, WebP качество 88 (без повторного сжатия на сайте)."
              : `До 30 МБ за файл. JPG, PNG, WebP, GIF, SVG, AVIF — растр по возможности режется до 1920px и сохраняется как WebP (качество 78).${multiple ? " Несколько файлов: Ctrl/⌘ + выбор или Shift + диапазон." : ""}`
            : `До 250 МБ за файл. MP4, WebM, MOV, AVI и др. На прокси может быть свой лимит (часто 25–300 МБ). Файл без расширения — по MIME в браузере.${multiple ? " Несколько роликов: множественный выбор в диалоге." : ""}`}
        </p>
      ) : null}
      {value && accept === "image" ? (
        <div className="relative mt-2 h-44 w-full max-w-lg">
          <CmsImage src={value} alt="" fill className="rounded-lg border border-white/[0.08] object-contain bg-black/20" sizes="512px" />
        </div>
      ) : null}
      {value && accept === "video" ? (
        /\.gif($|\?)/i.test(value) ? (
          <div className="relative mt-2 h-52 w-full max-w-lg">
            <CmsImage src={value} alt="GIF" fill className="rounded-lg border border-white/[0.08] object-contain bg-black/20" sizes="512px" />
          </div>
        ) : (
          <video
            src={value}
            controls
            className="mt-2 max-h-52 rounded-lg border border-white/[0.08] w-full max-w-lg bg-black/40"
          />
        )
      ) : null}
    </div>
  );
}
