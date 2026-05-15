"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, MapPinned, Pencil, Plus, Trash2 } from "lucide-react";
import { builtObjectMaterialLabel } from "@/lib/construction-shared";
import { CmsImage } from "@/components/ui/cms-image";

interface BuiltObjectAdminItem {
  id: string;
  title: string;
  slug: string;
  material: string;
  location?: string | null;
  published: boolean;
  media: { type: string; url: string }[];
}

export default function AdminBuiltObjectsPage() {
  const [objects, setObjects] = useState<BuiltObjectAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetch("/api/admin/built-objects")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) setError(data?.error || "Не удалось загрузить построенные объекты.");
        else setObjects(data);
      })
      .catch(() => setError("Сервер недоступен."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle(object: BuiltObjectAdminItem) {
    await fetch(`/api/admin/built-objects/${object.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !object.published }),
    });
    setObjects((prev) => prev.map((item) => item.id === object.id ? { ...item, published: !item.published } : item));
  }

  async function remove(id: string) {
    if (!confirm("Удалить построенный объект?")) return;
    await fetch(`/api/admin/built-objects/${id}`, { method: "DELETE" });
    setObjects((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Портфолио</h1>
          <p className="text-sm text-white/40 mt-1">Построенные дома: карта, карточки на /portfolio и главной.</p>
        </div>
        <Link href="/admin/built-objects/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] text-white text-sm font-semibold">
          <Plus size={16} /> Добавить
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-sm text-amber-200">{error}</div>
      ) : null}

      {loading ? (
        <div className="p-12 text-center text-white/30">Загрузка...</div>
      ) : objects.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <MapPinned size={44} className="mx-auto mb-3 text-white/15" />
          <p className="text-white/45 text-sm">Пока нет объектов в портфолио.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {objects.map((object) => {
            const cover = object.media.find((item) => item.type === "RENDER")?.url;
            return (
              <article key={object.id} className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08]">
                <div className="h-40 bg-white/[0.04] relative">
                  {cover ? <CmsImage src={cover} alt={object.title} fill className="object-cover" sizes="(max-width: 1280px) 50vw, 380px" /> : null}
                  {!object.published ? <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white/60">Черновик</span> : null}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h2 className="font-semibold text-white">{object.title}</h2>
                    <p className="text-xs text-white/35 mt-1">{builtObjectMaterialLabel(object.material)}{object.location ? ` - ${object.location}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/built-objects/${object.id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-white/60 hover:text-white transition-colors">
                      <Pencil size={12} /> Изменить
                    </Link>
                    <button onClick={() => toggle(object)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-white/60 hover:text-white transition-colors">
                      {object.published ? <><EyeOff size={12} /> Скрыть</> : <><Eye size={12} /> Опубл.</>}
                    </button>
                    <button onClick={() => remove(object.id)} className="ml-auto p-1.5 rounded-lg text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
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
