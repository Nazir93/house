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
  className = "",
}: {
  label: string;
  accept: Accept;
  value: string;
  onChange: (url: string) => void;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    const res = await uploadAdminMedia(file);
    setUploading(false);
    if (res.error) setError(res.error);
    else if (res.url) onChange(res.url);
  }

  const acceptAttr =
    accept === "image"
      ? "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif"
      : "video/*,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.mkv,.m4v,.avi,image/gif,.gif";

  const btnLabel =
    uploading ? "Загрузка…" : accept === "image" ? "Выбрать изображение" : "Выбрать видеофайл";

  return (
    <div className={className}>
      <span className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E]/25 hover:bg-[#0F3D2E]/35 text-emerald-300 text-sm font-medium cursor-pointer transition-colors border border-[#0F3D2E]/30">
          <Upload size={16} />
          {btnLabel}
          <input
            type="file"
            accept={acceptAttr}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              onFile(e.target.files?.[0]);
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
      <p className="text-[11px] text-white/25 mt-1.5">
        {accept === "image"
          ? "JPG, PNG, WebP, GIF, SVG, AVIF — по возможности конвертируется в WebP."
          : "MP4, WebM, MOV, AVI и др. На сервере действует лимит размера (nginx ~25–300 МБ — см. конфиг). Файл без расширения определяется по типу в браузере."}
      </p>
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
