"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Eye, EyeOff, Save, X, Briefcase, ChevronDown, ChevronRight } from "lucide-react";

interface VacancyItem {
  id: string;
  title: string;
  location: string | null;
  schedule: string | null;
  salaryLabel: string | null;
  description: string;
  requirements: string | null;
  visible: boolean;
  order: number;
}

const emptyForm = {
  title: "",
  location: "",
  schedule: "",
  salaryLabel: "",
  description: "",
  requirements: "",
  visible: true,
  order: 0,
};

const inp =
  "w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors";

export default function AdminVacanciesPage() {
  const [vacancies, setVacancies] = useState<VacancyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/vacancies")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setVacancies(d);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function set(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(v: VacancyItem) {
    setEditId(v.id);
    setForm({
      title: v.title,
      location: v.location || "",
      schedule: v.schedule || "",
      salaryLabel: v.salaryLabel || "",
      description: v.description,
      requirements: v.requirements || "",
      visible: v.visible,
      order: v.order,
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
    setError("");
    setSaving(true);
    try {
      const url = editId ? `/api/admin/vacancies/${editId}` : "/api/admin/vacancies";
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
    await fetch(`/api/admin/vacancies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !visible }),
    });
    setVacancies((prev) => prev.map((v) => (v.id === id ? { ...v, visible: !visible } : v)));
  }

  async function remove(id: string) {
    if (!confirm("Удалить вакансию?")) return;
    await fetch(`/api/admin/vacancies/${id}`, { method: "DELETE" });
    setVacancies((prev) => prev.filter((v) => v.id !== id));
  }

  if (loading) return <div className="p-12 text-center text-white/30">Загрузка...</div>;

  const visibleCount = vacancies.filter((v) => v.visible).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Вакансии</h1>
          <p className="text-sm text-white/40 mt-1">
            {vacancies.length} в базе · {visibleCount} на сайте ·{" "}
            <a href="/partners/vacancies" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/70">
              /partners/vacancies
            </a>
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Добавить
        </button>
      </div>

      {showForm ? (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60">{editId ? "Редактировать" : "Новая вакансия"}</h2>
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

          <div>
            <label className="block text-xs text-white/40 mb-1">Должность *</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inp} placeholder="Прораб на объекте" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs text-white/40 mb-1">Локация</label>
              <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} className={inp} placeholder="СПб / объект" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">График</label>
              <input type="text" value={form.schedule} onChange={(e) => set("schedule", e.target.value)} className={inp} placeholder="Полный день" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Зарплата</label>
              <input type="text" value={form.salaryLabel} onChange={(e) => set("salaryLabel", e.target.value)} className={inp} placeholder="от 80 000 ₽" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1">Описание *</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={5}
              className={`${inp} resize-y min-h-[120px]`}
              placeholder="Обязанности, условия, что предлагаем..."
            />
          </div>

          <div>
            <label className="block text-xs text-white/40 mb-1">Требования</label>
            <textarea
              value={form.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              rows={4}
              className={`${inp} resize-y`}
              placeholder="Опыт, навыки, документы..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs">
            <div>
              <label className="block text-xs text-white/40 mb-1">Порядок</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => set("order", parseInt(e.target.value, 10) || 0)}
                className={inp}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm text-white/60">
              <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} className="rounded" />
              Показывать на сайте
            </label>
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

      {vacancies.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <Briefcase size={48} className="mx-auto mb-3 text-white/10" />
          <p className="text-white/30 text-sm">Нет вакансий</p>
        </div>
      ) : (
        <div className="space-y-1">
          {vacancies.map((v) => (
            <div
              key={v.id}
              className={`rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden ${!v.visible ? "opacity-50" : ""}`}
            >
              <div className="flex items-center px-4 py-3 gap-2">
                <button type="button" onClick={() => setExpanded(expanded === v.id ? null : v.id)} className="text-white/30 shrink-0">
                  {expanded === v.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white font-medium truncate block">{v.title}</span>
                  <span className="text-[10px] text-white/35 truncate block">
                    {[v.location, v.schedule, v.salaryLabel].filter(Boolean).join(" · ") || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => startEdit(v)} className="px-2 py-1 rounded-lg text-xs text-white/40 hover:text-white transition-colors">
                    Изм.
                  </button>
                  <button type="button" onClick={() => void toggleVisible(v.id, v.visible)} className="p-1 rounded-lg text-white/30 hover:text-white transition-colors">
                    {v.visible ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button type="button" onClick={() => void remove(v.id)} className="p-1 rounded-lg text-red-400/40 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {expanded === v.id ? (
                <div className="px-4 pb-3 pt-0 border-t border-white/[0.04] text-sm text-white/50 whitespace-pre-wrap space-y-2">
                  <p className="pt-2">{v.description}</p>
                  {v.requirements ? <p className="text-white/40">Требования: {v.requirements}</p> : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
