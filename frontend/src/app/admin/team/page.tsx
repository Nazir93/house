"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Eye, EyeOff, Save, X, UserCircle } from "lucide-react";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";
import { CmsImage } from "@/components/ui/cms-image";

interface TeamItem {
  id: string;
  name: string;
  position: string;
  photoUrl: string | null;
  description: string | null;
  visible: boolean;
  order: number;
}

const emptyForm = { name: "", position: "", photoUrl: "", description: "", visible: true, order: 0 };

const inp =
  "w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors";

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setMembers(d);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function set(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(m: TeamItem) {
    setEditId(m.id);
    setForm({
      name: m.name,
      position: m.position,
      photoUrl: m.photoUrl || "",
      description: m.description || "",
      visible: m.visible,
      order: m.order,
    });
    setShowForm(true);
    setError("");
  }

  function startNew() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim() || !form.position.trim()) {
      setError("Укажите имя и должность");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const url = editId ? `/api/admin/team/${editId}` : "/api/admin/team";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "Не удалось сохранить");
        setSaving(false);
        return;
      }
      load();
      setShowForm(false);
      setEditId(null);
    } catch {
      setError("Ошибка сети");
    }
    setSaving(false);
  }

  async function toggleVisible(id: string, visible: boolean) {
    const res = await fetch(`/api/admin/team/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !visible }),
    });
    if (res.ok) {
      setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, visible: !visible } : m)));
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить сотрудника?")) return;
    await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) return <div className="p-12 text-center text-white/30">Загрузка...</div>;

  const visibleCount = members.filter((m) => m.visible).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Команда</h1>
          <p className="text-sm text-white/40 mt-1">
            {members.length} в базе · {visibleCount} на сайте ·{" "}
            <a href="/team" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70">
              /team
            </a>
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Добавить сотрудника
        </button>
      </div>

      {showForm ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60">{editId ? "Редактировать" : "Новый сотрудник"}</h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="text-white/30 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Имя *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inp}
                placeholder="Иван Петров"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Должность *</label>
              <input
                type="text"
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
                className={inp}
                placeholder="Главный инженер"
              />
            </div>
          </div>

          <AdminMediaUpload label="Фото" accept="image" value={form.photoUrl} onChange={(url) => set("photoUrl", url)} />

          <div>
            <label className="block text-xs text-white/40 mb-1">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className={`${inp} resize-y min-h-[96px]`}
              placeholder="Опыт, зона ответственности, квалификация..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            <div>
              <label className="block text-xs text-white/40 mb-1">Порядок на сайте</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => set("order", parseInt(e.target.value, 10) || 0)}
                className={inp}
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => set("visible", e.target.checked)}
                  className="rounded"
                />
                Показывать на сайте
              </label>
            </div>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "..." : editId ? "Обновить" : "Создать"}
            </button>
          </div>
        </div>
      ) : null}

      {members.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <UserCircle size={48} className="mx-auto mb-3 text-white/10" />
          <p className="text-white/30 text-sm">Нет сотрудников — нажмите «Добавить сотрудника»</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {members.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 ${!m.visible ? "opacity-50" : ""}`}
            >
              <div className="flex gap-3 sm:gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white/[0.06] sm:h-16 sm:w-16">
                  {m.photoUrl ? (
                    <CmsImage src={m.photoUrl} alt={m.name} fill className="object-cover" sizes="64px" />
                  ) : (
                    <UserCircle size={56} className="h-full w-full text-white/10" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-white truncate">{m.name}</h3>
                  <p className="text-xs text-white/40 truncate">{m.position}</p>
                  {m.description ? (
                    <p className="text-xs text-white/30 mt-1 line-clamp-2 whitespace-pre-line">{m.description}</p>
                  ) : null}
                  <p className="text-[10px] text-white/25 mt-1 tabular-nums">Порядок: {m.order}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-white/[0.06] pt-3">
                <button
                  type="button"
                  onClick={() => startEdit(m)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] text-[11px] text-white/50 hover:text-white transition-colors"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => void toggleVisible(m.id, m.visible)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-white/40 hover:text-white transition-colors"
                >
                  {m.visible ? <EyeOff size={13} /> : <Eye size={13} />}
                  {m.visible ? "Скрыть" : "Показать"}
                </button>
                <button
                  type="button"
                  onClick={() => void remove(m.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-red-400/50 hover:text-red-400 transition-colors ml-auto"
                >
                  <Trash2 size={13} />
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
