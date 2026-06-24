"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import {
  AdminSectionHeader,
  AdminSectionSaveControl,
  draftSectionSurfaceClass,
} from "@/components/admin/admin-draft-section-save";
import { AdminBuiltObjectPublishBar } from "@/components/admin/admin-built-object-publish-bar";
import { useAdminBuiltObjectSectionSave } from "@/components/admin/use-admin-built-object-section-save";
import { BuiltObjectCaseStudyPhasesEditor } from "@/components/admin/built-object-case-study-phases-editor";
import { AdminImageUrlList, AdminPlanImageList } from "@/components/admin/admin-image-list-field";
import { RichEditor } from "@/components/admin/rich-editor";
import { AdminSelect } from "@/components/admin/admin-select";
import { createCaseStudyPhaseDefinition, normalizeCaseStudyPhaseDefinitions, parseCaseStudyPhasesJson, remapLegacyPhaseMedia } from "@/lib/portfolio-case-study-phases";
import { mapBuiltObjectMediaToForm } from "@/lib/built-object-admin-media";
import {
  BUILT_OBJECT_ADMIN_SECTION_LABELS,
  buildBuiltObjectAdminBaselineKey,
  buildBuiltObjectSectionPayload,
  hasUnpublishedBuiltObjectSiteDraft,
  type BuiltObjectAdminSection,
} from "@/lib/built-object-admin-sections";
import { BUILT_OBJECT_MAP_DISTRICTS, BUILT_OBJECT_MAP_REGIONS } from "@/lib/built-object-map-taxonomy";
import {
  parseCoordinate,
  buildBuiltObjectLocationFieldsFromInputs,
} from "@/lib/built-object-location-from-coords";
import { BuiltObjectMapPicker } from "@/components/admin/built-object-map-picker";
import { BuiltObjectHistoryEditor } from "@/components/admin/built-object-history-editor";
import { historyStagesForAdmin } from "@/lib/built-object-detail";
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

