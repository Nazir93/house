"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Eye, EyeOff, Trash2, X } from "lucide-react";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";

type PartnerItem = {
  id: string;
  name: string;
  logoUrl: string;
  website: string | null;
  visible: boolean;
  order: number;
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [website, setWebsite] = useState("");

  async function fetchPartners() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/partners");
      if (!res.ok) throw new Error();
      setPartners(await res.json());
    } catch {
      setError("Не удалось загрузить партнёров");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPartners();
  }, []);

  function resetForm() {
    setName("");
    setLogoUrl("");
    setWebsite("");
    setEditId(null);
    setShowForm(false);
  }

  function openEdit(p: PartnerItem) {
    setName(p.name);
    setLogoUrl(p.logoUrl);
    setWebsite(p.website || "");
    setEditId(p.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!logoUrl.trim()) {
      setError("Загрузите логотип файлом");
      return;
    }
    setSaving(true);

    try {
      if (editId) {
        await fetch(`/api/admin/partners/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, logoUrl, website: website || null }),
        });
      } else {
        await fetch("/api/admin/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, logoUrl, website: website || null }),
        });
      }
      resetForm();
      fetchPartners();
    } catch {
      setError("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisible(id: string, visible: boolean) {
    await fetch(`/api/admin/partners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !visible }),
    });
    fetchPartners();
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить партнёра?")) return;
    await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
    fetchPartners();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Партнёры</h1>
          <p className="text-sm text-white/40 mt-1">Логотипы клиентов в разделе &laquo;Нам доверяют&raquo;</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] font-semibold text-sm transition-colors"
        >
          <Plus size={16} /> Добавить
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">{editId ? "Редактировать" : "Добавить партнёра"}</h2>
            <button onClick={resetForm} className="p-1.5 text-white/30 hover:text-white/60"><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Название</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
                placeholder="Название компании" />
            </div>
            <AdminMediaUpload
              label="Логотип"
              accept="image"
              value={logoUrl}
              onChange={setLogoUrl}
            />
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Сайт (опционально)</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
                placeholder="https://example.com" />
            </div>
            <button type="submit" disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] font-semibold text-sm transition-colors disabled:opacity-50">
              {saving ? "Сохранение..." : editId ? "Сохранить" : "Добавить"}
            </button>
          </form>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Partners list */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/30 text-sm">Загрузка...</div>
        ) : partners.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="mx-auto text-white/15 mb-3" />
            <p className="text-white/30 text-sm">Партнёров пока нет</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {partners.map((partner) => (
              <div key={partner.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.03] transition-colors">
                <div className="w-12 h-8 flex items-center justify-center flex-shrink-0 bg-white/5 rounded-lg overflow-hidden">
                  <img src={partner.logoUrl} alt={partner.name} className="max-h-6 max-w-10 object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => openEdit(partner)}
                    className="text-white hover:text-emerald-300 font-medium text-sm transition-colors text-left"
                  >
                    {partner.name}
                  </button>
                  {partner.website && (
                    <p className="text-xs text-white/25 truncate">{partner.website}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleVisible(partner.id, partner.visible)}
                    className={`p-2 rounded-lg transition-colors ${
                      partner.visible ? "text-green-400 hover:bg-green-500/10" : "text-white/20 hover:bg-white/5"
                    }`}
                  >
                    {partner.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
