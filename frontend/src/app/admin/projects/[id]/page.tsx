"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, ArrowLeft, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { AdminVideoListUpload } from "@/components/admin/admin-video-list-upload";
import { mergeProjectVideoUrls } from "@/lib/portfolio-data";
import { AdminFormSection } from "@/components/admin/admin-form-section";
import { uploadAdminMedia } from "@/lib/admin-upload";
import { RichEditor } from "@/components/admin/rich-editor";
import { AdminNativeSelect, AdminSelectOption } from "@/components/admin/admin-native-select";
import { ADMIN_PROJECT_SERVICE_OPTIONS } from "@/lib/admin-service-options";
import { CmsImage } from "@/components/ui/cms-image";

const CATEGORIES = [
  { value: "RESTAURANT", label: "Ресторан" },
  { value: "OFFICE", label: "Офис" },
  { value: "APARTMENT", label: "Квартира" },
  { value: "SHOP", label: "Магазин" },
  { value: "OTHER", label: "Другое" },
];

interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "OTHER",
    service: "ELECTRICAL",
    area: "",
    description: "",
    seoDescription: "",
    coverImage: "",
    videoUrls: [] as string[],
    location: "",
    year: "",
    industry: "",
    projectType: "",
    published: false,
    order: 0,
    featuredOnHome: false,
    homeOrder: 0,
  });

  const loadProject = useCallback(() => {
    fetch(`/api/admin/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          category: data.category || "OTHER",
          service: data.service || "ELECTRICAL",
          area: data.area?.toString() || "",
          description: data.description || "",
          seoDescription: data.seoDescription || "",
          coverImage: data.coverImage || "",
          videoUrls: mergeProjectVideoUrls(data.videoUrls, data.videoUrl),
          location: data.location || "",
          year: data.year || "",
          industry: data.industry || "",
          projectType: data.projectType || "",
          published: data.published ?? false,
          order: data.order ?? 0,
          featuredOnHome: data.featuredOnHome ?? false,
          homeOrder: data.homeOrder ?? 0,
        });
        setImages(data.images || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadProject(); }, [loadProject]);

  function set(field: string, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function addGalleryImage(file: File) {
    setUploadingGallery(true);
    setGalleryError("");
    const { url, error } = await uploadAdminMedia(file);
    setUploadingGallery(false);
    if (error) {
      setGalleryError(error);
      return;
    }
    if (!url) return;
    const res = await fetch(`/api/admin/projects/${id}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, alt: "", order: images.length }),
    });
    if (res.ok) {
      const img = await res.json();
      setImages((prev) => [...prev, img]);
    } else {
      setGalleryError("Не удалось сохранить фото в галерее.");
    }
  }

  async function removeImage(imageId: string) {
    await fetch(`/api/admin/projects/${id}/images?imageId=${imageId}`, { method: "DELETE" });
    setImages((prev) => prev.filter((i) => i.id !== imageId));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const coverImage = images.length > 0 ? images[0].url : form.coverImage;
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, coverImage }),
      });
      if (res.ok) router.push("/admin/projects");
    } catch { /* */ }
    setSaving(false);
  }

  if (loading) return <div className="p-12 text-center text-white/30">Загрузка...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/projects" className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Редактирование</h1>
          <p className="text-sm text-white/40 mt-0.5">{form.title}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>

      <AdminFormSection
        title="Обязательно для публикации"
        subtitle="Название, описание, обложка и карточка в списке. Баннер на странице кейса — обложка и галерея (ниже)."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Название</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Slug (URL)</label>
            <input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Категория</label>
            <AdminNativeSelect value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <AdminSelectOption key={c.value} value={c.value}>
                  {c.label}
                </AdminSelectOption>
              ))}
            </AdminNativeSelect>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Услуга</label>
            <AdminNativeSelect value={form.service} onChange={(e) => set("service", e.target.value)}>
              {ADMIN_PROJECT_SERVICE_OPTIONS.map((s) => (
                <AdminSelectOption key={s.value} value={s.value}>
                  {s.label}
                </AdminSelectOption>
              ))}
            </AdminNativeSelect>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Площадь (м²)</label>
            <input type="number" value={form.area} onChange={(e) => set("area", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Локация</label>
            <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="Сочи, Курортный проспект" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Год</label>
            <input type="text" value={form.year} onChange={(e) => set("year", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="2026" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Отрасль</label>
            <input type="text" value={form.industry} onChange={(e) => set("industry", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="ЗАГОРОДНЫЙ ДОМ, КОТТЕДЖ" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Тип проекта</label>
            <input type="text" value={form.projectType} onChange={(e) => set("projectType", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="КОРОБКА, ОТДЕЛКА ПОД КЛЮЧ" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/40 mb-1">Описание</label>
          <RichEditor
            value={form.description}
            onChange={(v) => set("description", v)}
            placeholder="Подробное описание проекта..."
            minHeight="150px"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/40 mb-1">
            Сниппет для поиска (meta description)
          </label>
          <p className="text-[11px] text-white/25 mb-2 leading-relaxed">
            Короткий текст без HTML для выдачи и соцсетей. Если пусто — в сниппет попадёт начало полного описания выше.
            Полное переопределение по URL — в разделе SEO → «Кейс».
          </p>
          <textarea
            value={form.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors resize-y min-h-[80px]"
            placeholder="Например: Дом 180 м² из газобетона: коробка, кровля, инженерия и отделка под ключ."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Порядок в списке портфолио</label>
            <input type="number" value={form.order} onChange={(e) => set("order", parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm text-white/60">
              <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="rounded" />
              Опубликован
            </label>
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 space-y-3">
          <p className="text-xs font-medium text-white/50">Главная страница</p>
          <p className="text-[11px] text-white/25 leading-relaxed">
            Отметьте до пяти проектов для блока «Портфолио» на главной. Порядок на главной — по полю ниже (меньше число — выше в списке).
          </p>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={form.featuredOnHome}
              onChange={(e) => set("featuredOnHome", e.target.checked)}
              className="rounded"
            />
            Показывать в блоке «Портфолио» на главной
          </label>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Порядок на главной</label>
            <input
              type="number"
              value={form.homeOrder}
              onChange={(e) => set("homeOrder", parseInt(e.target.value, 10) || 0)}
              className="w-full max-w-[140px] px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
            />
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection
        title={`Фото проекта (${images.length})`}
        subtitle="Все фото отображаются в баннере. Первое фото — обложка (карточка в списке)."
      >
        <div className="flex flex-col items-end gap-1 -mt-2 mb-2">
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
          {galleryError ? <p className="text-red-400 text-xs text-right max-w-md">{galleryError}</p> : null}
        </div>

        {images.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon size={32} className="mx-auto mb-2 text-white/10" />
            <p className="text-xs text-white/20">Нет изображений</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {images.map((img, i) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden aspect-square bg-white/[0.03]">
                <CmsImage src={img.url} alt={img.alt || ""} fill className="object-cover" sizes="(max-width: 768px) 33vw, 180px" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#0F3D2E] text-[#F6F6F4]">
                    Обложка
                  </span>
                )}
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </AdminFormSection>

      <AdminFormSection
        title="Видео"
        subtitle="Видео в карусели баннера (после фото обложки и галереи)."
      >
        <AdminVideoListUpload
          label="Видео проекта"
          urls={form.videoUrls}
          onChange={(videoUrls) => setForm((prev) => ({ ...prev, videoUrls }))}
        />
      </AdminFormSection>
    </div>
  );
}

