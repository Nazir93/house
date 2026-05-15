"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { AdminFormSection } from "@/components/admin/admin-form-section";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";
import { RichEditor } from "@/components/admin/rich-editor";
import { AdminSelect } from "@/components/admin/admin-select";

const MATERIALS = [
  ["GAS_BLOCK", "Газобетон"],
  ["BRICK", "Кирпич"],
  ["CERAMIC_BLOCK", "Керамический блок"],
  ["FRAME", "Каркас"],
  ["OTHER", "Другое"],
] as const;

const MATERIAL_OPTIONS = MATERIALS.map(([value, label]) => ({ value, label }));

function urls(media: any[] | undefined, type: string) {
  return (media || []).filter((item) => item.type === type).map((item) => item.url).join("\n");
}

export function BuiltObjectForm({ initial }: { initial?: any }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: initial?.id || "",
    title: initial?.title || "",
    slug: initial?.slug || "",
    material: initial?.material || "GAS_BLOCK",
    area: String(initial?.area ?? ""),
    buildTerm: initial?.buildTerm || "",
    foundation: initial?.foundation || "",
    walls: initial?.walls || "",
    roof: initial?.roof || "",
    floors: String(initial?.floors ?? ""),
    location: initial?.location || "",
    latitude: String(initial?.latitude ?? ""),
    longitude: String(initial?.longitude ?? ""),
    description: initial?.description || "",
    worksDescription: initial?.worksDescription || "",
    telegramUrl: initial?.telegramUrl || "",
    vkUrl: initial?.vkUrl || "",
    houseProjectId: initial?.houseProjectId || "",
    published: Boolean(initial?.published),
    order: String(initial?.order ?? 0),
    renders: urls(initial?.media, "RENDER"),
    plans: urls(initial?.media, "PLAN"),
    stages: urls(initial?.media, "BUILD_STAGE"),
    videos: urls(initial?.media, "VIDEO"),
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function appendMediaLine(field: "renders" | "plans" | "stages" | "videos", url: string) {
    const u = url.trim();
    if (!u) return;
    setForm((prev) => {
      const cur = (prev[field] as string).trim();
      return { ...prev, [field]: cur ? `${cur}\n${u}` : u };
    });
  }

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");
    const endpoint = form.id ? `/api/admin/built-objects/${form.id}` : "/api/admin/built-objects";
    const method = form.id ? "PUT" : "POST";
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data?.error || "Не удалось сохранить объект.");
      else router.push(`/admin/built-objects/${data.id || form.id}`);
    } catch {
      setError("Не удалось отправить данные.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/built-objects" className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{form.id ? "Объект портфолио" : "Новый объект портфолио"}</h1>
          <p className="text-sm text-white/40 mt-1">Карта, карточки на сайте, этапы стройки и связь с типовым проектом.</p>
        </div>
        <button onClick={save} disabled={saving || !form.title.trim()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F3D2E] text-white text-sm font-semibold disabled:opacity-50">
          <Save size={16} /> {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}

      <AdminFormSection title="Основное" subtitle="Название, материал, координаты и технические характеристики построенного дома.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Дом в д. Вырица" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="slug" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminSelect value={form.material} onValueChange={(v) => set("material", v)} options={MATERIAL_OPTIONS} />
          <input value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="Площадь" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          <input value={form.floors} onChange={(e) => set("floors", e.target.value)} placeholder="Этажность" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          <input value={form.buildTerm} onChange={(e) => set("buildTerm", e.target.value)} placeholder="Срок строительства" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input value={form.foundation} onChange={(e) => set("foundation", e.target.value)} placeholder="Фундамент" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          <input value={form.walls} onChange={(e) => set("walls", e.target.value)} placeholder="Стены" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          <input value={form.roof} onChange={(e) => set("roof", e.target.value)} placeholder="Кровля" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Адрес/населенный пункт" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          <input value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="Широта" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          <input value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="Долгота" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        </div>
        <RichEditor value={form.description} onChange={(value) => set("description", value)} minHeight="150px" />
        <RichEditor value={form.worksDescription} onChange={(value) => set("worksDescription", value)} minHeight="120px" />
        <div className="flex flex-wrap gap-5 text-sm text-white/70">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Опубликован</label>
          <input value={form.order} onChange={(e) => set("order", e.target.value)} placeholder="Порядок" className="w-28 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        </div>
      </AdminFormSection>

      <AdminFormSection title="Медиа и ссылки" subtitle="Одна строка — один URL. Загрузка добавляет ссылку в конец выбранного списка.">
        <p className="text-[11px] text-white/45 leading-relaxed rounded-xl bg-white/[0.02] border border-white/[0.06] px-3 py-2.5">
          <span className="font-semibold text-white/60">Быстрее открывается сайт, если</span> картинки с вашего домена
          (/uploads или /public): при загрузке растр до 1920px по длинной стороне сохраняется как WebP. Лимит одного файла
          — 30&nbsp;МБ; видео — до 250&nbsp;МБ (на nginx может быть свой потолок).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminMediaUpload
            label="Загрузить фото → рендеры"
            accept="image"
            value=""
            onChange={(url) => appendMediaLine("renders", url)}
          />
          <AdminMediaUpload
            label="Загрузить изображение → планировки"
            accept="image"
            value=""
            onChange={(url) => appendMediaLine("plans", url)}
          />
          <AdminMediaUpload
            label="Загрузить фото → этапы стройки"
            accept="image"
            value=""
            onChange={(url) => appendMediaLine("stages", url)}
          />
          <AdminMediaUpload
            label="Загрузить видео → видео"
            accept="video"
            value=""
            onChange={(url) => appendMediaLine("videos", url)}
          />
        </div>
        <textarea value={form.renders} onChange={(e) => set("renders", e.target.value)} rows={4} placeholder="Рендеры / фото объекта" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        <textarea value={form.plans} onChange={(e) => set("plans", e.target.value)} rows={3} placeholder="Планировки" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        <textarea value={form.stages} onChange={(e) => set("stages", e.target.value)} rows={4} placeholder="Фото этапов строительства" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        <textarea value={form.videos} onChange={(e) => set("videos", e.target.value)} rows={3} placeholder="Видео / reels" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input value={form.houseProjectId} onChange={(e) => set("houseProjectId", e.target.value)} placeholder="ID типового проекта" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          <input value={form.telegramUrl} onChange={(e) => set("telegramUrl", e.target.value)} placeholder="Telegram" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          <input value={form.vkUrl} onChange={(e) => set("vkUrl", e.target.value)} placeholder="VK" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        </div>
      </AdminFormSection>
    </div>
  );
}