type UploadTarget = "renders" | "plans" | "videos" | "client-review-video" | `phase:${string}`;

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
  const caseStudyPhases = parseCaseStudyPhasesJson(initial?.caseStudyPhasesJson);
  const rawMedia = mapBuiltObjectMediaToForm(initial?.media, caseStudyPhases);
  const phaseMedia =
    initial?.caseStudyPhasesJson == null
      ? remapLegacyPhaseMedia(rawMedia.phaseMedia)
      : rawMedia.phaseMedia;
  return {
    id: initial?.id || "",
    title: initial?.title || "",
    slug: initial?.slug || "",
    material: initial?.material || "GAS_BLOCK",
    area: String(initial?.area ?? ""),
    rooms: String(initial?.rooms ?? ""),
    bathrooms: String(initial?.bathrooms ?? ""),
    buildTerm: initial?.buildTerm || "",
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
    clientReviewText: initial?.clientReviewText || "",
    clientReviewVideoUrl: initial?.clientReviewVideoUrl || "",
    houseProjectId: initial?.houseProjectId || "",
    order: String(initial?.order ?? 0),
    renders: rawMedia.renders,
    plans: rawMedia.plans,
    phaseMedia,
    videos: rawMedia.videos,
    historyStages: historyStagesForAdmin(initial ?? {}),
    caseStudyPhases,
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
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState<UploadTarget | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [form, setForm] = useState(() => mapBuiltObjectToForm(initial));
  const [hasUnpublishedDraft, setHasUnpublishedDraft] = useState(
    initial ? hasUnpublishedBuiltObjectSiteDraft(initial) : true,
  );
  const [publishing, setPublishing] = useState(false);
  const coordsAutoFillReady = useRef(false);
  const locationResolveSeq = useRef(0);

  useEffect(() => {
    if (initial) {
      setHasUnpublishedDraft(hasUnpublishedBuiltObjectSiteDraft(initial));
    }
  }, [initial]);

  useEffect(() => {
    if (!coordsAutoFillReady.current) {
      coordsAutoFillReady.current = true;
      return;
    }

    const lat = parseCoordinate(form.latitude);
    const lon = parseCoordinate(form.longitude);
    if (lat == null || lon == null) return;

    const seq = ++locationResolveSeq.current;
    const timer = window.setTimeout(() => {
      const patch = buildBuiltObjectLocationFieldsFromInputs(form.latitude, form.longitude);
      if (!patch || seq !== locationResolveSeq.current) return;

      setForm((prev) => {
        if (
          prev.latitude === patch.latitude &&
          prev.longitude === patch.longitude &&
          prev.regionSlug === patch.regionSlug &&
          prev.district === patch.district
        ) {
          return prev;
        }

        return {
          ...prev,
          latitude: patch.latitude,
          longitude: patch.longitude,
          regionSlug: patch.regionSlug,
          district: patch.district,
        };
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [form.latitude, form.longitude]);

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setHistoryStages(stages: typeof form.historyStages) {
    setForm((prev) => ({ ...prev, historyStages: stages }));
  }

  const buildFormSnapshot = useCallback(() => form, [form]);

  const buildSectionPayload = useCallback(
    (section: BuiltObjectAdminSection) => buildBuiltObjectSectionPayload(section, form),
    [form],
  );

  const baselineKey = useMemo(
    () => (initial?.id ? buildBuiltObjectAdminBaselineKey(initial.id, initial) : `new:${form.id || "draft"}`),
    [initial, form.id],
  );

  const { getUiState, getErrorMessage, saveSection, sectionsReady } = useAdminBuiltObjectSectionSave({
    objectId: form.id,
    baselineKey,
    buildSectionPayload,
    buildFormSnapshot,
    router,
    setGlobalErr: setError,
    onObjectCreated: (id) => {
      setForm((prev) => ({ ...prev, id }));
      router.replace(`/admin/built-objects/${id}`);
    },
  });

  const handleSaveSection = useCallback(
    async (section: BuiltObjectAdminSection) => {
      if (section === "main" && !form.title.trim()) {
        setError("Укажите название объекта");
        return;
      }
      if (section !== "main" && !form.id) {
        setError("Сначала сохраните раздел «Основное»");
        return;
      }

      setMsg("");
      const result = await saveSection(section);
      if (result.ok) {
        setHasUnpublishedDraft(result.hasUnpublishedDraft);
        setMsg(`Раздел «${BUILT_OBJECT_ADMIN_SECTION_LABELS[section]}» сохранён.`);
      }
    },
    [form.id, form.title, saveSection],
  );

  const sectionSaveControl = (section: BuiltObjectAdminSection) => (
    <AdminSectionSaveControl
      saveLabel={`Сохранить: ${BUILT_OBJECT_ADMIN_SECTION_LABELS[section]}`}
      uiState={getUiState(section)}
      errorMessage={getErrorMessage(section)}
      onSave={() => handleSaveSection(section)}
    />
  );

  const sectionClass = (section: BuiltObjectAdminSection) =>
    `space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-shadow ${draftSectionSurfaceClass(getUiState(section))}`;

  async function publishToSite() {
    if (!form.id) {
      setError("Сначала сохраните раздел «Основное»");
      return;
    }
    if (!confirm("Опубликовать объект в портфолио на сайте?")) return;

    setPublishing(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch(`/api/admin/built-objects/${form.id}/publish`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Не удалось опубликовать");
        return;
      }
      setHasUnpublishedDraft(Boolean(data.hasUnpublishedDraft));
      setMsg("Объект опубликован в портфолио на сайте.");
      router.refresh();
    } catch {
      setError("Сеть");
    } finally {
      setPublishing(false);
    }
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
          if (target === "client-review-video" && uploadedUrls[0]) {
            return { ...prev, clientReviewVideoUrl: uploadedUrls[0]! };
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

  function setCaseStudyPhases(phases: typeof form.caseStudyPhases) {
    setForm((prev) => ({ ...prev, caseStudyPhases: phases }));
  }

  function addCaseStudyPhase() {
    const next = createCaseStudyPhaseDefinition("Новый этап");
    setForm((prev) => ({
      ...prev,
      caseStudyPhases: normalizeCaseStudyPhaseDefinitions([...prev.caseStudyPhases, next]),
      phaseMedia: { ...prev.phaseMedia, [next.id]: prev.phaseMedia[next.id] ?? [] },
    }));
  }

  const uploadingPhaseId = uploading?.startsWith("phase:") ? uploading.slice("phase:".length) : null;

  return (
    <div className="max-w-4xl space-y-6">
      <AdminBuiltObjectPublishBar
        publishing={publishing}
        hasUnpublishedDraft={hasUnpublishedDraft}
        disabled={!sectionsReady}
        onPublish={() => void publishToSite()}
      />

      <div className="flex items-center gap-3">
        <Link href="/admin/built-objects" className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{form.id ? "Объект портфолио" : "Новый объект портфолио"}</h1>
          {form.id ? (
            <p className="mt-1 text-xs text-white/40">
              {initial?.published ? "На сайте опубликован" : "Черновик — не виден на сайте"}
              {hasUnpublishedDraft ? " · есть неопубликованные изменения" : ""}
            </p>
          ) : (
            <p className="mt-1 text-xs text-white/40">Сохраните «Основное», затем остальные разделы и опубликуйте на сайт.</p>
          )}
        </div>
      </div>

      {msg ? <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{msg}</div> : null}
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}

      <section className={sectionClass("main")}>
        <AdminSectionHeader title="Основное" actions={sectionSaveControl("main")} />
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
        <AdminField label="Порядок в каталоге" className="block w-28 space-y-1">
          <input value={form.order} onChange={(e) => set("order", e.target.value)} placeholder="0" className={inputClass} />
        </AdminField>
      </section>

      <section className={sectionClass("history")}>
        <AdminSectionHeader
          title="История строительства на сайте"
          actions={sectionsReady ? sectionSaveControl("history") : undefined}
        />
        {!sectionsReady ? (
          <p className="text-sm text-white/45">Сначала сохраните раздел «Основное».</p>
        ) : (
          <BuiltObjectHistoryEditor stages={form.historyStages} onChange={setHistoryStages} />
        )}
      </section>

      <section className={sectionClass("media")}>
        <AdminSectionHeader
          title="Кейс на сайте — медиа по разделам"
          actions={sectionsReady ? sectionSaveControl("media") : undefined}
        />
        {!sectionsReady ? (
          <p className="text-sm text-white/45">Сначала сохраните раздел «Основное».</p>
        ) : (
          <>
            <p className="text-[11px] text-white/35 leading-relaxed">
              Загружайте файлы — превью, порядок и удаление как в админке проектов.
            </p>
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

            <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-sm font-semibold adm-muted">Отзыв клиента</p>
              <p className="text-[11px] leading-relaxed adm-faint">
                Текст и один видеоотзыв — отображаются на карточке объекта в разделе «Отзыв клиента».
              </p>
              <AdminField label="Текст отзыва">
                <textarea
                  value={form.clientReviewText}
                  onChange={(e) => set("clientReviewText", e.target.value)}
                  rows={5}
                  placeholder="«Строили с Everhouse — всё чётко по срокам…»"
                  className={`${inputClass} min-h-[120px] resize-y text-[color:var(--adm-main-fg)]`}
                />
              </AdminField>
              <AdminField label="Видеоотзыв">
                <div className="space-y-3">
                  {form.clientReviewVideoUrl ? (
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                      <span className="max-w-full truncate font-mono text-xs adm-faint">{form.clientReviewVideoUrl}</span>
                      <button
                        type="button"
                        onClick={() => set("clientReviewVideoUrl", "")}
                        className="rounded-lg border border-white/[0.12] px-3 py-1.5 text-xs adm-muted hover:bg-white/[0.06]"
                      >
                        Удалить
                      </button>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="adm-btn-media cursor-pointer text-xs">
                      {uploading === "client-review-video" ? "Загрузка…" : "Загрузить видео"}
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={uploading === "client-review-video"}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void uploadMany("client-review-video", [file]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <input
                      value={form.clientReviewVideoUrl}
                      onChange={(e) => set("clientReviewVideoUrl", e.target.value)}
                      placeholder="или вставьте ссылку на MP4 /uploads/…"
                      className={`${inputClass} min-w-[220px] flex-1 font-mono text-xs`}
                    />
                  </div>
                  <p className="text-[10px] adm-faint">Один файл до ~100 МБ. Для YouTube/Rutube — вставьте прямую ссылку на файл или оставьте только текст.</p>
                </div>
              </AdminField>
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
          </>
        )}
      </section>

      <section className={sectionClass("phases")}>
        <AdminSectionHeader
          title="Этапы строительства (таймлайн кейса)"
          actions={
            sectionsReady ? (
              <>
                <button type="button" onClick={addCaseStudyPhase} className="adm-btn-media text-xs">
                  <Plus size={14} aria-hidden />
                  Этап
                </button>
                {sectionSaveControl("phases")}
              </>
            ) : undefined
          }
        />
        {!sectionsReady ? (
          <p className="text-sm adm-faint">Сначала сохраните раздел «Основное».</p>
        ) : (
          <BuiltObjectCaseStudyPhasesEditor
            phases={form.caseStudyPhases}
            phaseMedia={form.phaseMedia}
            onPhasesChange={setCaseStudyPhases}
            onPhaseMediaChange={setPhaseMedia}
            uploadingPhaseId={uploadingPhaseId}
            uploadProgress={uploadProgress}
            onUploadFiles={(phaseId, files) => void uploadMany(`phase:${phaseId}`, files)}
          />
        )}
      </section>
    </div>
  );
}
