"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";
import { AdminSelect } from "@/components/admin/admin-select";

import { FULL_SERVICE_TYPE_DROPDOWN_OPTIONS } from "@/lib/service-type-admin-options";

const SERVICE_TYPES = FULL_SERVICE_TYPE_DROPDOWN_OPTIONS;

const ICONS = ["zap", "speaker", "network", "home", "shield", "sun", "layers", "brush"];

export default function AdminNewServicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [serviceType, setServiceType] = useState("HOUSE_DESIGN");
  const [icon, setIcon] = useState("zap");
  const [coverImage, setCoverImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [bannerImageDesktop, setBannerImageDesktop] = useState("");
  const [bannerImageMobile, setBannerImageMobile] = useState("");
  const [published, setPublished] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          shortDescription,
          serviceType,
          icon,
          coverImage: coverImage || null,
          videoUrl: videoUrl || null,
          bannerImageDesktop: bannerImageDesktop.trim() || null,
          bannerImageMobile: bannerImageMobile.trim() || null,
          published,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Ошибка");
      router.push("/admin/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/services" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
        <ArrowLeft size={16} /> Услуги
      </Link>

      <h1 className="text-2xl font-bold">Новая услуга</h1>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Название</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
            placeholder="Название услуги"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Тип</label>
          <AdminSelect value={serviceType} onValueChange={setServiceType} options={SERVICE_TYPES} />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Иконка</label>
          <div className="flex gap-2">
            {ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  icon === ic ? "border-[#0F3D2E]/50 text-emerald-300 bg-[#0F3D2E]/15" : "border-white/[0.08] text-white/40"
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <AdminMediaUpload
          label="Изображение услуги"
          accept="image"
          value={coverImage}
          onChange={setCoverImage}
        />

        <AdminMediaUpload
          label="Видео для карточки (фон)"
          accept="video"
          value={videoUrl}
          onChange={setVideoUrl}
        />

        <AdminMediaUpload
          label="Баннер лендинга — desktop (от 768px)"
          accept="image"
          value={bannerImageDesktop}
          onChange={setBannerImageDesktop}
        />

        <AdminMediaUpload
          label="Баннер лендинга — mobile"
          accept="image"
          value={bannerImageMobile}
          onChange={setBannerImageMobile}
        />

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Краткое описание</label>
          <textarea
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
            placeholder="Краткое описание услуги"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPublished(!published)}
            className={`relative w-10 h-5 rounded-full transition-colors ${published ? "bg-[#0F3D2E]" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${published ? "left-5" : "left-0.5"}`} />
          </button>
          <span className="text-sm text-white/60">{published ? "Опубликовано" : "Скрыто"}</span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] font-semibold text-sm transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Сохранение..." : "Создать"}
        </button>
      </form>
    </div>
  );
}
