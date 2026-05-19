"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ClientDocumentSignatureMethod, ClientDocumentSignatureStatus } from "@prisma/client";
import { Check, FileText, GripVertical, Trash2, Upload } from "lucide-react";
import {
  documentSignatureBadgeClass,
  documentSignatureLabel,
} from "@/lib/client-document-signature";
import {
  defaultAdminSignedDateInput,
  formatAdminSignedDateInput,
  formatDocumentSignedAtRu,
} from "@/lib/client-document-signed-date";
import { moveItemInArray } from "@/lib/reorder-list";

export type AdminDocumentRow = {
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
};

function sortDocuments(items: AdminDocumentRow[]): AdminDocumentRow[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function parseSignatureStatus(value: unknown): ClientDocumentSignatureStatus {
  if (value === "AWAITING_SIGNATURE" || value === "SIGNED") return value;
  return "AWAITING_REVIEW";
}

function normalizeDocumentRows(rows: unknown[]): AdminDocumentRow[] {
  return sortDocuments(
    rows.map((row, i) => {
      const r = row as Record<string, unknown>;
      const signedAtRaw = r.signedAt;
      const method = r.signatureMethod;
      return {
        id: String(r.id),
        filename: String(r.filename),
        url: String(r.url),
        order: typeof r.order === "number" ? r.order : i,
        signatureStatus: parseSignatureStatus(r.signatureStatus),
        signatureMethod:
          method === "MANUAL" || method === "ES" ? method : null,
        signedByName: r.signedByName != null ? String(r.signedByName) : null,
        signatureSmsPhone:
          r.signatureSmsPhone != null ? String(r.signatureSmsPhone) : null,
        signedResultUrl: r.signedResultUrl != null ? String(r.signedResultUrl) : null,
        signedAt:
          typeof signedAtRaw === "string"
            ? signedAtRaw
            : signedAtRaw instanceof Date
              ? signedAtRaw.toISOString()
              : null,
      };
    })
  );
}

function displaySmsPhone(phone: string | null): string {
  return phone?.trim() ? phone : "—";
}

/** Документы в админке: загрузка, статус, кто/когда подписал (п. 7–8 ТЗ). */
export function AdminDocumentsEditor({
  projectId,
  initialDocuments,
  defaultClientName,
  onError,
  headerActions,
  surfaceClass = "",
  onSectionDirty,
}: {
  projectId: string;
  initialDocuments: AdminDocumentRow[];
  defaultClientName: string | null;
  onError: (message: string) => void;
  headerActions?: ReactNode;
  surfaceClass?: string;
  onSectionDirty?: () => void;
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState(() => sortDocuments(initialDocuments));
  const [savedDocId, setSavedDocId] = useState<string | null>(null);
  const [signDates, setSignDates] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const d of initialDocuments) {
      map[d.id] = d.signedAt
        ? formatAdminSignedDateInput(d.signedAt)
        : defaultAdminSignedDateInput();
    }
    return map;
  });
  const [signedByNames, setSignedByNames] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const d of initialDocuments) {
      map[d.id] = d.signedByName ?? defaultClientName ?? "";
    }
    return map;
  });
  const [uploading, setUploading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingSignatureId, setSavingSignatureId] = useState<string | null>(null);
  const [docFilename, setDocFilename] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const dragIndex = useRef<number | null>(null);
  const orderDirtyRef = useRef(false);
  const orderIdsRef = useRef<string[]>(documents.map((d) => d.id));

  useEffect(() => {
    const sorted = sortDocuments(initialDocuments);
    orderIdsRef.current = sorted.map((d) => d.id);
    setDocuments(sorted);
    setSignDates((prev) => {
      const next = { ...prev };
      for (const d of sorted) {
        next[d.id] = d.signedAt
          ? formatAdminSignedDateInput(d.signedAt)
          : prev[d.id] ?? defaultAdminSignedDateInput();
      }
      return next;
    });
    setSignedByNames((prev) => {
      const next = { ...prev };
      for (const d of sorted) {
        next[d.id] = d.signedByName ?? defaultClientName ?? prev[d.id] ?? "";
      }
      return next;
    });
  }, [initialDocuments, defaultClientName]);

  useEffect(() => {
    if (!savedDocId) return;
    const t = window.setTimeout(() => setSavedDocId(null), 2200);
    return () => window.clearTimeout(t);
  }, [savedDocId]);

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        onError(data?.error || "Ошибка загрузки");
        return null;
      }
      return data.url as string;
    },
    [onError]
  );

  const persistOrder = useCallback(
    async (ids: string[]) => {
      setSavingOrder(true);
      try {
        const res = await fetch(`/api/admin/client-projects/${projectId}/documents`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds: ids }),
        });
        const rows = await res.json().catch(() => null);
        if (!res.ok) {
          onError(rows?.error || "Не удалось сохранить порядок документов");
          return;
        }
        if (Array.isArray(rows)) {
          setDocuments(normalizeDocumentRows(rows));
        }
      } finally {
        setSavingOrder(false);
      }
    },
    [projectId, onError]
  );

  const addDocuments = useCallback(
    async (items: { filename: string; url: string }[]) => {
      if (items.length === 0) return;
      const res = await fetch(`/api/admin/client-projects/${projectId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        onError(data?.error || "Не удалось добавить документы");
        return;
      }
      const created = Array.isArray(data) ? data : [data];
      const normalized = normalizeDocumentRows(created);
      setDocuments((prev) => sortDocuments([...prev, ...normalized]));
      setSignDates((prev) => {
        const next = { ...prev };
        for (const row of normalized) {
          next[row.id] = defaultAdminSignedDateInput();
        }
        return next;
      });
      setSignedByNames((prev) => {
        const next = { ...prev };
        for (const row of normalized) {
          next[row.id] = defaultClientName ?? "";
        }
        return next;
      });
      onError("");
      onSectionDirty?.();
    },
    [projectId, onError, defaultClientName, onSectionDirty]
  );

  async function onDocFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    onError("");
    const items: { filename: string; url: string }[] = [];
    for (const file of files) {
      const url = await uploadFile(file);
      if (!url) continue;
      const base = file.name.replace(/\.[^.]+$/, "") || file.name;
      items.push({ filename: base, url });
    }
    setUploading(false);
    await addDocuments(items);
  }

  async function addDocumentManual() {
    if (!docFilename.trim() || !docUrl.trim()) {
      onError("Имя файла и URL документа");
      return;
    }
    await addDocuments([{ filename: docFilename.trim(), url: docUrl.trim() }]);
    setDocFilename("");
    setDocUrl("");
  }

  function applyRowFromApi(id: string, data: Record<string, unknown>) {
    setDocuments((prev) =>
      sortDocuments(
        prev.map((d) =>
          d.id === id
            ? normalizeDocumentRows([data])[0] ?? d
            : d
        )
      )
    );
    if (data.signedAt) {
      setSignDates((prev) => ({
        ...prev,
        [id]: formatAdminSignedDateInput(
          typeof data.signedAt === "string" ? data.signedAt : String(data.signedAt)
        ),
      }));
    }
    if (data.signedByName != null) {
      setSignedByNames((prev) => ({ ...prev, [id]: String(data.signedByName) }));
    }
  }

  async function saveSignedDate(id: string, markAsSigned: boolean) {
    const signedAt = signDates[id]?.trim();
    if (!signedAt) {
      onError("Укажите дату подписания");
      return;
    }
    const signedByName = signedByNames[id]?.trim();
    if (markAsSigned && !signedByName) {
      onError("Укажите, кто подписал документ");
      return;
    }
    setSavingSignatureId(id);
    onError("");
    try {
      const res = await fetch(`/api/admin/client-projects/${projectId}/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          markAsSigned
            ? { signatureStatus: "SIGNED", signedAt, signedByName }
            : { signedAt, signedByName }
        ),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        onError(data?.error || "Не удалось обновить документ");
        return;
      }
      applyRowFromApi(id, data as Record<string, unknown>);
      setSavedDocId(id);
      onSectionDirty?.();
      router.refresh();
    } finally {
      setSavingSignatureId(null);
    }
  }

  async function delDocument(id: string) {
    if (!confirm("Удалить документ из кабинета?")) return;
    const res = await fetch(`/api/admin/client-projects/${projectId}/documents/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      onError("Не удалось удалить документ");
      return;
    }
    const next = documents.filter((d) => d.id !== id);
    setDocuments(next);
    onSectionDirty?.();
    onError("");
    if (next.length > 0) {
      await persistOrder(next.map((d) => d.id));
    }
  }

  function handleDragStart(index: number) {
    dragIndex.current = index;
    orderDirtyRef.current = false;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === index) return;
    setDocuments((prev) => {
      const reordered = moveItemInArray(prev, from, index).map((d, i) => ({ ...d, order: i }));
      dragIndex.current = index;
      orderIdsRef.current = reordered.map((d) => d.id);
      return reordered;
    });
    if (!orderDirtyRef.current) {
      orderDirtyRef.current = true;
      onSectionDirty?.();
    }
  }

  async function handleDragEnd() {
    dragIndex.current = null;
    if (!orderDirtyRef.current) return;
    orderDirtyRef.current = false;
    await persistOrder(orderIdsRef.current);
  }

  return (
    <section
      className={`space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-shadow ${surfaceClass}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Документы</h2>
        <div className="flex items-center gap-2">
          {headerActions}
          {(uploading || savingOrder || savingSignatureId) && (
            <span className="text-xs text-white/45">
              {uploading
                ? "Загрузка…"
                : savingOrder
                  ? "Сохранение порядка…"
                  : "Сохранение…"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <label className="inline-flex items-center gap-2 text-xs text-white/50 cursor-pointer">
          <Upload size={14} />
          {uploading ? "Загрузка…" : "Загрузить файлы"}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xlsx,.xls,.txt"
            multiple
            disabled={uploading}
            onChange={onDocFiles}
          />
        </label>
        <span className="text-[10px] text-white/35">можно выбрать несколько</span>
        <input
          className="flex-1 min-w-[140px] rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-sm text-white"
          value={docFilename}
          onChange={(e) => setDocFilename(e.target.value)}
          placeholder="Имя файла"
          disabled={uploading}
        />
        <input
          className="flex-1 min-w-[160px] rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-sm text-white"
          value={docUrl}
          onChange={(e) => setDocUrl(e.target.value)}
          placeholder="/uploads/..."
          disabled={uploading}
        />
        <button
          type="button"
          onClick={addDocumentManual}
          disabled={uploading}
          className="px-3 py-2 rounded-lg bg-[#0F3D2E] text-sm font-semibold disabled:opacity-50"
        >
          Добавить
        </button>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-white/40 py-2">Документов пока нет.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[52rem]">
            <thead>
              <tr className="text-left text-white/45 border-b border-white/10">
                <th className="py-2 pr-2 w-6" aria-hidden />
                <th className="py-2 pr-2 font-semibold">Документ</th>
                <th className="py-2 pr-2 font-semibold whitespace-nowrap">Статус</th>
                <th className="py-2 pr-2 font-semibold whitespace-nowrap">Кто подписал</th>
                <th className="py-2 pr-2 font-semibold whitespace-nowrap">Дата подписания</th>
                <th className="py-2 pr-2 font-semibold whitespace-nowrap">Телефон SMS</th>
                <th className="py-2 pr-2 font-semibold">Файл</th>
                <th className="py-2 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d, index) => (
                <tr
                  key={d.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="border-b border-white/[0.06] align-top cursor-grab active:cursor-grabbing"
                >
                  <td className="py-2 pr-1">
                    <GripVertical size={14} className="text-white/35" aria-hidden />
                  </td>
                  <td className="py-2 pr-2 max-w-[12rem]">
                    <div className="flex items-start gap-1.5">
                      <FileText size={14} className="shrink-0 text-white/50 mt-0.5" aria-hidden />
                      <span className="break-words leading-snug">{d.filename}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-2 min-w-[9.5rem]">
                    <div className="flex flex-col gap-1">
                      <span className={documentSignatureBadgeClass(d.signatureStatus)}>
                        {documentSignatureLabel(d.signatureStatus)}
                      </span>
                      {d.signatureStatus === "SIGNED" && d.signedAt ? (
                        <span className="text-[10px] text-white/40 tabular-nums">
                          {formatDocumentSignedAtRu(d.signedAt)}
                        </span>
                      ) : null}
                      {savedDocId === d.id ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400">
                          <Check size={12} aria-hidden />
                          Сохранено
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={signedByNames[d.id] ?? ""}
                      disabled={savingSignatureId === d.id || d.signatureMethod === "ES"}
                      onChange={(e) =>
                        setSignedByNames((prev) => ({ ...prev, [d.id]: e.target.value }))
                      }
                      placeholder={defaultClientName ?? "Клиент"}
                      className="w-full min-w-[7rem] rounded border border-white/10 bg-white/5 px-1.5 py-1 text-[11px] text-white"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="date"
                      value={signDates[d.id] ?? ""}
                      disabled={savingSignatureId === d.id || d.signatureMethod === "ES"}
                      onChange={(e) =>
                        setSignDates((prev) => ({ ...prev, [d.id]: e.target.value }))
                      }
                      className="rounded border border-white/10 bg-white/5 px-1.5 py-1 text-[11px] text-white"
                    />
                  </td>
                  <td className="py-2 pr-2 whitespace-nowrap text-white/50 tabular-nums">
                    {displaySmsPhone(d.signatureSmsPhone)}
                  </td>
                  <td className="py-2 pr-2">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline"
                    >
                      Открыть
                    </a>
                    {d.signedResultUrl ? (
                      <a
                        href={d.signedResultUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-emerald-400/80 hover:underline mt-0.5"
                      >
                        Результат ЭП
                      </a>
                    ) : null}
                  </td>
                  <td className="py-2 whitespace-nowrap">
                    {d.signatureStatus === "SIGNED" ? (
                      <button
                        type="button"
                        disabled={savingSignatureId === d.id}
                        onClick={() => void saveSignedDate(d.id, false)}
                        className="text-[11px] px-2 py-1 rounded border border-white/20 text-white/70 disabled:opacity-50"
                      >
                        Сохранить
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={savingSignatureId === d.id}
                        onClick={() => void saveSignedDate(d.id, true)}
                        className="text-[11px] px-2 py-1 rounded border border-emerald-500/40 text-emerald-400 disabled:opacity-50"
                      >
                        Подписан
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-[11px] text-red-400 ml-2"
                      onClick={() => delDocument(d.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
