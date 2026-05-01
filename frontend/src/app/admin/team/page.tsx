"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  UserCircle,
} from "lucide-react";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";

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

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setMembers(d); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function set(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(m: TeamItem) {
    setEditId(m.id);
    setForm({ name: m.name, position: m.position, photoUrl: m.photoUrl || "", description: m.description || "", visible: m.visible, order: m.order });
    setShowForm(true);
  }

  function startNew() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.position.trim()) return;
    setSaving(true);
    try {
      const url = editId ? `/api/admin/team/${editId}` : "/api/admin/team";
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
    await fetch(`/api/admin/team/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !visible }),
    });
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, visible: !visible } : m));
  }

  async function remove(id: string) {
    if (!confirm("Удалить сотрудника?")) return;
    await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) return <div className="p-12 text-center text-white/30">Загрузка...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Команда</h1>
          <p className="text-sm text-white/40 mt-1">{members.length} сотрудников</p>
        </div>
        <button onClick={startNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-sm font-semibold transition-colors">
          <Plus size={16} /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60">{editId ? "Редактировать" : "Новый сотрудник"}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-white/30 hover:text-white"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Имя</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
                placeholder="Иван Петров" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Должность</label>
              <input type="text" value={form.position} onChange={(e) => set("position", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
                placeholder="Главный инженер" />
            </div>
          </div>
          <AdminMediaUpload
            label="Фото"
            accept="image"
            value={form.photoUrl}
            onChange={(url) => set("photoUrl", url)}
          />
          <div>
            <label className="block text-xs text-white/40 mb-1">Описание</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white resize-none focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="Опыт, квалификация..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Порядок</label>
              <input type="number" value={form.order} onChange={(e) => set("order", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} className="rounded" />
                Видимый
              </label>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-xs font-semibold transition-colors disabled:opacity-50">
              <Save size={14} /> {saving ? "..." : editId ? "Обновить" : "Создать"}
            </button>
          </div>
        </div>
      )}

      {members.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <UserCircle size={48} className="mx-auto mb-3 text-white/10" />
          <p className="text-white/30 text-sm">Нет сотрудников</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((m) => (
            <div key={m.id} className={`rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 flex gap-4 ${!m.visible ? "opacity-50" : ""}`}>
              <div className="w-14 h-14 rounded-full bg-white/[0.06] flex-shrink-0 overflow-hidden">
                {m.photoUrl ? (
                  <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={56} className="text-white/10" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-white">{m.name}</h3>
                <p className="text-xs text-white/40">{m.position}</p>
                {m.description && <p className="text-xs text-white/30 mt-1 line-clamp-2">{m.description}</p>}
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => startEdit(m)} className="px-2 py-1 rounded-lg bg-white/[0.06] text-[11px] text-white/40 hover:text-white transition-colors">Изм.</button>
                <button onClick={() => toggleVisible(m.id, m.visible)} className="p-1 rounded-lg text-white/30 hover:text-white transition-colors">
                  {m.visible ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button onClick={() => remove(m.id)} className="p-1 rounded-lg text-red-400/40 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
