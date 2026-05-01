"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Home, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { formatRub } from "@/lib/construction-shared";

interface AdminHouseProject {
  id: string;
  slug: string;
  title: string;
  floors: number;
  area: number;
  price: number;
  rooms: number;
  bathrooms: number;
  published: boolean;
  isNew: boolean;
  media: { id: string; type: string; url: string }[];
}

export default function AdminHouseProjectsPage() {
  const [projects, setProjects] = useState<AdminHouseProject[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    fetch(`/api/admin/house-projects${search ? `?search=${encodeURIComponent(search)}` : ""}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          setError(data?.error || "Не удалось загрузить проекты домов.");
          setProjects([]);
        } else {
          setProjects(data);
        }
      })
      .catch(() => setError("Сервер недоступен."))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  async function togglePublished(project: AdminHouseProject) {
    await fetch(`/api/admin/house-projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !project.published }),
    });
    setProjects((prev) => prev.map((item) => item.id === project.id ? { ...item, published: !item.published } : item));
  }

  async function remove(id: string) {
    if (!confirm("Удалить типовой проект дома?")) return;
    await fetch(`/api/admin/house-projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Типовые проекты домов</h1>
          <p className="text-sm text-white/40 mt-1">Каталог, фильтры, карточки проектов и сравнение.</p>
        </div>
        <Link href="/admin/house-projects/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#143f32] text-white text-sm font-semibold transition-colors">
          <Plus size={16} /> Добавить
        </Link>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]"
          placeholder="Поиск по названию..."
        />
      </div>

      {error ? (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-sm text-amber-200">
          <p className="font-semibold">Не удалось прочитать новые модели</p>
          <p className="mt-1 text-amber-100/70">{error}</p>
          <p className="mt-2 text-xs text-amber-100/50">После изменения Prisma-схемы выполните `prisma db push` или миграцию.</p>
        </div>
      ) : null}

      {loading ? (
        <div className="p-12 text-center text-white/30">Загрузка...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <Home size={44} className="mx-auto mb-3 text-white/15" />
          <p className="text-white/45 text-sm">Пока нет типовых проектов.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => {
            const cover = project.media.find((item) => item.type === "RENDER")?.url;
            return (
              <article key={project.id} className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08]">
                <div className="h-40 bg-white/[0.04] relative">
                  {cover ? <img src={cover} alt={project.title} className="h-full w-full object-cover" /> : null}
                  <div className="absolute left-3 top-3 flex gap-2">
                    {!project.published ? <span className="rounded-full bg-black/60 px-2 py-1 text-[11px] text-white/60">Черновик</span> : null}
                    {project.isNew ? <span className="rounded-full bg-[#6E2A1F] px-2 py-1 text-[11px] text-white">Новый</span> : null}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h2 className="font-semibold text-white">{project.title}</h2>
                    <p className="text-xs text-white/35 mt-1">/{project.slug}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-white/45">
                    <span>{project.floors} эт.</span>
                    <span>{project.area} м²</span>
                    <span>{project.rooms} комн.</span>
                    <span>{project.bathrooms} с/у</span>
                    <span className="col-span-2 text-[#D7D2CB]">{formatRub(project.price)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/house-projects/${project.id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-white/60 hover:text-white transition-colors">
                      <Pencil size={12} /> Изменить
                    </Link>
                    <button onClick={() => togglePublished(project)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-white/60 hover:text-white transition-colors">
                      {project.published ? <><EyeOff size={12} /> Скрыть</> : <><Eye size={12} /> Опубл.</>}
                    </button>
                    <button onClick={() => remove(project.id)} className="ml-auto p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
