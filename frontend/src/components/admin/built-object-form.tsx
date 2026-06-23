"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { AdminFormSection } from "@/components/admin/admin-form-section";
import { AdminImageUrlList, AdminPlanImageList } from "@/components/admin/admin-image-list-field";
import { RichEditor } from "@/components/admin/rich-editor";
import { AdminSelect } from "@/components/admin/admin-select";
import { CASE_STUDY_CONSTRUCTION_PHASES } from "@/lib/portfolio-case-study-phases";
import { mapBuiltObjectMediaToForm } from "@/lib/built-object-admin-media";
import { BUILT_OBJECT_MAP_DISTRICTS, BUILT_OBJECT_MAP_REGIONS } from "@/lib/built-object-map-taxonomy";
import { BuiltObjectMapPicker } from "@/components/admin/built-object-map-picker";
import { BuiltObjectHistoryEditor } from "@/components/admin/built-object-history-editor";
import { historyStagesForAdmin, serializeConstructionHistory } from "@/lib/built-object-detail";
import type { AdminHouseProjectOption } from "@/lib/load-admin-house-project-options";
import { uploadAdminMedia } from "@/lib/admin-upload";

const MATERIALS = [
  ["GAS_BLOCK", "Газобетон"],
  ["BRICK", "Кирпич"],
  ["CERAMIC_BLOCK", "Керамический блок"],
  ["FRAME", "Каркас"],
  ["OTHER", "Другое"],
] as const;

const MATERIAL_OPTIONS = MATERIALS.map(([value, label]) => ({ value, label }));

const REGION_OPTIONS = [
  { value: "", label: "Не указан (регион по адресу)" },
  ...BUILT_OBJECT_MAP_REGIONS.map((r) => ({ value: r.slug, label: r.label })),
];

const SITE_STATUS_OPTIONS = [
  { value: "COMPLETED", label: "Сдан / готов" },
  { value: "UNDER_CONSTRUCTION", label: "Строится (стройплощадка)" },
];

type UploadTarget = "renders" | "plans" | "stages" | "videos" | `phase:${string}`;

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white";

function AdminField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={className ?? "block space-y-1"}>
      <span className="block text-xs font-medium text-white/45">{label}</span>
      {children}
    </label>
  );
}

function mapBuiltObjectToForm(initial?: any) {
  const media = mapBuiltObjectMediaToForm(initial?.media);
  return {
    id: initial?.id || "",
    title: initial?.title || "",
    slug: initial?.slug || "",
    material: initial?.material || "GAS_BLOCK",
    area: String(initial?.area ?? ""),
    rooms: String(initial?.rooms ?? ""),
    bathrooms: String(initial?.bathrooms ?? ""),
    buildTerm: initial?.buildTerm || "",
    foundation: initial?.foundation || "",
    walls: initial?.walls || "",
    roof: initial?.roof || "",
    floors: String(initial?.floors ?? ""),
    location: initial?.location || "",
    latitude: String(initial?.latitude ?? ""),
    longitude: String(initial?.longitude ?? ""),
    regionSlug: initial?.regionSlug || "",
    district: initial?.district || "",
    siteStatus: initial?.siteStatus === "UNDER_CONSTRUCTION" ? "UNDER_CONSTRUCTION" : "COMPLETED",
    description: initial?.description || "",
    worksDescription: initial?.worksDescription || "",
    telegramUrl: initial?.telegramUrl || "",
    vkUrl: initial?.vkUrl || "",
    houseProjectId: initial?.houseProjectId || "",
    published: Boolean(initial?.published),
    order: String(initial?.order ?? 0),
    renders: media.renders,
    plans: media.plans,
    phaseMedia: media.phaseMedia,
    stages: media.stages,
    videos: media.videos,
    historyStages: historyStagesForAdmin(initial ?? {}),
  };
}

