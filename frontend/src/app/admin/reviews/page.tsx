"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  EyeOff,
  Star,
  Save,
  X,
  MessageSquare,
  Check,
  Clock,
} from "lucide-react";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";
import { AdminSelect } from "@/components/admin/admin-select";
import { CmsImage } from "@/components/ui/cms-image";
import { FULL_SERVICE_TYPE_DROPDOWN_OPTIONS } from "@/lib/service-type-admin-options";

interface ReviewItem {
  id: string;
  authorName: string;
  authorPhoto: string | null;
  objectName: string | null;
  service: string | null;
  rating: number;
  text: string;
  videoUrl: string | null;
  photoUrls?: string[];
  visible: boolean;
  order: number;
}

const SERVICE_OPTIONS = [
  { value: "", label: "Все / без привязки" },
  ...FULL_SERVICE_TYPE_DROPDOWN_OPTIONS,
];

const emptyForm = {
  authorName: "",
  authorPhoto: "",
  objectName: "",
  service: "",
  rating: 5,
  text: "",
  videoUrl: "",
  photoUrls: [] as string[],
  visible: true,
  order: 0,
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setReviews(d); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function set(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(r: ReviewItem) {
    setEditId(r.id);
    setForm({
      authorName: r.authorName,
      authorPhoto: r.authorPhoto || "",
      objectName: r.objectName || "",
      service: r.service || "",
      rating: r.rating,
      text: r.text,
      videoUrl: r.videoUrl || "",
      photoUrls: Array.isArray(r.photoUrls) ? r.photoUrls : [],
      visible: r.visible,
      order: r.order,
    });
    setShowForm(true);
  }

  function startNew() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.authorName.trim() || !form.text.trim()) return;
    setSaving(true);
    try {
      const url = editId ? `/api/admin/reviews/${editId}` : "/api/admin/reviews";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        load();
        setShowForm(false);
        setEditId(null);
      }
    } catch { /* */ }
    setSaving(false);
  }

  async function toggleVisible(id: string, visible: boolean) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !visible }),
    });
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, visible: !visible } : r));
  }

  async function approve(id: string) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: true }),
    });
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, visible: true } : r)));
    }
  }

  async function reject(id: string) {
    if (!confirm("Отклонить и удалить отзыв?")) return;
    await remove(id);
  }

  const pending = reviews.filter((r) => !r.visible);
  const published = reviews.filter((r) => r.visible);

  function ReviewRow({
    r,
    pending: isPending,
  }: {
    r: ReviewItem;
    pending?: boolean;
  }) {
    return (
      <div
        key={r.id}
        className={`rounded-xl bg-white/[0.03] border p-4 ${
          isPending ? "border-amber-500/30 bg-amber-500/[0.04]" : "border-white/[0.08]"
        } ${!r.visible && !isPending ? "opacity-50" : ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-white">{r.authorName}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={12}
                    className={n <= r.rating ? "text-emerald-300" : "text-white/10"}
                    fill={n <= r.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              {r.objectName ? <span className="text-xs text-white/30">· {r.objectName}</span> : null}
              {isPending ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
                  <Clock size={10} /> На модерации
                </span>
              ) : null}
            </div>
            <p className="text-sm text-white/60 whitespace-pre-line">{isPending ? r.text : `${r.text.slice(0, 200)}${r.text.length > 200 ? "…" : ""}`}</p>
            {r.photoUrls && r.photoUrls.length > 0 ? (
              <p className="mt-2 text-[11px] text-white/35">{r.photoUrls.length} фото к отзыву</p>
            ) : null}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 flex-shrink-0">
            {isPending ? (
              <>
                <button
                  onClick={() => approve(r.id)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-xs font-semibold text-white transition-colors"
                >
                  <Check size={14} /> Принять
                </button>
                <button
                  onClick={() => reject(r.id)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-red-300/80 hover:text-red-300 transition-colors"
                >
                  <X size={14} /> Отклонить
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => startEdit(r)}
                  className="px-2 py-1.5 rounded-lg bg-white/[0.06] text-xs text-white/60 hover:text-white transition-colors"
                >
                  Изм.
                </button>
                <button
                  onClick={() => toggleVisible(r.id, r.visible)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white transition-colors"
                  title="Скрыть с сайта"
                >
                  <EyeOff size={14} />
                </button>
              </>
            )}
            <button
              onClick={() => remove(r.id)}
              className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 transition-colors"
              title="Удалить"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function remove(id: string) {
    if (!confirm("Удалить отзыв?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <div className="p-12 text-center text-white/30">Загрузка...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Отзывы</h1>
          <p className="text-sm text-white/40 mt-1">
            {published.length} на сайте
            {pending.length > 0 ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-200">
                {pending.length} на модерации
              </span>
            ) : null}
          </p>
        </div>
        <button onClick={startNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-sm font-semibold transition-colors">
          <Plus size={16} /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60">{editId ? "Редактировать" : "Новый отзыв"}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-white/30 hover:text-white"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Автор</label>
              <input type="text" value={form.authorName} onChange={(e) => set("authorName", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" placeholder="Иван Петров" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Объект</label>
              <input type="text" value={form.objectName} onChange={(e) => set("objectName", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" placeholder="Объект или заказчик …" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Услуга</label>
              <AdminSelect value={form.service} onValueChange={(v) => set("service", v)} options={SERVICE_OPTIONS} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Рейтинг</label>
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => set("rating", n)}
                    className={`${n <= form.rating ? "text-emerald-300" : "text-white/10"} transition-colors`}>
                    <Star size={20} fill={n <= form.rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Порядок</label>
              <input type="number" value={form.order} onChange={(e) => set("order", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Текст отзыва</label>
            <textarea value={form.text} onChange={(e) => set("text", e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white resize-none focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="Отзыв клиента..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminMediaUpload
              label="Фото автора"
              accept="image"
              value={form.authorPhoto}
              onChange={(url) => set("authorPhoto", url)}
              nameHint={form.authorName || form.objectName || "review"}
              role="author"
            />
            <AdminMediaUpload
              label="Видео к отзыву"
              accept="video"
              value={form.videoUrl}
              onChange={(url) => set("videoUrl", url)}
              nameHint={form.objectName || form.authorName || "review"}
              role="video"
            />
          </div>
          {form.photoUrls.length > 0 ? (
            <div>
              <p className="mb-2 text-xs text-white/40">Фото объекта ({form.photoUrls.length})</p>
              <ul className="flex flex-wrap gap-2">
                {form.photoUrls.map((url) => (
                  <li key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10">
                    <CmsImage src={url} alt="" fill className="object-cover" sizes="64px" />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          photoUrls: prev.photoUrls.filter((item) => item !== url),
                        }))
                      }
                      className="absolute right-0.5 top-0.5 rounded bg-black/70 p-0.5 text-white/80"
                      aria-label="Удалить фото"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-sm text-white/60">
              <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} className="rounded" />
              Видимый
            </label>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-xs font-semibold transition-colors disabled:opacity-50">
              <Save size={14} /> {saving ? "..." : editId ? "Обновить" : "Создать"}
            </button>
          </div>
        </div>
      )}

      {reviews.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <MessageSquare size={48} className="mx-auto mb-3 text-white/10" />
          <p className="text-white/30 text-sm">Нет отзывов</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-amber-200/90 flex items-center gap-2">
                <Clock size={16} /> На модерации ({pending.length})
              </h2>
              <div className="space-y-2">
                {pending.map((r) => (
                  <ReviewRow key={r.id} r={r} pending />
                ))}
              </div>
            </div>
          ) : null}

          {published.length > 0 ? (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-white/50">Опубликованные ({published.length})</h2>
              <div className="space-y-2">
                {published.map((r) => (
                  <ReviewRow key={r.id} r={r} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
