"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Plus, Image as ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { AdminVideoListUpload } from "@/components/admin/admin-video-list-upload";
import { AdminFormSection } from "@/components/admin/admin-form-section";
import { AdminNativeSelect, AdminSelectOption } from "@/components/admin/admin-native-select";
import { RichEditor } from "@/components/admin/rich-editor";
import { uploadAdminMedia } from "@/lib/admin-upload";
import { mergeProjectServiceOptionsForForm } from "@/lib/admin-service-options";
import { useProjectServiceSelectOptions } from "@/lib/use-project-service-select-options";
import { CmsImage } from "@/components/ui/cms-image";

const CATEGORIES = [
  { value: "RESTAURANT", label: "Ресторан" },
  { value: "OFFICE", label: "Офис" },
  { value: "APARTMENT", label: "Квартира" },
  { value: "SHOP", label: "Магазин" },
  { value: "OTHER", label: "Другое" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const { options: cmsServiceOptions } = useProjectServiceSelectOptions();
  const [saving, setSaving] = useState(false);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "OTHER",
    service: "ELECTRICAL",
    area: "",
    description: "",
    seoDescription: "",
    videoUrls: [] as string[],
    location: "",
    year: new Date().getFullYear().toString(),
    industry: "",
    projectType: "",
    published: false,
    order: 0,
    featuredOnHome: false,
    homeOrder: 0,
  });

  function set(field: string, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function addGalleryImage(file: File) {
    setUploadingGallery(true);
    setGalleryError("");
    const { url, error } = await uploadAdminMedia(file);
    setUploadingGallery(false);
    if (error) { setGalleryError(error); return; }
    if (url) setGalleryUrls((prev) => [...prev, url]);
  }

  function removeGalleryImage(index: number) {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          coverImage: galleryUrls[0] || "",
          galleryUrls,
        }),
      });
      if (res.ok) {
        const project = await res.json();
        router.push(`/admin/projects/${project.id}`);
      }
    } catch { /* */ }
    setSaving(false);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/projects" className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Новый проект</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !form.title.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Сохранение..." : "Создать"}
        </button>
      </div>

      <AdminFormSection
        title="Обязательно для публикации"
        subtitle="Название, категория объекта, услуга и описание — как на странице кейса и в списке портфолио. Услуга в списке совпадает с карточками в «Услуги» (тип из поля услуги в CMS)."
      >
        <div>
          <label className="block text-xs font-medium text-white/40 mb-1">Название проекта</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
            placeholder="Например: коттедж 180 м², посёлок …"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {mergeProjectServiceOptionsForForm(cmsServiceOptions, form.service).map((s) => (
                <AdminSelectOption key={s.value} value={s.value}>
                  {s.label}
                </AdminSelectOption>
              ))}
            </AdminNativeSelect>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/40 mb-1">Площадь (м²)</label>
          <input type="number" value={form.area} onChange={(e) => set("area", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
            placeholder="150" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Локация</label>
            <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="Сочи, Курортный проспект" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Год</label>
            <input type="text" value={form.year} onChange={(e) => set("year", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="2026" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Отрасль</label>
            <input type="text" value={form.industry} onChange={(e) => set("industry", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="ЗАГОРОДНЫЙ ДОМ, КОТТЕДЖ" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Тип проекта</label>
            <input type="text" value={form.projectType} onChange={(e) => set("projectType", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
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
            Короткий текст без HTML. Если пусто — сниппет соберётся из начала полного описания.
          </p>
          <textarea
            value={form.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors resize-y min-h-[80px]"
            placeholder="Дом из кирпича 220 м²: фундамент, коробка, коммуникации, фасад и отделка."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1">Порядок в списке портфолио</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => set("order", parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
            />
          </div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 space-y-3">
          <p className="text-xs font-medium text-white/50">Главная страница</p>
          <p className="text-[11px] text-white/25 leading-relaxed">
            До пяти проектов с галочкой — в блоке «Портфолио» на главной. Порядок — по полю ниже (меньше — выше).
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

        <label className="flex items-center gap-2 text-sm text-white/60">
          <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="rounded" />
          Опубликовать сразу
        </label>
      </AdminFormSection>

      {/* Фото проекта */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Фото проекта ({galleryUrls.length})</p>
            <p className="text-[11px] text-white/30 mt-0.5">Первое фото станет обложкой. Все фото отображаются в баннере.</p>
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
          <div className="text-center py-8">
            <ImageIcon size={32} className="mx-auto mb-2 text-white/10" />
            <p className="text-xs text-white/20">Нет изображений</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {galleryUrls.map((url, i) => (
              <div key={`${url}-${i}`} className="relative group rounded-lg overflow-hidden aspect-square bg-white/[0.03]">
                <CmsImage src={url} alt="" fill className="object-cover" sizes="(max-width: 768px) 33vw, 180px" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#0F3D2E] text-[#F6F6F4]">
                    Обложка
                  </span>
                )}
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

      {/* Видео */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5">
        <AdminVideoListUpload
          label="Видео проекта (в баннере после фото)"
          urls={form.videoUrls}
          onChange={(videoUrls) => setForm((prev) => ({ ...prev, videoUrls }))}
        />
      </div>
    </div>
  );
}