export function BuiltObjectForm({
  initial,
  houseProjects = [],
}: {
  initial?: any;
  houseProjects?: AdminHouseProjectOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState<UploadTarget | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [form, setForm] = useState(() => mapBuiltObjectToForm(initial));

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setHistoryStages(stages: typeof form.historyStages) {
    setForm((prev) => ({ ...prev, historyStages: stages }));
  }

  const houseProjectOptions = useMemo(
    () => [
      { value: "", label: "Без привязки к проекту" },
      ...houseProjects.map((p) => ({
        value: p.id,
        label: `${p.title} — /projects/${p.slug}${p.published ? "" : " (не опубликован)"}`,
      })),
    ],
    [houseProjects],
  );

  function applyHouseProjectLink(projectId: string) {
    const project = houseProjects.find((p) => p.id === projectId);
    setForm((prev) => {
      const next = { ...prev, houseProjectId: projectId };
      if (!project) return next;
      if (!prev.area.trim()) next.area = String(project.area);
      if (!prev.rooms.trim()) next.rooms = String(project.rooms);
      if (!prev.bathrooms.trim()) next.bathrooms = String(project.bathrooms);
      return next;
    });
  }

  const districtOptions = useMemo(() => {
    const rs = form.regionSlug?.trim();
    if (!rs) return [{ value: "", label: "Сначала выберите регион" }];
    const list = BUILT_OBJECT_MAP_DISTRICTS[rs] ?? [];
    const opts = [{ value: "", label: "Не указан" }, ...list.map((d) => ({ value: d.slug, label: d.label }))];
    const cur = form.district?.trim();
    if (cur && !opts.some((o) => o.value === cur)) opts.push({ value: cur, label: `${cur} (из БД)` });
    return opts;
  }, [form.regionSlug, form.district]);

  async function uploadMany(target: UploadTarget, files: File[]) {
    if (files.length === 0) return;
    setUploading(target);
    setUploadProgress("");
    setError("");
    const errors: string[] = [];
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]!;
        if (files.length > 1) setUploadProgress(`${i + 1} / ${files.length}`);
        const { url, error: uploadError } = await uploadAdminMedia(file);
        if (uploadError || !url) {
          errors.push(
            uploadError
              ? `${uploadError} (файл ${i + 1}${file.name ? `: ${file.name}` : ""})`
              : `Не удалось загрузить файл ${i + 1}${file.name ? `: ${file.name}` : ""}.`,
          );
          continue;
        }
        uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        setForm((prev) => {
          if (target === "renders") {
            return { ...prev, renders: [...prev.renders, ...uploadedUrls] };
          }
          if (target === "plans") {
            return {
              ...prev,
              plans: [...prev.plans, ...uploadedUrls.map((url) => ({ url, label: "" }))],
            };
          }
          if (target === "stages") {
            return { ...prev, stages: [...prev.stages, ...uploadedUrls] };
          }
          if (target === "videos") {
            return { ...prev, videos: [...prev.videos, ...uploadedUrls] };
          }
          if (target.startsWith("phase:")) {
            const phaseId = target.slice("phase:".length);
            const cur = prev.phaseMedia[phaseId] ?? [];
            return {
              ...prev,
              phaseMedia: { ...prev.phaseMedia, [phaseId]: [...cur, ...uploadedUrls] },
            };
          }
          return prev;
        });
      }
    } finally {
      setUploading(null);
      setUploadProgress("");
    }

    if (errors.length) setError(errors.join(" "));
  }

  function setPhaseMedia(phaseId: string, items: string[]) {
    setForm((prev) => ({
      ...prev,
      phaseMedia: { ...prev.phaseMedia, [phaseId]: items },
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
        body: JSON.stringify({
          ...form,
          constructionHistoryJson: serializeConstructionHistory(form.historyStages),
        }),
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
          <AdminField label="Название объекта">
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Дом в д. Вырица" className={inputClass} />
          </AdminField>
          <AdminField label="Slug (URL)">
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="vsevolozhsk" className={`${inputClass} font-mono`} />
          </AdminField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminField label="Типовой проект (кнопка «Хочу такой дом»)">
            <AdminSelect
              value={form.houseProjectId}
              onValueChange={applyHouseProjectLink}
              options={houseProjectOptions}
            />
          </AdminField>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <AdminField label="Материал">
            <AdminSelect value={form.material} onValueChange={(v) => set("material", v)} options={MATERIAL_OPTIONS} />
          </AdminField>
          <AdminField label="Площадь, м²">
            <input value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="247" className={inputClass} />
          </AdminField>
          <AdminField label="Спальни">
            <input value={form.rooms} onChange={(e) => set("rooms", e.target.value)} placeholder="4" className={inputClass} />
          </AdminField>
          <AdminField label="Санузлы">
            <input value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} placeholder="2" className={inputClass} />
          </AdminField>
          <AdminField label="Этажность">
            <input value={form.floors} onChange={(e) => set("floors", e.target.value)} placeholder="1, 1.5, 2…" className={inputClass} />
          </AdminField>
          <AdminField label="Срок строительства">
            <input value={form.buildTerm} onChange={(e) => set("buildTerm", e.target.value)} placeholder="211 или 211 дней" className={inputClass} />
          </AdminField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminField label="Фундамент">
            <input value={form.foundation} onChange={(e) => set("foundation", e.target.value)} placeholder="Монолитная плита" className={inputClass} />
          </AdminField>
          <AdminField label="Стены">
            <input value={form.walls} onChange={(e) => set("walls", e.target.value)} placeholder="Газобетон D400" className={inputClass} />
          </AdminField>
          <AdminField label="Кровля">
            <input value={form.roof} onChange={(e) => set("roof", e.target.value)} placeholder="Металлочерепица" className={inputClass} />
          </AdminField>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminField label="Адрес / населённый пункт">
            <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="г. Всеволожск" className={inputClass} />
          </AdminField>
          <AdminField label="Широта">
            <input value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="≈59 для СПб" className={`${inputClass} font-mono`} />
          </AdminField>
          <AdminField label="Долгота">
            <input value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="≈30 для СПб" className={`${inputClass} font-mono`} />
          </AdminField>
        </div>
        <BuiltObjectMapPicker
          latitude={form.latitude}
          longitude={form.longitude}
          onCoordinatesChange={(lat, lon) => setForm((prev) => ({ ...prev, latitude: lat, longitude: lon }))}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminField label="Регион">
            <AdminSelect
              value={form.regionSlug}
              onValueChange={(v) => setForm((prev) => ({ ...prev, regionSlug: v, district: "" }))}
              options={REGION_OPTIONS}
            />
          </AdminField>
          <AdminField label="Район">
            <AdminSelect
              value={form.district}
              onValueChange={(v) => set("district", v)}
              options={districtOptions}
              disabled={!form.regionSlug.trim()}
            />
          </AdminField>
          <AdminField label="Статус объекта">
            <AdminSelect value={form.siteStatus} onValueChange={(v) => set("siteStatus", v)} options={SITE_STATUS_OPTIONS} />
          </AdminField>
        </div>
        <AdminField label="Описание объекта">
          <RichEditor value={form.description} onChange={(value) => set("description", value)} minHeight="150px" />
        </AdminField>
        <AdminField label="Описание работ">
          <RichEditor value={form.worksDescription} onChange={(value) => set("worksDescription", value)} minHeight="120px" />
        </AdminField>
        <div className="flex flex-wrap items-end gap-5 text-sm text-white/70">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Опубликован
          </label>
          <AdminField label="Порядок в каталоге" className="block w-28 space-y-1">
            <input value={form.order} onChange={(e) => set("order", e.target.value)} placeholder="0" className={inputClass} />
          </AdminField>
        </div>
      </AdminFormSection>

      <AdminFormSection title="История строительства на сайте">
        <BuiltObjectHistoryEditor stages={form.historyStages} onChange={setHistoryStages} />
      </AdminFormSection>

      <AdminFormSection title="Кейс на сайте — медиа по разделам" subtitle="Загружайте файлы — превью, порядок и удаление как в админке проектов.">
        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <AdminImageUrlList
            title="Рендеры и фото объекта"
            items={form.renders}
            onItemsChange={(renders) => setForm((prev) => ({ ...prev, renders }))}
            uploading={uploading === "renders"}
            uploadProgress={uploadProgress}
            onUploadFiles={(files) => void uploadMany("renders", files)}
            emptyHint="Первое фото станет обложкой в каталоге портфолио."
          />
        </div>

        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <AdminPlanImageList
            title="Планировки"
            plans={form.plans}
            onPlansChange={(plans) => setForm((prev) => ({ ...prev, plans }))}
            uploading={uploading === "plans"}
            uploadProgress={uploadProgress}
            onUploadFiles={(files) => void uploadMany("plans", files)}
          />
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">Этапы строительства (таймлайн кейса)</p>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {CASE_STUDY_CONSTRUCTION_PHASES.map(({ id, title }) => (
              <div key={id} className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-sm font-medium text-white/85">{title}</p>
                <AdminImageUrlList
                  title="Фото этапа"
                  items={form.phaseMedia[id] ?? []}
                  onItemsChange={(items) => setPhaseMedia(id, items)}
                  uploading={uploading === `phase:${id}`}
                  uploadProgress={uploadProgress}
                  onUploadFiles={(files) => void uploadMany(`phase:${id}`, files)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.01] p-4">
          <p className="text-xs font-semibold text-white/45">Прочие фото этапов (без раздела)</p>
          <p className="text-[11px] leading-relaxed text-white/35">
            Старое поле: попадает в раздел «Фото этапов строительства» в конце таймлайна. Для новых объектов лучше загружать в разделы выше.
          </p>
          <AdminImageUrlList
            title="Прочие этапы"
            items={form.stages}
            onItemsChange={(stages) => setForm((prev) => ({ ...prev, stages }))}
            uploading={uploading === "stages"}
            uploadProgress={uploadProgress}
            onUploadFiles={(files) => void uploadMany("stages", files)}
          />
        </div>

        <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <AdminImageUrlList
            title="Видео"
            items={form.videos}
            onItemsChange={(videos) => setForm((prev) => ({ ...prev, videos }))}
            uploading={uploading === "videos"}
            uploadProgress={uploadProgress}
            onUploadFiles={(files) => void uploadMany("videos", files)}
            accept="video/*"
            emptyHint="MP4 или другие видеофайлы с сервера."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminField label="Telegram">
            <input value={form.telegramUrl} onChange={(e) => set("telegramUrl", e.target.value)} placeholder="https://t.me/..." className={inputClass} />
          </AdminField>
          <AdminField label="VK">
            <input value={form.vkUrl} onChange={(e) => set("vkUrl", e.target.value)} placeholder="https://vk.com/..." className={inputClass} />
          </AdminField>
        </div>
      </AdminFormSection>
    </div>
  );
}
