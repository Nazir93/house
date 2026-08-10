"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { GripVertical, Trash2, Upload } from "lucide-react";
import { CmsImage } from "@/components/ui/cms-image";
import { moveItemInArray } from "@/lib/reorder-list";

export type AdminPhotoRow = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
};

function sortPhotos(items: AdminPhotoRow[]): AdminPhotoRow[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function normalizePhotoRows(rows: unknown[]): AdminPhotoRow[] {
  return sortPhotos(
    rows.map((row, i) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.id),
        url: String(r.url),
        caption: r.caption != null ? String(r.caption) : null,
        order: typeof r.order === "number" ? r.order : i,
      };
    })
  );
}

/** Фотоотчёт: массовая загрузка и сортировка drag-and-drop (п. 9 ТЗ). */
export function AdminPhotoReportsEditor({
  projectId,
  initialPhotos,
  onError,
  headerActions,
  surfaceClass = "",
  onSectionDirty,
  nameHint,
}: {
  projectId: string;
  initialPhotos: AdminPhotoRow[];
  onError: (message: string) => void;
  headerActions?: ReactNode;
  surfaceClass?: string;
  onSectionDirty?: () => void;
  /** Название объекта — для SEO-имени файла */
  nameHint?: string;
}) {
  const [photos, setPhotos] = useState(() => sortPhotos(initialPhotos));
  const [uploading, setUploading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const dragIndex = useRef<number | null>(null);
  const orderDirtyRef = useRef(false);
  const orderIdsRef = useRef<string[]>(initialPhotos.map((p) => p.id));

  useEffect(() => {
    const sorted = sortPhotos(initialPhotos);
    setPhotos(sorted);
    orderIdsRef.current = sorted.map((p) => p.id);
  }, [initialPhotos]);

  const markDirty = useCallback(() => {
    onSectionDirty?.();
  }, [onSectionDirty]);

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      const fd = new FormData();
      fd.set("file", file);
      if (nameHint?.trim()) fd.set("nameHint", nameHint.trim());
      fd.set("role", "fotootchet");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        onError(data?.error || "Ошибка загрузки");
        return null;
      }
      return data.url as string;
    },
    [onError, nameHint]
  );

  const persistOrder = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return;
      setSavingOrder(true);
      try {
        const res = await fetch(`/api/admin/client-projects/${projectId}/photos`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds: ids }),
        });
        const rows = await res.json().catch(() => null);
        if (!res.ok) {
          onError(rows?.error || "Не удалось сохранить порядок фото");
          return false;
        }
        if (Array.isArray(rows)) {
          setPhotos(normalizePhotoRows(rows));
        }
        return true;
      } finally {
        setSavingOrder(false);
      }
    },
    [projectId, onError]
  );

  const addPhotosByUrls = useCallback(
    async (urls: string[]) => {
      if (urls.length === 0) return;
      const res = await fetch(`/api/admin/client-projects/${projectId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        onError(data?.error || "Не удалось добавить фото");
        return;
      }
      const created = Array.isArray(data) ? data : [data];
      setPhotos((prev) =>
        sortPhotos([
          ...prev,
          ...created.map((row: Record<string, unknown>, i: number) => ({
            id: String(row.id),
            url: String(row.url),
            caption: row.caption != null ? String(row.caption) : null,
            order: typeof row.order === "number" ? row.order : prev.length + i,
          })),
        ])
      );
      onError("");
      markDirty();
    },
    [projectId, onError, markDirty]
  );

  async function onPhotoFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    onError("");
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadFile(files[i]!);
      if (url) urls.push(url);
    }
    setUploading(false);

    if (urls.length > 0) {
      await addPhotosByUrls(urls);
    }
  }

  async function addPhotoUrl() {
    const url = photoUrlInput.trim();
    if (!url) return;
    await addPhotosByUrls([url]);
    setPhotoUrlInput("");
  }

  async function delPhoto(id: string) {
    if (!confirm("Удалить фото?")) return;
    const res = await fetch(`/api/admin/client-projects/${projectId}/photos/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      onError("Не удалось удалить фото");
      return;
    }
    const next = photos.filter((p) => p.id !== id);
    orderIdsRef.current = next.map((p) => p.id);
    setPhotos(next);
    markDirty();
    onError("");
    if (next.length > 0) {
      await persistOrder(orderIdsRef.current);
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
    setPhotos((prev) => {
      const reordered = moveItemInArray(prev, from, index).map((p, i) => ({ ...p, order: i }));
      dragIndex.current = index;
      orderIdsRef.current = reordered.map((p) => p.id);
      return reordered;
    });
    if (!orderDirtyRef.current) {
      orderDirtyRef.current = true;
      markDirty();
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
        <h2 className="text-lg font-bold">Фотоотчёты</h2>
        <div className="flex items-center gap-2">
          {headerActions}
          {(uploading || savingOrder) && (
            <span className="text-xs text-white/45">
              {uploading ? "Загрузка…" : "Сохранение порядка…"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <label className="inline-flex items-center gap-2 text-xs text-white/50 cursor-pointer">
          <Upload size={14} />
          {uploading ? "Загрузка…" : "Загрузить фото"}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={onPhotoFiles}
          />
        </label>
        <span className="text-[10px] text-white/35">можно выбрать несколько</span>
        <input
          className="flex-1 min-w-[200px] rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-sm text-white"
          value={photoUrlInput}
          onChange={(e) => setPhotoUrlInput(e.target.value)}
          placeholder="или URL одного фото"
          disabled={uploading}
        />
        <button
          type="button"
          onClick={addPhotoUrl}
          disabled={uploading}
          className="px-3 py-2 rounded-lg bg-white/[0.08] text-sm disabled:opacity-50"
        >
          Добавить URL
        </button>
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-white/40 py-4">Фото пока нет. Загрузите несколько файлов за раз.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 list-none p-0 m-0">
          {photos.map((p, index) => (
            <li
              key={p.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={() => void handleDragEnd()}
              className="relative group rounded-lg overflow-hidden border border-white/[0.08] aspect-square cursor-grab active:cursor-grabbing"
            >
              <CmsImage src={p.url} alt="" fill className="object-cover pointer-events-none" sizes="160px" />
              <span className="absolute top-1 left-1 flex items-center gap-0.5 rounded bg-black/55 px-1 py-0.5 text-[10px] text-white/80">
                <GripVertical size={12} aria-hidden />
                {index + 1}
              </span>
              <button
                type="button"
                className="absolute top-1 right-1 p-1 bg-black/60 rounded text-red-300 opacity-0 group-hover:opacity-100 transition"
                onClick={() => void delPhoto(p.id)}
                aria-label="Удалить фото"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
