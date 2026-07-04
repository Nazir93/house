"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, MapPinned, Pencil, Plus, Trash2 } from "lucide-react";
import { builtObjectMaterialLabel } from "@/lib/construction-shared";
import { BUILT_HOMES_SECTION_LABEL } from "@/lib/constants";
import { CmsImage } from "@/components/ui/cms-image";
import {
  BUILT_OBJECT_SITE_STATUS_FILTER_OPTIONS,
  builtObjectSiteStatusAdminLabel,
  builtObjectSiteStatusLabel,
  builtObjectSiteStatusFilterToParam,
  filterBuiltObjectsBySiteStatus,
  parseBuiltObjectSiteStatusFilterParam,
  type BuiltObjectSiteStatusFilter,
} from "@/lib/built-object-site-status";
import { cn } from "@/lib/utils";

interface BuiltObjectAdminItem {
  id: string;
  title: string;
  slug: string;
  material: string;
  location?: string | null;
  published: boolean;
  siteStatus?: "COMPLETED" | "UNDER_CONSTRUCTION" | null;
  media: { type: string; url: string }[];
}

function statusFilterChipClass(active: boolean) {
  return cn(
    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
    active
      ? "border-[#0F3D2E] bg-[#0F3D2E]/25 text-emerald-200"
      : "border-white/[0.1] bg-white/[0.04] text-white/55 hover:text-white/80"
  );
}

function statusBadgeClass(status?: BuiltObjectAdminItem["siteStatus"]) {
  return status === "UNDER_CONSTRUCTION"
    ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
    : "bg-emerald-500/10 text-emerald-200 border-emerald-500/25";
}

export default function AdminBuiltObjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatusFilter =
    parseBuiltObjectSiteStatusFilterParam(searchParams.get("status")) ?? "all";

  const [objects, setObjects] = useState<BuiltObjectAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<BuiltObjectSiteStatusFilter>(initialStatusFilter);

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

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

  const filteredObjects = useMemo(
    () => filterBuiltObjectsBySiteStatus(objects, statusFilter),
    [objects, statusFilter]
  );

  async function toggle(object: BuiltObjectAdminItem) {
    const res = await fetch(`/api/admin/built-objects/${object.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !object.published }),
    });
    if (!res.ok) return;
    setObjects((prev) => prev.map((item) => (item.id === object.id ? { ...item, published: !item.published } : item)));
  }

  function setStatusFilterAndUrl(next: BuiltObjectSiteStatusFilter) {
    setStatusFilter(next);
    const param = builtObjectSiteStatusFilterToParam(next);
    const href = param ? `/admin/built-objects?status=${param}` : "/admin/built-objects";
    router.replace(href);
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
          <h1 className="text-2xl font-bold tracking-tight">{BUILT_HOMES_SECTION_LABEL}</h1>
          <p className="text-sm text-white/40 mt-1">Построенные и строящиеся дома: карта, карточки на /portfolio и главной.</p>
        </div>
        <Link href="/admin/built-objects/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] text-white text-sm font-semibold">
          <Plus size={16} /> Добавить
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {BUILT_OBJECT_SITE_STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setStatusFilterAndUrl(opt.id)}
            className={statusFilterChipClass(statusFilter === opt.id)}
            aria-pressed={statusFilter === opt.id}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-sm text-amber-200">{error}</div>
      ) : null}

      {loading ? (
        <div className="p-12 text-center text-white/30">Загрузка...</div>
      ) : filteredObjects.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <MapPinned size={44} className="mx-auto mb-3 text-white/15" />
          <p className="text-white/45 text-sm">
            {objects.length === 0 ? "Пока нет объектов." : "Нет объектов с выбранным статусом."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredObjects.map((object) => {
            const cover = object.media.find((item) => item.type === "RENDER")?.url;
            return (
              <article key={object.id} className="rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.08]">
                <div className="h-40 bg-white/[0.04] relative">
                  {cover ? <CmsImage src={cover} alt={object.title} fill className="object-cover" sizes="(max-width: 1280px) 50vw, 380px" /> : null}
                  <span
                    className={cn(
                      "absolute left-3 top-3 rounded-full border px-2 py-1 text-[10px] font-semibold",
                      statusBadgeClass(object.siteStatus)
                    )}
                  >
                    {builtObjectSiteStatusLabel(object.siteStatus)}
                  </span>
                  {!object.published ? <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[11px] text-white/60">Черновик</span> : null}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h2 className="font-semibold text-white">{object.title}</h2>
                    <p className="text-xs text-white/35 mt-1">
                      {builtObjectMaterialLabel(object.material)}
                      {object.location ? ` - ${object.location}` : ""}
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">{builtObjectSiteStatusAdminLabel(object.siteStatus)}</p>
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
