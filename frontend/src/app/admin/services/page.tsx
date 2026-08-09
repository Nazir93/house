"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Briefcase, Eye, EyeOff, Trash2, GripVertical } from "lucide-react";

type ServiceItem = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  serviceType: string;
  icon: string;
  published: boolean;
  order: number;
};

import { SERVICE_TYPE_LABEL_BY_VALUE } from "@/lib/service-type-admin-options";

const TYPE_LABELS = SERVICE_TYPE_LABEL_BY_VALUE;

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchServices() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      if (!res.ok) throw new Error();
      setServices(await res.json());
    } catch {
      setError("Не удалось загрузить услуги");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  async function togglePublished(id: string, published: boolean) {
    await fetch(`/api/admin/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    fetchServices();
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить услугу?")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    fetchServices();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Услуги</h1>
          <p className="text-sm text-white/40 mt-1">
            Фундамент, коробка, кровля, инженерия, отделка: название и краткое описание — на вкладке{" "}
            <code className="text-white/50">/services</code>, блок «тексты страницы» — на{" "}
            <code className="text-white/50">/services/…</code>. Проектирование ведётся в коде сайта и здесь не
            показывается.
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] font-semibold text-sm transition-colors"
        >
          <Plus size={16} /> Добавить
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/30 text-sm">Загрузка...</div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase size={32} className="mx-auto text-white/15 mb-3" />
            <p className="text-white/30 text-sm mb-4">
              Список пуст. Проверьте подключение к базе и переменную DATABASE_URL на сервере.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {services.map((service) => (
              <div key={service.id} className="flex items-center gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors">
                <GripVertical size={14} className="text-white/15 flex-shrink-0 cursor-grab" />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/services/${service.id}`} className="text-white hover:text-emerald-300 font-medium text-sm transition-colors">
                    {service.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/30">{TYPE_LABELS[service.serviceType] || service.serviceType}</span>
                    <span className="text-xs text-white/20">/{service.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 ml-4">
                  <button
                    onClick={() => togglePublished(service.id, service.published)}
                    className={`p-2 rounded-lg transition-colors ${
                      service.published ? "text-green-400 hover:bg-green-500/10" : "text-white/20 hover:bg-white/5 hover:text-white/40"
                    }`}
                    title={service.published ? "Скрыть" : "Показать"}
                  >
                    {service.published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Удалить"
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
