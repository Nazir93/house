"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import type { ServiceType } from "@prisma/client";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";
import { AdminSelect } from "@/components/admin/admin-select";
import { getDefaultServiceLandingDocument } from "@/lib/service-landing-defaults";
import { parseServiceLandingDocument, type ServiceLandingDocument } from "@/lib/service-landing-schema";
import { mergeServiceTitleIntoLandingJson } from "@/lib/merge-service-title-into-landing";
import { ServiceLandingTextForm } from "@/components/admin/service-landing-text-form";

import { FULL_SERVICE_TYPE_DROPDOWN_OPTIONS } from "@/lib/service-type-admin-options";

const SERVICE_TYPES = FULL_SERVICE_TYPE_DROPDOWN_OPTIONS;

const ICONS = ["zap", "speaker", "network", "home", "shield", "sun", "layers", "brush"];

export default function AdminEditServicePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [icon, setIcon] = useState("zap");
  const [coverImage, setCoverImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  /** Один URL для hero: при сохранении дублируется в desktop и mobile в БД. */
  const [bannerImage, setBannerImage] = useState("");
  const [published, setPublished] = useState(true);
  const [order, setOrder] = useState(0);
  const [landingDoc, setLandingDoc] = useState<ServiceLandingDocument | null>(null);
  const [seoH1, setSeoH1] = useState<string | null>(null);

  const effectivePageH1 = (seoH1 && seoH1.trim()) || title.trim() || "—";

  useEffect(() => {
    if (!slug) return;
    const path = `/services/${slug}`;
    fetch(`/api/admin/meta?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((meta: { h1?: string | null }) => {
        const h = meta?.h1;
        setSeoH1(typeof h === "string" && h.trim() ? h.trim() : null);
      })
      .catch(() => setSeoH1(null));
  }, [slug]);

  useEffect(() => {
    fetch(`/api/admin/services/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError("Услуга не найдена");
        } else {
          setTitle(data.title);
          setSlug(data.slug);
          setShortDescription(data.shortDescription);
          setServiceType(data.serviceType);
          setIcon(data.icon);
          setCoverImage(data.coverImage || "");
          setVideoUrl(data.videoUrl || "");
          setBannerImage(
            (data.bannerImageDesktop || data.bannerImageMobile || "").trim()
          );
          setPublished(data.published);
          setOrder(data.order);
          const defaultDoc = getDefaultServiceLandingDocument(data.serviceType as ServiceType);
          const parsed =
            data.landingJson != null ? parseServiceLandingDocument(data.landingJson) ?? defaultDoc : defaultDoc;
          setLandingDoc(parsed);
        }
      })
      .catch(() => setError("Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!landingDoc) {
        setError("Нет данных страницы услуги. Обновите страницу или нажмите «Подставить шаблон».");
        setSaving(false);
        return;
      }

      const landingJson = mergeServiceTitleIntoLandingJson(landingDoc, title.trim());

      const res = await fetch(`/api/admin/services/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          shortDescription,
          serviceType,
          icon,
          coverImage: coverImage || null,
          videoUrl: videoUrl || null,
          bannerImageDesktop: bannerImage.trim() || null,
          bannerImageMobile: bannerImage.trim() || null,
          published,
          order,
          landingJson,
        }),
      });
      if (!res.ok) throw new Error("Ошибка сохранения");
      router.push("/admin/services");
    } catch {
      setError("Ошибка сохранения");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Удалить услугу?")) return;
    await fetch(`/api/admin/services/${params.id}`, { method: "DELETE" });
    router.push("/admin/services");
  }

  if (loading) return <div className="p-12 text-center text-white/30">Загрузка...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/services" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={16} /> Услуги
        </Link>
        <button onClick={handleDelete} className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <h1 className="text-2xl font-bold">Редактировать услугу</h1>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 space-y-2 text-xs text-white/40 leading-relaxed">
        <p>
          <span className="text-white/55">Заголовок на странице услуги (как у посетителей):</span>{" "}
          <span className="text-white/90 font-medium">{effectivePageH1}</span>
        </p>
        <p>
          Сначала берётся <strong className="text-white/60 font-normal">H1 из SEO</strong> для{" "}
          <code className="text-white/45">/services/{slug || "…"}</code>, если поле заполнено. Иначе — как «Название»
          (подставляется в шапку при сохранении).
        </p>
        <p>
          Мета title/description и OG:{" "}
          <Link href="/admin/seo" className="text-emerald-300/90 hover:text-emerald-300">
            SEO &amp; Настройки
          </Link>
          .
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Название</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" />
          <p className="mt-1.5 text-[11px] text-white/30 leading-relaxed">
            Карточки на главной и списке услуг, большой заголовок на странице услуги (если не задан H1 в SEO).
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">URL (slug)</label>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/60 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Тип</label>
            <AdminSelect value={serviceType} onValueChange={setServiceType} options={SERVICE_TYPES} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Порядок</label>
            <input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Иконка</label>
          <div className="flex gap-2">
            {ICONS.map((ic) => (
              <button key={ic} type="button" onClick={() => setIcon(ic)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  icon === ic ? "border-[#0F3D2E]/50 text-emerald-300 bg-[#0F3D2E]/15" : "border-white/[0.08] text-white/40"}`}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <AdminMediaUpload
          label="Изображение услуги"
          accept="image"
          value={coverImage}
          onChange={setCoverImage}
        />

        <AdminMediaUpload
          label="Видео для карточки (фон)"
          accept="video"
          value={videoUrl}
          onChange={setVideoUrl}
        />

        <AdminMediaUpload
          label="Баннер лендинга (один для всех экранов)"
          accept="image"
          value={bannerImage}
          onChange={setBannerImage}
        />

        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">Краткое описание</label>
          <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white resize-none focus:outline-none focus:border-[#0F3D2E]/50 transition-colors" />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider">
              Тексты страницы услуги (как на сайте)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!serviceType) return;
                  if (!confirm("Заменить все тексты на шаблон для выбранного типа? Текущие правки пропадут.")) return;
                  setLandingDoc(getDefaultServiceLandingDocument(serviceType as ServiceType));
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/15 text-white/70 hover:border-[#0F3D2E]/50 hover:text-white transition-colors"
              >
                Подставить шаблон
              </button>
            </div>
          </div>
          {landingDoc ? (
            <ServiceLandingTextForm document={landingDoc} onChange={setLandingDoc} />
          ) : (
            <p className="text-sm text-white/40">Загрузка блоков…</p>
          )}
          <details className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2 text-xs text-white/40">
            <summary className="cursor-pointer text-white/50 hover:text-white/70 select-none">JSON (отладка)</summary>
            <pre className="mt-3 overflow-x-auto text-[11px] leading-relaxed text-white/50 whitespace-pre-wrap break-all">
              {landingDoc
                ? JSON.stringify(mergeServiceTitleIntoLandingJson(landingDoc, title.trim()), null, 2)
                : ""}
            </pre>
          </details>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setPublished(!published)}
            className={`relative w-10 h-5 rounded-full transition-colors ${published ? "bg-[#0F3D2E]" : "bg-white/10"}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${published ? "left-5" : "left-0.5"}`} />
          </button>
          <span className="text-sm text-white/60">{published ? "Опубликовано" : "Скрыто"}</span>
        </div>

        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] font-semibold text-sm transition-colors disabled:opacity-50">
          <Save size={16} />
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </form>
    </div>
  );
}
