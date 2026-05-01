"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { uploadAdminMedia } from "@/lib/admin-upload";

function isGifUrl(url: string): boolean {
  return /\.gif($|\?)/i.test(url);
}

export function AdminVideoListUpload({
  urls,
  onChange,
  label,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
  label: string;
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
    else if (res.url) onChange([...urls, res.url]);
  }

  function remove(i: number) {
    onChange(urls.filter((_, j) => j !== i));
  }

  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">{label}</span>
      {urls.map((url, i) => (
        <div
          key={`${url}-${i}`}
          className="flex gap-2 items-start rounded-xl border border-white/[0.08] p-2 bg-white/[0.02]"
        >
          {isGifUrl(url) ? (
            <img src={url} alt="GIF" className="max-h-40 flex-1 rounded-lg bg-black/40 w-full max-w-lg object-contain" />
          ) : (
            <video src={url} controls playsInline preload="metadata" className="max-h-40 flex-1 rounded-lg bg-black/40 w-full max-w-lg" />
          )}
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-2 text-red-400 hover:bg-white/5 rounded-lg shrink-0"
            aria-label="Удалить"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E]/25 hover:bg-[#0F3D2E]/35 text-emerald-300 text-sm font-medium cursor-pointer transition-colors border border-[#0F3D2E]/30">
        <Plus size={16} />
        {uploading ? "Загрузка…" : "Добавить видео / GIF"}
        <input
          type="file"
          accept="video/*,video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,image/gif,.gif"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </label>
      {error ? <p className="text-red-400 text-xs mt-1">{error}</p> : null}
      <p className="text-[11px] text-white/25 mt-1">
        Несколько роликов показываются в карусели баннера после фото. MP4, WebM, MOV, GIF.
      </p>
    </div>
  );
}
