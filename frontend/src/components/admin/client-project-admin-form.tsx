"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ClientDocumentSignatureMethod,
  ClientDocumentSignatureStatus,
  ClientStageStatus,
} from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Plus } from "lucide-react";
import {
  AdminDraftSectionSaveControl,
  AdminSectionHeader,
  draftSectionSurfaceClass,
} from "@/components/admin/admin-draft-section-save";
import { AdminClientProjectPublishBar } from "@/components/admin/admin-client-project-publish-bar";
import { AdminStagesEditor } from "@/components/admin/admin-stages-editor";
import { useAdminDraftSectionSave } from "@/components/admin/use-admin-draft-section-save";
import { AdminSelect } from "@/components/admin/admin-select";
import { AdminDocumentsEditor } from "@/components/admin/admin-documents-editor";
import {
  AdminPaymentsEditorTable,
  type AdminPaymentRow,
} from "@/components/admin/admin-payments-editor-table";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";
import { AdminPhotoReportsEditor } from "@/components/admin/admin-photo-reports-editor";
import { ClientWallMaterialSelect } from "@/components/admin/client-wall-material-select";
import { createAdminStageRow, type AdminStageRow } from "@/lib/admin-client-stage-rows";
import {
  buildDefaultAdminStageRows,
  standardTopLevelStageTemplate,
} from "@/lib/client-project-stage-icons";
import { computeOverallProgressFromStages } from "@/lib/client-project-progress";
import {
  formatCurrentStageLabel,
  getCurrentStagesInProgress,
} from "@/lib/client-project-stage-status";
import type { ClientProjectDraftSection } from "@/lib/client-project-draft";
import { buildClientProjectDraftBaselineKey } from "@/lib/draft-section-baseline";
import { CLIENT_STAGE_STATUS_OPTIONS } from "@/lib/client-stage-status";
import { formatDateTimeRu, ticketStatusLabel } from "@/lib/client-portal-labels";
import { BuiltObjectMapPicker } from "@/components/admin/built-object-map-picker";

const ADMIN_COMPACT_SELECT_TRIGGER =
  "rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0F3D2E]";

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export type ClientProjectAdminInitial = {
  contractNumber: string;
  title: string;
  clientName: string | null;
  clientEmail: string | null;
  area: number | null;
  wallMaterial: string | null;
  startDate: string | null;
  plannedEndDate: string | null;
  coverImageUrl: string | null;
  overallProgress: number;
  currentStageLabel: string | null;
  foremanName: string | null;
  cameraStreamUrl: string | null;
  houseProjectId: string | null;
  showOnPublicSite: boolean;
  location: string | null;
  latitude: string | null;
  longitude: string | null;
  builtObjectId: string | null;
  hasUnpublishedDraft?: boolean;
  draftSavedAt?: string | null;
  cabinetPublishedAt?: string | null;
  stages: {
    id: string;
    parentId: string | null;
    order: number;
    title: string;
    iconKey: string;
    status: string;
  }[];
  payments: {
    label: string;
    amountKopeks: number;
    dueDate: string | null;
    status: string;
    paidAt: string | null;
    order: number;
  }[];
  documents: {
    id: string;
    filename: string;
    url: string;
    order: number;
    signatureStatus: ClientDocumentSignatureStatus;
    signatureMethod: ClientDocumentSignatureMethod | null;
    signedByName: string | null;
    signatureSmsPhone: string | null;
    signedResultUrl: string | null;
    signedAt: string | null;
  }[];
  photoReports: { id: string; url: string; caption: string | null; order: number }[];
  tickets: {
    id: string;
    subject: string;
    status: string;
    messages: { authorType: string; body: string; createdAt: string }[];
  }[];
};

