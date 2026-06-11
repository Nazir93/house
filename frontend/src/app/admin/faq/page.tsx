"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  HelpCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
  order: number;
}

const emptyForm = { question: "", answer: "", visible: true, order: 0 };

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    fetch("/api/admin/faq")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setFaqs(d);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function set(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(f: FaqItem) {
    setEditId(f.id);
    setForm({ question: f.question, answer: f.answer, visible: f.visible, order: f.order });
    setShowForm(true);
  }

  function startNew() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      const url = editId ? `/api/admin/faq/${editId}` : "/api/admin/faq";
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
    } catch {
      /* */
    }
    setSaving(false);
  }

  async function toggleVisible(id: string, visible: boolean) {
    await fetch(`/api/admin/faq/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !visible }),
    });
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, visible: !visible } : f)));
  }

  async function remove(id: string) {
    if (!confirm("Удалить вопрос?")) return;
    await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  }

  if (loading) return <div className="p-12 text-center text-white/30">Загрузка...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FAQ</h1>
          <p className="text-sm text-white/40 mt-1">
            {faqs.length} вопросов · главная и карточки портфолио
          </p>
          <p className="text-xs text-white/25 mt-1">
            FAQ на страницах услуг — в разделе «Услуги» → лендинг услуги.
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Добавить
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/60">{editId ? "Редактировать" : "Новый вопрос"}</h2>
            <button
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
            <label className="block text-xs text-white/40 mb-1">Вопрос</label>
            <input
              type="text"
              value={form.question}
              onChange={(e) => set("question", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="Как заказать проект дома?"
            />
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1">Ответ</label>
            <textarea
              value={form.answer}
              onChange={(e) => set("answer", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white resize-none focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="Подробный ответ..."
            />
          </div>
          <div className="max-w-xs">
            <label className="block text-xs text-white/40 mb-1">Порядок</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => set("order", parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-sm text-white/60">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => set("visible", e.target.checked)}
                className="rounded"
              />
              Видимый
            </label>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "..." : editId ? "Обновить" : "Создать"}
            </button>
          </div>
        </div>
      )}

      {faqs.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <HelpCircle size={48} className="mx-auto mb-3 text-white/10" />
          <p className="text-white/30 text-sm">Нет вопросов</p>
        </div>
      ) : (
        <div className="space-y-1">
          {faqs.map((f) => (
            <div
              key={f.id}
              className={`rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden ${!f.visible ? "opacity-50" : ""}`}
            >
              <div className="flex items-center px-4 py-3">
                <button
                  onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                  className="mr-2 text-white/30"
                >
                  {expanded === f.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white font-medium truncate block">{f.question}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => startEdit(f)}
                    className="px-2 py-1 rounded-lg text-xs text-white/40 hover:text-white transition-colors"
                  >
                    Изм.
                  </button>
                  <button
                    onClick={() => toggleVisible(f.id, f.visible)}
                    className="p-1 rounded-lg text-white/30 hover:text-white transition-colors"
                  >
                    {f.visible ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    onClick={() => remove(f.id)}
                    className="p-1 rounded-lg text-red-400/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {expanded === f.id && (
                <div className="px-4 pb-3 pt-0 border-t border-white/[0.04]">
                  <p className="text-sm text-white/50 whitespace-pre-wrap pt-2">{f.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
