"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Pencil,
  Image as ImageIcon,
} from "lucide-react";
import { CmsImage } from "@/components/ui/cms-image";
import { serviceTypeLabelsWithCms, type CmsServiceForProjectSelect } from "@/lib/admin-service-options";

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  service: string;
  coverImage: string;
  published: boolean;
  order: number;
  featuredOnHome?: boolean;
  images: { id: string }[];
  _count: { hotspots: number };
}

const CATEGORY_LABELS: Record<string, string> = {
  RESTAURANT: "Коттедж",
  OFFICE: "Таунхаус / дуплекс",
  APARTMENT: "Дача / компактный дом",
  SHOP: "Баня / гостевой дом",
  OTHER: "Другое",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");
  const [serviceLabels, setServiceLabels] = useState<Record<string, string>>(() =>
    serviceTypeLabelsWithCms(undefined)
  );

  const load = useCallback(() => {
    setLoadError("");
    fetch("/api/admin/projects")
      .then(async (r) => {
        const d = await r.json();
        if (Array.isArray(d)) {
          setProjects(d);
        } else {
          setLoadError(d?.error || "Сервер вернул неожиданный ответ. Возможно, нужно выполнить prisma db push.");
        }
      })
      .catch(() => setLoadError("Не удалось загрузить проекты (сеть или сервер недоступен)."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          setServiceLabels(serviceTypeLabelsWithCms(data as CmsServiceForProjectSelect[]));
        }
      })
      .catch(() => {});
  }, []);

  async function togglePublish(id: string, published: boolean) {
    await fetch(`/api/admin/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, published: !published } : p))
    );
  }

  async function remove(id: string) {
    if (!confirm("Удалить проект?")) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-12 text-center text-white/30">Загрузка...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      {loadError ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-300">
          <p className="font-semibold mb-1">Ошибка загрузки проектов</p>
          <p className="text-red-400/80">{loadError}</p>
          <button onClick={load} className="mt-2 text-xs underline text-red-300 hover:text-white">Повторить</button>
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Портфолио / Кейсы</h1>
          <p className="text-sm text-white/40 mt-1">{projects.length} проектов</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Добавить
        </Link>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
          placeholder="Поиск по названию..."
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon size={48} className="mx-auto mb-3 text-white/10" />
          <p className="text-white/30 text-sm">Нет проектов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden group"
            >
              {p.coverImage && (
                <div className="h-40 bg-white/[0.03] relative overflow-hidden">
                  <CmsImage
                    src={p.coverImage}
                    alt={p.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                  {!p.published && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-xs text-white/50">
                      Черновик
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-sm text-white truncate">{p.title}</h3>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {p.featuredOnHome && (
                    <span className="px-2 py-0.5 rounded-md bg-[#0F3D2E]/25 text-[11px] text-emerald-300">
                      На главной
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[11px] text-white/40">
                    {CATEGORY_LABELS[p.category] || p.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[11px] text-white/40">
                    {serviceLabels[p.service] || p.service}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[11px] text-white/40">
                    {p.images.length} фото
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-white/60 hover:text-white transition-colors"
                  >
                    <Pencil size={12} /> Изменить
                  </Link>
                  <button
                    onClick={() => togglePublish(p.id, p.published)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-white/60 hover:text-white transition-colors"
                  >
                    {p.published ? <><EyeOff size={12} /> Скрыть</> : <><Eye size={12} /> Опубл.</>}
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="ml-auto p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
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