export function ClientProjectAdminForm({
  projectId,
  initial,
}: {
  projectId: string;
  initial: ClientProjectAdminInitial;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [contractNumber, setContractNumber] = useState(initial.contractNumber);
  const [plainPassword, setPlainPassword] = useState("");
  const [title, setTitle] = useState(initial.title);
  const [clientName, setClientName] = useState(initial.clientName ?? "");
  const [clientEmail, setClientEmail] = useState(initial.clientEmail ?? "");
  const [area, setArea] = useState(initial.area?.toString() ?? "");
  const [wallMaterial, setWallMaterial] = useState(initial.wallMaterial ?? "");
  const [startDate, setStartDate] = useState(toDateInput(initial.startDate));
  const [plannedEndDate, setPlannedEndDate] = useState(toDateInput(initial.plannedEndDate));
  const [coverImageUrl, setCoverImageUrl] = useState(initial.coverImageUrl ?? "");
  const [foremanName, setForemanName] = useState(initial.foremanName ?? "");
  const [cameraStreamUrl, setCameraStreamUrl] = useState(initial.cameraStreamUrl ?? "");
  const [houseProjectId, setHouseProjectId] = useState(initial.houseProjectId ?? "");
  const [showOnPublicSite, setShowOnPublicSite] = useState(initial.showOnPublicSite);
  const [location, setLocation] = useState(initial.location ?? "");
  const [latitude, setLatitude] = useState(initial.latitude ?? "");
  const [longitude, setLongitude] = useState(initial.longitude ?? "");

  const [stages, setStages] = useState<AdminStageRow[]>(
    initial.stages.length > 0
      ? initial.stages.map((s) => ({
          clientKey: s.id,
          parentClientKey: s.parentId,
          order: s.order,
          title: s.title,
          iconKey: s.iconKey,
          status: s.status,
        }))
      : [createAdminStageRow({ title: "Этап" })]
  );

  const computedProgress = useMemo(
    () =>
      computeOverallProgressFromStages(
        stages.map((s) => ({
          clientKey: s.clientKey,
          parentClientKey: s.parentClientKey,
          status: s.status as ClientStageStatus,
        }))
      ),
    [stages]
  );

  const stagesWithMeta = useMemo(
    () =>
      stages.map((s) => ({
        id: s.clientKey,
        parentId: s.parentClientKey,
        status: s.status as ClientStageStatus,
        title: s.title,
        iconKey: s.iconKey,
        order: s.order,
      })),
    [stages]
  );

  const currentStagesPreview = useMemo(
    () => getCurrentStagesInProgress(stagesWithMeta),
    [stagesWithMeta]
  );

  const currentStageLabelPreview = useMemo(
    () => formatCurrentStageLabel(stagesWithMeta),
    [stagesWithMeta]
  );

  const [payments, setPayments] = useState<AdminPaymentRow[]>(
    initial.payments.length > 0
      ? initial.payments.map((p) => ({
          order: p.order,
          label: p.label,
          amountRubles: p.amountKopeks / 100,
          dueDate: toDateInput(p.dueDate),
          status: p.status,
          paidAt: toDateInput(p.paidAt),
        }))
      : []
  );

  const tickets = initial.tickets;
  const [hasUnpublishedDraft, setHasUnpublishedDraft] = useState(initial.hasUnpublishedDraft ?? false);
  const [publishing, setPublishing] = useState(false);
  useEffect(() => {
    setHasUnpublishedDraft(initial.hasUnpublishedDraft ?? false);
  }, [initial.hasUnpublishedDraft]);

  useEffect(() => {
    setCoverImageUrl(initial.coverImageUrl ?? "");
  }, [initial.coverImageUrl]);

  const buildDraftPayload = useCallback(
    (section: ClientProjectDraftSection): Record<string, unknown> => {
      switch (section) {
        case "main":
          return {
            contractNumber,
            plainPassword: plainPassword.trim() || undefined,
            title,
            clientName: clientName.trim() || null,
            clientEmail: clientEmail.trim() || null,
            area: area.trim() === "" ? null : parseInt(area, 10) || null,
            wallMaterial: wallMaterial.trim() || null,
            startDate: startDate || null,
            plannedEndDate: plannedEndDate || null,
            coverImageUrl: coverImageUrl.trim() || null,
            foremanName: foremanName.trim() || null,
            cameraStreamUrl: cameraStreamUrl.trim() || null,
            houseProjectId: houseProjectId.trim() || null,
            showOnPublicSite,
            location: location.trim() || null,
            latitude: latitude.trim() || null,
            longitude: longitude.trim() || null,
          };
        case "stages":
          return {
            stages: stages.map((s) => ({
              clientKey: s.clientKey,
              parentClientKey: s.parentClientKey,
              order: s.order,
              title: s.title,
              iconKey: s.iconKey,
              status: s.status,
            })),
          };
        case "payments":
          return {
            payments: payments.map((p, i) => ({
              order: i,
              label: p.label,
              amountRubles: p.amountRubles,
              dueDate: p.dueDate || null,
              status: p.status,
              paidAt: p.paidAt || null,
            })),
          };
        case "documents":
        case "photos":
          return {};
      }
    },
    [
      contractNumber,
      plainPassword,
      title,
      clientName,
      clientEmail,
      area,
      wallMaterial,
      startDate,
      plannedEndDate,
      coverImageUrl,
      foremanName,
      cameraStreamUrl,
      houseProjectId,
      showOnPublicSite,
      location,
      latitude,
      longitude,
      stages,
      payments,
    ]
  );

  const draftBaselineKey = useMemo(
    () => buildClientProjectDraftBaselineKey(projectId, initial),
    [projectId, initial]
  );

  const { getUiState, getErrorMessage, saveDraftSection, markMediaSectionDirty } =
    useAdminDraftSectionSave({
      projectId,
      baselineKey: draftBaselineKey,
      buildDraftPayload,
      router,
      setGlobalErr: setErr,
    });

  const handleSaveSection = useCallback(
    async (section: ClientProjectDraftSection) => {
      setMsg("");
      const result = await saveDraftSection(section);
      if (result.ok) {
        setHasUnpublishedDraft(result.hasUnpublishedDraft);
        if (section === "main") setPlainPassword("");
      }
    },
    [saveDraftSection]
  );

  const sectionSaveControl = (section: ClientProjectDraftSection) => (
    <AdminDraftSectionSaveControl
      section={section}
      uiState={getUiState(section)}
      errorMessage={getErrorMessage(section)}
      onSave={() => handleSaveSection(section)}
    />
  );

  const sectionClass = (
    section: ClientProjectDraftSection,
    density: "normal" | "compact" = "normal"
  ) =>
    `${density === "compact" ? "space-y-3" : "space-y-4"} rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-shadow ${draftSectionSurfaceClass(getUiState(section))}`;

  async function publishToCabinet() {
    if (!confirm("Опубликовать текущий черновик в личный кабинет клиента?")) return;
    setPublishing(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/admin/client-projects/${projectId}/publish`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Не удалось опубликовать");
        return;
      }
      setHasUnpublishedDraft(false);
      const publicSite = data?.publicSite as { slug?: string; siteStatus?: string } | null | undefined;
      if (publicSite?.slug) {
        const section =
          publicSite.siteStatus === "UNDER_CONSTRUCTION"
            ? "«Строящиеся объекты» (/portfolio/under-construction)"
            : "«Реализованные объекты» (/portfolio)";
        setMsg(
          `Опубликовано в личный кабинет. Объект на сайте: ${section}, карта /portfolio/map. Карточка: /portfolio/${publicSite.slug}`
        );
      } else if (showOnPublicSite) {
        setMsg(
          "Опубликовано в личный кабинет. Галочка «Показывать на сайте» включена — объект должен появиться в разделе «Строящиеся объекты»."
        );
      } else {
        setMsg("Опубликовано в личный кабинет. Клиент видит актуальные данные и получает уведомления по изменениям.");
      }
      router.refresh();
    } catch {
      setErr("Сеть");
    } finally {
      setPublishing(false);
    }
  }

  const inp =
    "w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#0F3D2E]";

  return (
    <div className="space-y-8 max-w-5xl">
      <AdminClientProjectPublishBar
        publishing={publishing}
        hasUnpublishedDraft={hasUnpublishedDraft}
        onPublish={() => void publishToCabinet()}
      />
      <div className="flex items-center gap-3">
        <Link
          href="/admin/client-projects"
          className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70"
        >
          <ArrowLeft size={16} />
          Список
        </Link>
      </div>

      {hasUnpublishedDraft ? (
        <div className="adm-banner-warn">
          Есть неопубликованные изменения. Клиент видит только последнюю опубликованную версию; уведомления не отправляются, пока вы не нажмёте «Опубликовать».
          {initial.draftSavedAt ? (
            <span className="adm-banner-warn-meta">
              Черновик: {new Date(initial.draftSavedAt).toLocaleString("ru-RU")}
            </span>
          ) : null}
        </div>
      ) : null}

      {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}
      {err ? <p className="text-sm text-red-400">{err}</p> : null}

      <section className={sectionClass("main")}>
        <AdminSectionHeader title="Объект и доступ" actions={sectionSaveControl("main")} />
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase text-white/40 mb-1">Номер договора</label>
            <input className={inp} value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-white/40 mb-1">Новый пароль (оставьте пустым)</label>
            <input type="password" className={inp} value={plainPassword} onChange={(e) => setPlainPassword(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase text-white/40 mb-1">Название / адрес</label>
            <input className={inp} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-white/40 mb-1">Клиент</label>
            <input className={inp} value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-white/40 mb-1">Email</label>
            <input className={inp} value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-white/40 mb-1">Площадь, м²</label>
            <input className={inp} value={area} onChange={(e) => setArea(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-white/40 mb-1">Материал стен</label>
            <ClientWallMaterialSelect
              value={wallMaterial}
              onValueChange={setWallMaterial}
              triggerClassName={inp + " flex items-center justify-between"}
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-white/40 mb-1">Начало</label>
            <input type="date" className={inp} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-white/40 mb-1">План сдачи</label>
            <input type="date" className={inp} value={plannedEndDate} onChange={(e) => setPlannedEndDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-white/40 mb-1">Прогресс %</label>
            <div
              className={inp + " flex items-center justify-between tabular-nums"}
              title="Считается автоматически по этапам со статусом «Сдан клиенту»"
            >
              <span>{computedProgress}%</span>
              <span className="text-[10px] normal-case text-white/35">авто</span>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase text-white/40 mb-1">Текущий этап (авто)</label>
            <div
              className={inp + " min-h-[42px] flex flex-col justify-center gap-1 text-sm"}
              title="Подставляется в кабинет: этапы со статусом «В работе»"
            >
              {currentStageLabelPreview ? (
                currentStagesPreview.map((s) => <span key={s.id}>{s.title}</span>)
              ) : (
                <span className="text-white/35">Нет этапов «В работе»</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[11px] uppercase text-white/40 mb-1">Руководитель проекта</label>
            <input className={inp} value={foremanName} onChange={(e) => setForemanName(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <AdminMediaUpload
              label="Обложка"
              accept="image"
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              showHint={false}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase text-white/40 mb-1">URL онлайн-камеры (iframe)</label>
            <input className={inp} value={cameraStreamUrl} onChange={(e) => setCameraStreamUrl(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase text-white/40 mb-1">HouseProject id (каталог)</label>
            <input className={inp} value={houseProjectId} onChange={(e) => setHouseProjectId(e.target.value)} />
          </div>
          <div className="sm:col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnPublicSite}
                onChange={(e) => setShowOnPublicSite(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-white">Показывать на сайте</span>
                <span className="block text-xs text-white/45 mt-1">
                  После «Опубликовать» объект появится в разделе «Строящиеся объекты» и на карте. Статус «Сдан» выставится автоматически, когда все этапы сданы клиенту.
                </span>
              </span>
            </label>
            {showOnPublicSite ? (
              <>
                <div>
                  <label className="block text-[11px] uppercase text-white/40 mb-1">Адрес на сайте</label>
                  <input
                    className={inp}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={title || "Ленинградская область, д. …"}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase text-white/40 mb-1">Широта</label>
                    <input className={inp + " font-mono"} value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="59.93" />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase text-white/40 mb-1">Долгота</label>
                    <input className={inp + " font-mono"} value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="30.33" />
                  </div>
                </div>
                <BuiltObjectMapPicker
                  latitude={latitude}
                  longitude={longitude}
                  onCoordinatesChange={(lat, lon) => {
                    setLatitude(lat);
                    setLongitude(lon);
                  }}
                />
                {initial.builtObjectId ? (
                  <p className="text-xs text-emerald-300/80">
                    Связан с карточкой на сайте.{" "}
                    <Link href={`/admin/built-objects/${initial.builtObjectId}`} className="underline">
                      Открыть в портфолио
                    </Link>
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className={sectionClass("stages", "compact")}>
        <AdminSectionHeader
          title="Этапы"
          actions={
            <>
              {sectionSaveControl("stages")}
              <button
                type="button"
                onClick={() => {
                  const order = stages.filter((x) => !x.parentClientKey).length;
                  const template = standardTopLevelStageTemplate(order);
                  setStages((s) => [
                    ...s,
                    createAdminStageRow({
                      title: template?.title ?? "",
                      order,
                      iconKey: template?.iconKey,
                    }),
                  ]);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400"
              >
                <Plus size={14} /> Этап
              </button>
              <button
                type="button"
                onClick={() => {
                  if (
                    stages.length > 0 &&
                    !window.confirm(
                      "Заменить все этапы на типовые 8 этапов с подэтапами инженерии и благоустройства?"
                    )
                  ) {
                    return;
                  }
                  setStages(buildDefaultAdminStageRows());
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-white/55 hover:text-white/80"
              >
                Типовые 8 этапов
              </button>
            </>
          }
        />
        <AdminStagesEditor
          stages={stages}
          onChange={setStages}
          progressHint={`Прогресс: ${computedProgress}% — по верхнеуровневым этапам со статусом «Сдан клиенту».`}
        />
      </section>

      <AdminPaymentsEditorTable
        rows={payments}
        onChange={setPayments}
        headerActions={sectionSaveControl("payments")}
        surfaceClass={draftSectionSurfaceClass(getUiState("payments"))}
        onImportError={(msg) => {
          setErr(msg);
          setMsg("");
        }}
        onImported={() => {
          setErr("");
        }}
      />

      <AdminDocumentsEditor
        projectId={projectId}
        initialDocuments={initial.documents}
        defaultClientName={initial.clientName}
        onError={setErr}
        headerActions={sectionSaveControl("documents")}
        surfaceClass={draftSectionSurfaceClass(getUiState("documents"))}
        onSectionDirty={() => markMediaSectionDirty("documents")}
      />

      <AdminPhotoReportsEditor
        projectId={projectId}
        initialPhotos={initial.photoReports}
        onError={setErr}
        headerActions={sectionSaveControl("photos")}
        surfaceClass={draftSectionSurfaceClass(getUiState("photos"))}
        onSectionDirty={() => markMediaSectionDirty("photos")}
      />

      <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Обращения</h2>
            <p className="mt-1 text-sm text-white/45">
              Переписка ведётся в общем разделе «Чат с клиентами» — здесь только краткий список по этому проекту.
            </p>
          </div>
          <Link
            href="/admin/tickets"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-emerald-400/40 hover:text-white"
          >
            <MessageCircle size={14} aria-hidden />
            Чат с клиентами
          </Link>
        </div>
        {tickets.map((t) => {
          const last = t.messages[t.messages.length - 1];
          return (
            <div
              key={t.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/[0.06] p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{t.subject}</p>
                  <span className="rounded border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white/70">
                    {ticketStatusLabel(t.status)}
                  </span>
                </div>
                {last ? (
                  <p className="mt-2 line-clamp-2 text-sm text-white/65">{last.body}</p>
                ) : null}
                <p className="mt-1.5 text-xs text-white/40">
                  Обновлено {formatDateTimeRu(last?.createdAt ?? t.messages[0]?.createdAt ?? null)}
                </p>
              </div>
              <Link
                href={`/admin/tickets?ticket=${encodeURIComponent(t.id)}`}
                className="shrink-0 rounded-lg bg-[#0F3D2E] px-3 py-2 text-sm font-semibold transition hover:bg-[#145c45]"
              >
                Открыть чат
              </Link>
            </div>
          );
        })}
        {tickets.length === 0 ? (
          <p className="text-sm text-white/40">
            Клиент ещё не писал — обращения появятся здесь и в «Чате с клиентами» после отправки из личного кабинета.
          </p>
        ) : null}
      </section>

    </div>
  );
}
