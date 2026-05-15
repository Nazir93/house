"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import { CmsImage } from "@/components/ui/cms-image";
import { AdminSelect } from "@/components/admin/admin-select";

const STAGE_STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Не начат" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE", label: "Завершён" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "NOT_ISSUED", label: "Не выставлен" },
  { value: "EXPECTED", label: "Ожидается" },
  { value: "PAID", label: "Оплачен" },
];

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

type StageRow = { order: number; title: string; iconKey: string; status: string };
type PaymentRow = {
  order: number;
  label: string;
  amountRubles: number;
  dueDate: string;
  status: string;
  paidAt: string;
};

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
  stages: { order: number; title: string; iconKey: string; status: string }[];
  payments: {
    label: string;
    amountKopeks: number;
    dueDate: string | null;
    status: string;
    paidAt: string | null;
    order: number;
  }[];
  documents: { id: string; filename: string; url: string }[];
  photoReports: { id: string; url: string; caption: string | null }[];
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
  const [overallProgress, setOverallProgress] = useState(initial.overallProgress.toString());
  const [currentStageLabel, setCurrentStageLabel] = useState(initial.currentStageLabel ?? "");
  const [foremanName, setForemanName] = useState(initial.foremanName ?? "");
  const [cameraStreamUrl, setCameraStreamUrl] = useState(initial.cameraStreamUrl ?? "");
  const [houseProjectId, setHouseProjectId] = useState(initial.houseProjectId ?? "");

  const [stages, setStages] = useState<StageRow[]>(
    initial.stages.length > 0
      ? initial.stages.map((s) => ({
          order: s.order,
          title: s.title,
          iconKey: s.iconKey,
          status: s.status,
        }))
      : [{ order: 0, title: "Этап", iconKey: "circle", status: "NOT_STARTED" }]
  );

  const [payments, setPayments] = useState<PaymentRow[]>(
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

  const [documents, setDocuments] = useState(initial.documents);
  const [photos, setPhotos] = useState(initial.photoReports);
  const [tickets, setTickets] = useState(initial.tickets);

  const [docFilename, setDocFilename] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});
  const [ticketStatus, setTicketStatus] = useState<Record<string, string>>({});

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
          overallProgress: parseInt(overallProgress, 10) || 0,
          currentStageLabel: currentStageLabel.trim() || null,
          foremanName: foremanName.trim() || null,
          cameraStreamUrl: cameraStreamUrl.trim() || null,
          houseProjectId: houseProjectId.trim() || null,
          stages,
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
      setMsg("Сохранено");
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
    overallProgress,
    currentStageLabel,
    foremanName,
    cameraStreamUrl,
    houseProjectId,
    stages,
    payments,
    router,
  ]);

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      setErr(data?.error || "Ошибка загрузки");
      return null;
    }
    return data.url as string;
  }

  async function addDocument() {
    if (!docFilename.trim() || !docUrl.trim()) {
      setErr("Имя файла и URL документа");
      return;
    }
    const res = await fetch(`/api/admin/client-projects/${projectId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: docFilename.trim(), url: docUrl.trim() }),
    });
    const row = await res.json().catch(() => null);
    if (!res.ok) {
      setErr(row?.error || "Не удалось добавить документ");
      return;
    }
    setDocuments((prev) => [{ id: row.id, filename: row.filename, url: row.url }, ...prev]);
    setDocFilename("");
    setDocUrl("");
    setErr("");
  }

  async function delDocument(id: string) {
    if (!confirm("Удалить документ из кабинета?")) return;
    await fetch(`/api/admin/client-projects/${projectId}/documents/${id}`, { method: "DELETE" });
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  async function onDocFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr("");
    const url = await uploadFile(file);
    if (!url) return;
    setDocUrl(url);
    if (!docFilename.trim()) setDocFilename(file.name.replace(/\.[^.]+$/, "") || file.name);
  }

  async function addPhoto() {
    const url = photoUrlInput.trim();
    if (!url) return;
    const res = await fetch(`/api/admin/client-projects/${projectId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const row = await res.json().catch(() => null);
    if (!res.ok) {
      setErr(row?.error || "Не удалось добавить фото");
      return;
    }
    setPhotos((prev) => [{ id: row.id, url: row.url, caption: row.caption }, ...prev]);
    setPhotoUrlInput("");
  }

  async function onPhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr("");
    const url = await uploadFile(file);
    if (!url) return;
    const res = await fetch(`/api/admin/client-projects/${projectId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const row = await res.json().catch(() => null);
    if (res.ok && row?.id) {
      setPhotos((prev) => [{ id: row.id, url: row.url, caption: row.caption }, ...prev]);
    }
  }

  async function delPhoto(id: string) {
    if (!confirm("Удалить фото?")) return;
    await fetch(`/api/admin/client-projects/${projectId}/photos/${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
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
            <input className={inp} value={wallMaterial} onChange={(e) => setWallMaterial(e.target.value)} />
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
            <input className={inp} value={overallProgress} onChange={(e) => setOverallProgress(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] uppercase text-white/40 mb-1">Текущий этап (подпись)</label>
            <input className={inp} value={currentStageLabel} onChange={(e) => setCurrentStageLabel(e.target.value)} />
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
              setStages((s) => [...s, { order: s.length, title: "", iconKey: "circle", status: "NOT_STARTED" }])
            }
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400"
          >
            <Plus size={14} /> Добавить
          </button>
        </div>
        <div className="space-y-2">
          {stages.map((row, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-end border border-white/[0.06] rounded-lg p-2">
              <input className={`${inp} w-12`} type="number" value={row.order} onChange={(e) => {
                const next = [...stages];
                next[i] = { ...row, order: parseInt(e.target.value, 10) || 0 };
                setStages(next);
              }} />
              <input className={`${inp} flex-1 min-w-[120px]`} value={row.title} onChange={(e) => {
                const next = [...stages];
                next[i] = { ...row, title: e.target.value };
                setStages(next);
              }} placeholder="Название" />
              <input className={`${inp} w-28`} value={row.iconKey} onChange={(e) => {
                const next = [...stages];
                next[i] = { ...row, iconKey: e.target.value };
                setStages(next);
              }} placeholder="iconKey" />
              <AdminSelect
                className="w-36 shrink-0"
                triggerClassName={ADMIN_COMPACT_SELECT_TRIGGER}
                value={row.status}
                onValueChange={(v) => {
                  const next = [...stages];
                  next[i] = { ...row, status: v };
                  setStages(next);
                }}
                options={STAGE_STATUS_OPTIONS}
              />
              <button type="button" className="p-2 text-red-400/80" onClick={() => setStages((s) => s.filter((_, j) => j !== i))}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Платежи (тыс. ₽ в поле — целые рубли)</h2>
          <button
            type="button"
            onClick={() =>
              setPayments((p) => [...p, { order: p.length, label: "", amountRubles: 0, dueDate: "", status: "EXPECTED", paidAt: "" }])
            }
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400"
          >
            <Plus size={14} /> Добавить
          </button>
        </div>
        {payments.map((row, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-end border border-white/[0.06] rounded-lg p-2">
            <input className={`${inp} flex-1 min-w-[100px]`} value={row.label} onChange={(e) => {
              const next = [...payments];
              next[i] = { ...row, label: e.target.value };
              setPayments(next);
            }} placeholder="Основание" />
            <input
              className={`${inp} w-28`}
              type="number"
              value={row.amountRubles}
              onChange={(e) => {
                const next = [...payments];
                next[i] = { ...row, amountRubles: parseFloat(e.target.value) || 0 };
                setPayments(next);
              }}
            />
            <input type="date" className={`${inp} w-40`} value={row.dueDate} onChange={(e) => {
              const next = [...payments];
              next[i] = { ...row, dueDate: e.target.value };
              setPayments(next);
            }} />
            <AdminSelect
              className="w-36 shrink-0"
              triggerClassName={ADMIN_COMPACT_SELECT_TRIGGER}
              value={row.status}
              onValueChange={(v) => {
                const next = [...payments];
                next[i] = { ...row, status: v };
                setPayments(next);
              }}
              options={PAYMENT_STATUS_OPTIONS}
            />
            <button type="button" className="p-2 text-red-400/80" onClick={() => setPayments((p) => p.filter((_, j) => j !== i))}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <h2 className="text-lg font-bold">Документы</h2>
        <div className="flex flex-wrap gap-2 items-end">
          <label className="inline-flex items-center gap-2 text-xs text-white/50 cursor-pointer">
            <Upload size={14} />
            Загрузить файл
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xlsx,.xls,.txt" onChange={onDocFile} />
          </label>
          <input className={inp + " flex-1 min-w-[140px]"} value={docFilename} onChange={(e) => setDocFilename(e.target.value)} placeholder="Имя файла" />
          <input className={inp + " flex-1 min-w-[160px]"} value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="/uploads/..." />
          <button type="button" onClick={addDocument} className="px-3 py-2 rounded-lg bg-[#0F3D2E] text-sm font-semibold">
            Добавить
          </button>
        </div>
        <ul className="text-sm space-y-1">
          {documents.map((d) => (
            <li key={d.id} className="flex justify-between gap-2 border-b border-white/[0.06] py-2">
              <span className="truncate">{d.filename}</span>
              <div className="flex gap-2 shrink-0">
                <a href={d.url} target="_blank" rel="noreferrer" className="text-emerald-400 text-xs">
                  Открыть
                </a>
                <button type="button" className="text-red-400 text-xs" onClick={() => delDocument(d.id)}>
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
        <h2 className="text-lg font-bold">Фотоотчёты</h2>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-white/50 cursor-pointer">
            <Upload size={14} />
            Загрузить фото
            <input type="file" className="hidden" accept="image/*" onChange={onPhotoFile} />
          </label>
          <input className={inp + " flex-1 min-w-[200px]"} value={photoUrlInput} onChange={(e) => setPhotoUrlInput(e.target.value)} placeholder="или URL" />
          <button type="button" onClick={addPhoto} className="px-3 py-2 rounded-lg bg-white/[0.08] text-sm">
            Добавить URL
          </button>
        </div>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {photos.map((p) => (
            <li key={p.id} className="relative group rounded-lg overflow-hidden border border-white/[0.08] aspect-square">
              <CmsImage src={p.url} alt="" fill className="object-cover" sizes="160px" />
              <button
                type="button"
                className="absolute top-1 right-1 p-1 bg-black/60 rounded text-xs text-red-300 opacity-0 group-hover:opacity-100"
                onClick={() => delPhoto(p.id)}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      </section>

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

      <button
        type="button"
        onClick={saveMain}
        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0F3D2E] font-bold text-sm"
      >
        Сохранить объект, этапы и платежи
      </button>
    </div>
  );
}
