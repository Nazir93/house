"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Image as ImageIcon, Trash2 } from "lucide-react";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";
import { AdminVideoListUpload } from "@/components/admin/admin-video-list-upload";
import { RichEditor } from "@/components/admin/rich-editor";
import { uploadAdminMedia } from "@/lib/admin-upload";
import { AdminSelect } from "@/components/admin/admin-select";
import { CmsImage } from "@/components/ui/cms-image";

const CATEGORIES = [
  "Строительство домов",
  "Проектирование",
  "Инженерные системы",
  "Отделка и ремонт",
  "Ипотека и финансы",
  "Новости компании",
];

export default function AdminNewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [published, setPublished] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [coverVideos, setCoverVideos] = useState<string[]>([]);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState("");

  async function addGalleryImage(file: File) {
    setUploadingGallery(true);
    setGalleryError("");
    const { url, error: uploadError } = await uploadAdminMedia(file, {
      nameHint: title || "post",
      role: "gallery",
    });
    setUploadingGallery(false);
    if (uploadError) { setGalleryError(uploadError); return; }
    if (url) setGalleryUrls((prev) => [...prev, url]);
  }

  function removeGalleryImage(index: number) {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          category,
          published,
          coverImage: coverImage || null,
          coverVideos,
          galleryUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка создания");
      }

      router.push("/admin/posts");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/posts" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
        <ArrowLeft size={16} /> Новости
      </Link>

      <h1 className="text-2xl font-bold">Новая запись</h1>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
            placeholder="Название статьи"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Категория</label>
          <AdminSelect
            value={category}
            onValueChange={setCategory}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </div>

        <AdminMediaUpload
          label="Обложка (первое фото в баннере)"
          accept="image"
          value={coverImage}
          onChange={setCoverImage}
          nameHint={title || "post"}
          role="cover"
        />

        {/* Галерея фото */}
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Галерея ({galleryUrls.length})</p>
              <p className="text-[11px] text-white/30 mt-0.5">Дополнительные фото в баннере (после обложки, перед видео)</p>
            </div>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F3D2E]/15 text-emerald-300 text-xs font-semibold cursor-pointer hover:bg-[#0F3D2E]/25 transition-colors">
              <Plus size={14} /> {uploadingGallery ? "Загрузка..." : "Добавить фото"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploadingGallery}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) void Promise.all(Array.from(files).map((f) => addGalleryImage(f)));
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {galleryError && <p className="text-red-400 text-xs">{galleryError}</p>}
          {galleryUrls.length === 0 ? (
            <div className="text-center py-6">
              <ImageIcon size={28} className="mx-auto mb-1.5 text-white/10" />
              <p className="text-xs text-white/20">Нет изображений</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {galleryUrls.map((url, i) => (
                <div key={`${url}-${i}`} className="relative group rounded-lg overflow-hidden aspect-square bg-white/[0.03]">
                  <CmsImage src={url} alt="" fill className="object-cover" sizes="(max-width: 768px) 33vw, 180px" />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(i)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <AdminVideoListUpload
          label="Видео в баннере (после фото)"
          urls={coverVideos}
          onChange={setCoverVideos}
          nameHint={title || "post"}
        />

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Краткое описание</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
            placeholder="Краткое описание для карточки"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Содержание</label>
          <RichEditor
            value={content}
            onChange={setContent}
            placeholder="Текст статьи..."
            minHeight="300px"
            nameHint={title || "post"}
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
          <span className="text-sm text-white/60">{published ? "Опубликовано" : "Черновик"}</span>
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
