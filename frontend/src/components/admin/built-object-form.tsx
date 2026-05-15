"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { AdminFormSection } from "@/components/admin/admin-form-section";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";
import { RichEditor } from "@/components/admin/rich-editor";
import { AdminSelect } from "@/components/admin/admin-select";
import { CASE_STUDY_CONSTRUCTION_PHASES } from "@/lib/portfolio-case-study-phases";
import { initialPhaseMediaForm, mediaUrlsForForm } from "@/lib/built-object-admin-media";

const MATERIALS = [
  ["GAS_BLOCK", "Газобетон"],
  ["BRICK", "Кирпич"],
  ["CERAMIC_BLOCK", "Керамический блок"],
  ["FRAME", "Каркас"],
  ["OTHER", "Другое"],
] as const;

const MATERIAL_OPTIONS = MATERIALS.map(([value, label]) => ({ value, label }));

function urls(media: any[] | undefined, type: string) {
  return mediaUrlsForForm(media, type);
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
    phaseMedia: initialPhaseMediaForm(initial?.media),
    stages: mediaUrlsForForm(initial?.media, "BUILD_STAGE", null),
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

  function appendPhaseMediaLine(phaseId: string, url: string) {
    const u = url.trim();
    if (!u) return;
    setForm((prev) => {
      const cur = (prev.phaseMedia[phaseId] ?? "").trim();
      return {
        ...prev,
        phaseMedia: { ...prev.phaseMedia, [phaseId]: cur ? `${cur}\n${u}` : u },
      };
    });
  }

  function setPhaseMedia(phaseId: string, value: string) {
    setForm((prev) => ({
      ...prev,
      phaseMedia: { ...prev.phaseMedia, [phaseId]: value },
    }));
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
        </div>
        <button onClick={save} disabled={saving || !form.title.trim()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F3D2E] text-white text-sm font-semibold disabled:opacity-50">
          <Save size={16} /> {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}

      <AdminFormSection title="Основное">
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

      <AdminFormSection title="Кейс на сайте — медиа по разделам">
        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">Рендеры и фото объекта</p>
          <AdminMediaUpload
            label="Загрузить фото → рендеры"
            accept="image"
            value=""
            multiple
            onChange={(url) => appendMediaLine("renders", url)}
          />
          <textarea value={form.renders} onChange={(e) => set("renders", e.target.value)} rows={6} placeholder="Рендеры / фото объекта — по одному URL на строку" className="w-full min-h-[120px] px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono" />
        </div>

        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">Планировки</p>
          <AdminMediaUpload
            label="Загрузить изображение → планировки"
            accept="image"
            value=""
            multiple
            onChange={(url) => appendMediaLine("plans", url)}
          />
          <textarea value={form.plans} onChange={(e) => set("plans", e.target.value)} rows={4} placeholder="Планировки — по одному URL на строку" className="w-full min-h-[96px] px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono" />
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">Этапы строительства (таймлайн кейса)</p>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {CASE_STUDY_CONSTRUCTION_PHASES.map(({ id, title }) => (
              <div key={id} className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-sm font-medium text-white/85">{title}</p>
                <AdminMediaUpload
                  label={`Загрузить → ${title}`}
                  accept="image"
                  value=""
                  multiple
                  onChange={(url) => appendPhaseMediaLine(id, url)}
                />
                <textarea
                  value={form.phaseMedia[id] ?? ""}
                  onChange={(e) => setPhaseMedia(id, e.target.value)}
                  rows={3}
                  placeholder="URL фото — по одному на строку"
                  className="w-full min-h-[72px] px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs text-white font-mono"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.01] p-4">
          <p className="text-xs font-semibold text-white/45">Прочие фото этапов (без раздела)</p>
          <p className="text-[11px] text-white/35 leading-relaxed">
            Старое поле: попадает в раздел «Фото этапов строительства» в конце таймлайна. Для новых объектов лучше загружать в разделы выше.
          </p>
          <AdminMediaUpload
            label="Загрузить фото → прочие этапы"
            accept="image"
            value=""
            multiple
            onChange={(url) => appendMediaLine("stages", url)}
          />
          <textarea value={form.stages} onChange={(e) => set("stages", e.target.value)} rows={4} placeholder="По одному URL на строку" className="w-full min-h-[96px] px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono" />
        </div>

        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">Видео</p>
          <AdminMediaUpload
            label="Загрузить видео"
            accept="video"
            value=""
            multiple
            onChange={(url) => appendMediaLine("videos", url)}
          />
          <textarea value={form.videos} onChange={(e) => set("videos", e.target.value)} rows={4} placeholder="Видео / reels — по одному URL на строку" className="w-full min-h-[96px] px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input value={form.houseProjectId} onChange={(e) => set("houseProjectId", e.target.value)} placeholder="ID типового проекта" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          <input value={form.telegramUrl} onChange={(e) => set("telegramUrl", e.target.value)} placeholder="Telegram" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          <input value={form.vkUrl} onChange={(e) => set("vkUrl", e.target.value)} placeholder="VK" className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        </div>
      </AdminFormSection>
    </div>
  );
}
