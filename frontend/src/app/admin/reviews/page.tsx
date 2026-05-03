"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Save,
  X,
  MessageSquare,
} from "lucide-react";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";
import { ADMIN_PROJECT_SERVICE_OPTIONS } from "@/lib/admin-service-options";

interface ReviewItem {
  id: string;
  authorName: string;
  authorPhoto: string | null;
  objectName: string | null;
  service: string | null;
  rating: number;
  text: string;
  videoUrl: string | null;
  visible: boolean;
  order: number;
}

const SERVICE_OPTIONS = [
  { value: "", label: "Все / без привязки" },
  ...ADMIN_PROJECT_SERVICE_OPTIONS,
];

const emptyForm = {
  authorName: "",
  authorPhoto: "",
  objectName: "",
  service: "",
  rating: 5,
  text: "",
  videoUrl: "",
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
          <p className="text-sm text-white/40 mt-1">{reviews.length} отзывов</p>
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
              <select value={form.service} onChange={(e) => set("service", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors">
                {SERVICE_OPTIONS.map((s) => <option key={s.value} value={s.value} className="bg-[#111111]">{s.label}</option>)}
              </select>
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
            />
            <AdminMediaUpload
              label="Видео к отзыву"
              accept="video"
              value={form.videoUrl}
              onChange={(url) => set("videoUrl", url)}
            />
          </div>
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
        <div className="space-y-2">
          {reviews.map((r) => (
            <div key={r.id} className={`rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 ${!r.visible ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-white">{r.authorName}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={12} className={n <= r.rating ? "text-emerald-300" : "text-white/10"} fill={n <= r.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    {r.objectName && <span className="text-xs text-white/30">· {r.objectName}</span>}
                  </div>
                  <p className="text-sm text-white/60 line-clamp-2">{r.text}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(r)} className="px-2 py-1.5 rounded-lg bg-white/[0.06] text-xs text-white/60 hover:text-white transition-colors">Изм.</button>
                  <button onClick={() => toggleVisible(r.id, r.visible)} className="p-1.5 rounded-lg text-white/30 hover:text-white transition-colors">
                    {r.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg text-red-400/40 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
