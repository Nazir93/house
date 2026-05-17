"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ClientDocumentSignatureMethod,
  ClientDocumentSignatureStatus,
  ClientStageStatus,
} from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { AdminSelect } from "@/components/admin/admin-select";
import { AdminDocumentsEditor } from "@/components/admin/admin-documents-editor";
import {
  AdminPaymentsEditorTable,
  type AdminPaymentRow,
} from "@/components/admin/admin-payments-editor-table";
import { AdminPhotoReportsEditor } from "@/components/admin/admin-photo-reports-editor";
import { ClientWallMaterialSelect } from "@/components/admin/client-wall-material-select";
import {
  createAdminStageRow,
  orderedAdminStageIndices,
  removeAdminStageWithChildren,
  type AdminStageRow,
} from "@/lib/admin-client-stage-rows";
import { computeOverallProgressFromStages } from "@/lib/client-project-progress";
import {
  formatCurrentStageLabel,
  getCurrentStagesInProgress,
} from "@/lib/client-project-stage-status";
import { CLIENT_STAGE_STATUS_OPTIONS } from "@/lib/client-stage-status";

const TICKET_STATUS_OPTIONS = [
  { value: "OPEN", label: "Открыт" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "CLOSED", label: "Закрыт" },
];

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

  const stageDisplayOrder = useMemo(() => orderedAdminStageIndices(stages), [stages]);

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

  const [tickets, setTickets] = useState(initial.tickets);

  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});
  const [ticketStatus, setTicketStatus] = useState<Record<string, string>>({});
  const [hasUnpublishedDraft, setHasUnpublishedDraft] = useState(initial.hasUnpublishedDraft ?? false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setHasUnpublishedDraft(initial.hasUnpublishedDraft ?? false);
  }, [initial.hasUnpublishedDraft]);

  const saveMain = useCallback(async () => {
    setErr("");
    setMsg("");
    try {
      const res = await fetch(`/api/admin/client-projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          stages: stages.map((s) => ({
            clientKey: s.clientKey,
            parentClientKey: s.parentClientKey,
            order: s.order,
            title: s.title,
            iconKey: s.iconKey,
            status: s.status,
          })),
          payments: payments.map((p, i) => ({
            order: p.order ?? i,
            label: p.label,
            amountRubles: p.amountRubles,
            dueDate: p.dueDate || null,
            status: p.status,
            paidAt: p.paidAt || null,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Ошибка сохранения");
        return;
      }
      setMsg("Черновик сохранён. Уведомления клиенту не отправляются — только после публикации в личный кабинет.");
      setHasUnpublishedDraft(Boolean(data.hasUnpublishedDraft));
      setPlainPassword("");
      router.refresh();
    } catch {
      setErr("Сеть");
    }
  }, [
    projectId,
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
    stages,
    payments,
    router,
  ]);

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
      setMsg("Опубликовано в личный кабинет. Клиент видит актуальные данные и получает уведомления по изменениям.");
      router.refresh();
    } catch {
      setErr("Сеть");
    } finally {
      setPublishing(false);
    }
  }

  async function sendReply(ticketId: string) {
    const body = ticketReplies[ticketId]?.trim();
    if (!body) return;
    const status = ticketStatus[ticketId];
    const res = await fetch(`/api/admin/client-projects/${projectId}/tickets/${ticketId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, ...(status ? { status } : {}) }),
    });
    const updated = await res.json().catch(() => null);
    if (!res.ok) {
      setErr(updated?.error || "Ответ не отправлен");
      return;
    }
    setTicketReplies((r) => ({ ...r, [ticketId]: "" }));
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: updated.status,
              messages: updated.messages.map((m: { authorType: string; body: string; createdAt: string }) => ({
                authorType: m.authorType,
                body: m.body,
                createdAt: m.createdAt,
              })),
            }
          : t
      )
    );
  }

  const inp =
    "w-full rounded-lg bg-white/[0.05] border border-white/[0.1] px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#0F3D2E]";

  return (
    <div className="space-y-8 max-w-5xl">
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
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          Есть неопубликованные изменения. Клиент видит только последнюю опубликованную версию; уведомления не отправляются, пока вы не нажмёте «Опубликовать».
          {initial.draftSavedAt ? (
            <span className="block mt-1 text-xs text-amber-100/60">
              Черновик: {new Date(initial.draftSavedAt).toLocaleString("ru-RU")}
            </span>
          ) : null}
        </div>
      ) : null}

      {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}
      {err ? <p className="text-sm text-red-400">{err}</p> : null}

      <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <h2 className="text-lg font-bold">Объект и доступ</h2>
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
            <label className="block text-[11px] uppercase text-white/40 mb-1">Бригадир</label>
            <input className={inp} value={foremanName} onChange={(e) => setForemanName(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase text-white/40 mb-1">URL обложки</label>
            <input className={inp} value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase text-white/40 mb-1">URL онлайн-камеры (iframe)</label>
            <input className={inp} value={cameraStreamUrl} onChange={(e) => setCameraStreamUrl(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase text-white/40 mb-1">HouseProject id (каталог)</label>
            <input className={inp} value={houseProjectId} onChange={(e) => setHouseProjectId(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Этапы</h2>
          <button
            type="button"
            onClick={() =>
              setStages((s) => [
                ...s,
                createAdminStageRow({
                  title: "",
                  order: s.filter((x) => !x.parentClientKey).length,
                }),
              ])
            }
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400"
          >
            <Plus size={14} /> Этап
          </button>
        </div>
        <p className="text-xs text-white/40">
          Прогресс: {computedProgress}% — по верхнеуровневым этапам со статусом «Сдан клиенту».
        </p>
        <div className="space-y-2">
          {stageDisplayOrder.map(({ index: i, depth }) => {
            const row = stages[i]!;
            const isSub = depth > 0;
            return (
              <div
                key={row.clientKey}
                className="flex flex-wrap gap-2 items-end border border-white/[0.06] rounded-lg p-2"
                style={{ marginLeft: depth * 16 }}
              >
              <input className={`${inp} w-12`} type="number" value={row.order} onChange={(e) => {
                const next = [...stages];
                next[i] = { ...row, order: parseInt(e.target.value, 10) || 0 };
                setStages(next);
              }} />
              <input className={`${inp} flex-1 min-w-[120px]`} value={row.title} onChange={(e) => {
                const next = [...stages];
                next[i] = { ...row, title: e.target.value };
                setStages(next);
              }} placeholder={isSub ? "Подэтап" : "Название этапа"} />
              <input className={`${inp} w-28`} value={row.iconKey} onChange={(e) => {
                const next = [...stages];
                next[i] = { ...row, iconKey: e.target.value };
                setStages(next);
              }} placeholder="iconKey" />
              <AdminSelect
                className="w-40 shrink-0"
                triggerClassName={ADMIN_COMPACT_SELECT_TRIGGER}
                value={row.status}
                onValueChange={(v) => {
                  const next = [...stages];
                  next[i] = { ...row, status: v };
                  setStages(next);
                }}
                options={CLIENT_STAGE_STATUS_OPTIONS}
              />
                {!isSub ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2 py-2 text-xs text-emerald-400/90 shrink-0"
                    onClick={() => {
                      const parentKey = row.clientKey;
                      const subCount = stages.filter((s) => s.parentClientKey === parentKey).length;
                      setStages((s) => [
                        ...s,
                        createAdminStageRow({
                          title: "",
                          parentClientKey: parentKey,
                          order: subCount,
                        }),
                      ]);
                    }}
                  >
                    <Plus size={14} /> Подэтап
                  </button>
                ) : null}
              <button
                type="button"
                className="p-2 text-red-400/80"
                onClick={() => setStages((s) => removeAdminStageWithChildren(s, i))}
              >
                <Trash2 size={16} />
              </button>
            </div>
            );
          })}
        </div>
      </section>

      <AdminPaymentsEditorTable rows={payments} onChange={setPayments} />

      <AdminDocumentsEditor
        projectId={projectId}
        initialDocuments={initial.documents}
        defaultClientName={initial.clientName}
        onError={setErr}
      />

      <AdminPhotoReportsEditor
        projectId={projectId}
        initialPhotos={initial.photoReports}
        onError={setErr}
      />

      <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <h2 className="text-lg font-bold">Обращения</h2>
        {tickets.map((t) => (
          <div key={t.id} className="border border-white/[0.06] rounded-xl p-3 space-y-2">
            <div className="flex justify-between gap-2">
              <span className="font-medium">{t.subject}</span>
              <span className="text-xs text-white/40">{t.status}</span>
            </div>
            <ul className="text-sm space-y-1 text-white/70">
              {t.messages.map((m, i) => (
                <li key={i}>
                  <span className="text-white/40">{m.authorType}:</span> {m.body}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 items-end">
              <AdminSelect
                className="w-40 shrink-0"
                triggerClassName={ADMIN_COMPACT_SELECT_TRIGGER}
                value={ticketStatus[t.id] ?? t.status}
                onValueChange={(v) => setTicketStatus((s) => ({ ...s, [t.id]: v }))}
                options={TICKET_STATUS_OPTIONS}
              />
              <input
                className={inp + " flex-1 min-w-[200px]"}
                value={ticketReplies[t.id] ?? ""}
                onChange={(e) => setTicketReplies((s) => ({ ...s, [t.id]: e.target.value }))}
                placeholder="Ответ клиенту"
              />
              <button
                type="button"
                onClick={() => sendReply(t.id)}
                className="px-3 py-2 rounded-lg bg-[#0F3D2E] text-sm font-semibold"
              >
                Отправить
              </button>
            </div>
          </div>
        ))}
        {tickets.length === 0 ? <p className="text-white/40 text-sm">Нет обращений</p> : null}
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={saveMain}
          className="px-6 py-3 rounded-xl bg-white/[0.08] border border-white/[0.12] font-bold text-sm hover:bg-white/[0.12]"
        >
          Сохранить черновик
        </button>
        <button
          type="button"
          onClick={publishToCabinet}
          disabled={publishing}
          className="px-6 py-3 rounded-xl bg-[#0F3D2E] font-bold text-sm disabled:opacity-50"
        >
          {publishing ? "Публикация…" : "Опубликовать в личном кабинете"}
        </button>
      </div>
      <p className="text-xs text-white/40 max-w-xl">
        «Сохранить черновик» — правки только в админке, без уведомлений клиенту. Фото и документы тоже остаются черновиком.
        «Опубликовать в личном кабинете» — клиент увидит данные; уведомления уйдут только при смене статусов (платёж «Ожидает оплаты», этап «В работе» / «Сдан клиенту»).
      </p>
    </div>
  );
}
