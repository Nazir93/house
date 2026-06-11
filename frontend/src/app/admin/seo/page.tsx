"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Plus, Trash2, AlertCircle, Search, ChevronDown, ChevronRight } from "lucide-react";
import { AdminMediaUpload } from "@/components/admin/admin-media-upload";
import { RichEditor } from "@/components/admin/rich-editor";

interface PageMetaItem {
  id: string;
  path: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  h1: string | null;
  bodyHtml: string | null;
  noindex: boolean;
}

interface RedirectItem {
  id: string;
  fromPath: string;
  toPath: string;
  permanent: boolean;
  hits: number;
  createdAt: string;
}

interface ErrorItem {
  id: string;
  path: string;
  referer: string;
  count: number;
  lastSeen: string;
}

const KNOWN_PAGES = [
  { path: "/", label: "Главная" },
  { path: "/projects", label: "Каталог проектов домов" },
  { path: "/individual-design", label: "Индивидуальное проектирование" },
  { path: "/calculator", label: "Калькулятор строительства" },
  { path: "/mortgage", label: "Ипотека" },
  { path: "/about", label: "О компании" },
  { path: "/reviews", label: "Отзывы" },
  { path: "/team", label: "Команда" },
  { path: "/services", label: "Услуги" },
  { path: "/services/proektirovanie", label: "Услуга: проектирование" },
  { path: "/services/fundament", label: "Услуга: фундамент" },
  { path: "/services/karkas", label: "Услуга: коробка дома" },
  { path: "/services/krovlya", label: "Услуга: кровля" },
  { path: "/services/inzheneriya", label: "Услуга: инженерные сети" },
  { path: "/services/otdelka", label: "Услуга: отделка" },
  { path: "/portfolio", label: "Портфолио (список)" },
  { path: "/portfolio/map", label: "Портфолио на карте" },
  { path: "/blog", label: "Блог" },
  { path: "/contacts", label: "Контакты" },
  { path: "/technology/materials", label: "Технологии: материалы" },
  { path: "/technology/house-area", label: "Технологии: площадь дома" },
  { path: "/partners/partner", label: "Партнёры — подряд" },
  { path: "/partners/supplier", label: "Партнёры — поставщик" },
  { path: "/partners/vacancies", label: "Партнёры — вакансии" },
  { path: "/partners/rent-repair", label: "Партнёры — аренда/ремонт" },
  { path: "/privacy", label: "Политика конфиденциальности" },
  { path: "/consent", label: "Согласие на обработку данных" },
];

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<"meta" | "redirects" | "errors" | "robots">("meta");

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SEO & Настройки</h1>
        <p className="text-sm text-white/40 mt-1">Мета-теги, редиректы, 404, robots.txt</p>
      </div>

      <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1">
        {[
          { key: "meta" as const, label: "Мета-теги" },
          { key: "redirects" as const, label: "301 Редиректы" },
          { key: "errors" as const, label: "404 Ошибки" },
          { key: "robots" as const, label: "Robots.txt" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[#0F3D2E] text-[#F6F6F4]"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "meta" && <MetaTab />}
      {activeTab === "redirects" && <RedirectsTab />}
      {activeTab === "errors" && <ErrorsTab />}
      {activeTab === "robots" && <RobotsTab />}
    </div>
  );
}

function MetaTab() {
  const [pages, setPages] = useState<PageMetaItem[]>([]);
  const [portfolioCases, setPortfolioCases] = useState<{ slug: string; title: string }[]>([]);
  const [houseProjects, setHouseProjects] = useState<{ slug: string; title: string }[]>([]);
  const [blogPosts, setBlogPosts] = useState<{ slug: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<PageMetaItem>>>({});

  useEffect(() => {
    fetch("/api/admin/built-objects")
      .then(async (r) => {
        const data = await r.json();
        if (r.ok && Array.isArray(data)) {
          setPortfolioCases(
            data.map((p: { slug: string; title: string }) => ({ slug: p.slug, title: p.title || p.slug }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/house-projects")
      .then(async (r) => {
        const data = await r.json();
        if (r.ok && Array.isArray(data)) {
          setHouseProjects(
            data.map((p: { slug: string; title: string }) => ({ slug: p.slug, title: p.title || p.slug }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/posts")
      .then(async (r) => {
        const data = await r.json();
        if (r.ok && Array.isArray(data)) {
          setBlogPosts(
            data.map((p: { slug: string; title: string }) => ({ slug: p.slug, title: p.title || p.slug }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoadError(null);
    fetch("/api/admin/meta")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setLoadError(typeof data?.error === "string" ? data.error : `Ошибка загрузки (${r.status})`);
          return;
        }
        if (Array.isArray(data)) setPages(data);
        else setLoadError("Некорректный ответ сервера");
      })
      .catch(() => setLoadError("Сеть или сервер недоступны"))
      .finally(() => setLoading(false));
  }, []);

  function updateDraft(path: string, field: string, value: string | boolean) {
    setDrafts((prev) => ({
      ...prev,
      [path]: { ...prev[path], [field]: value },
    }));
  }

  function getField(path: string, field: keyof PageMetaItem): string {
    if (field === "noindex") return "";
    const draft = drafts[path];
    if (draft && field in draft) return (draft[field] as string) || "";
    const existing = pages.find((p) => p.path === path);
    if (existing && existing[field]) return existing[field] as string;
    return "";
  }

  function getNoindex(path: string): boolean {
    const draft = drafts[path];
    if (draft && "noindex" in draft) return Boolean(draft.noindex);
    return pages.find((p) => p.path === path)?.noindex ?? false;
  }

  async function saveMeta(path: string) {
    setSaving(path);
    setSaveError(null);
    const draft = drafts[path] || {};
    const existing = pages.find((p) => p.path === path);
    const body = { path, ...existing, ...draft };

    try {
      const res = await fetch("/api/admin/meta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok) {
        const updated = payload as PageMetaItem;
        setPages((prev) => {
          const idx = prev.findIndex((p) => p.path === path);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updated;
            return next;
          }
          return [...prev, updated];
        });
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[path];
          return next;
        });
      } else {
        setSaveError(
          typeof payload?.error === "string" ? payload.error : `Сохранение не удалось (${res.status})`
        );
      }
    } catch {
      setSaveError("Сеть или сервер недоступны");
    }
    setSaving(null);
  }

  if (loading) return <div className="p-8 text-center text-white/30">Загрузка...</div>;

  if (loadError) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300/90">
        Не удалось загрузить мета-теги: {loadError}. Проверьте авторизацию, доступ к БД и откройте раздел снова.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {saveError && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-300/90 mb-2">
          {saveError}
        </div>
      )}
      <p className="text-xs text-white/30 mb-2">
        Задайте уникальные мета-теги для каждой страницы. Незаполненные поля используют значения по умолчанию из кода.
      </p>
      <p className="text-xs text-white/20 mb-4">
        «Новости» и «Портфолио» (построенные дома): тексты и обложки в соответствующих разделах. Ниже — блоки по URL для{" "}
        <code className="text-white/40">/blog/slug</code> и{" "}
        <code className="text-white/40">/portfolio/slug</code>
        : сниппет и H1 по умолчанию из статьи/объекта; полное переопределение title/description/H1/OG — здесь (PageMeta).
      </p>

      {[
        ...KNOWN_PAGES.map(({ path, label }) => ({ path, label })),
        ...blogPosts.map((p) => ({
          path: `/blog/${p.slug}`,
          label: `Статья: ${p.title}`,
        })),
        ...houseProjects.map((p) => ({
          path: `/projects/${p.slug}`,
          label: `Проект дома: ${p.title}`,
        })),
        ...portfolioCases.map((c) => ({
          path: `/portfolio/${c.slug}`,
          label: `Портфолио: ${c.title}`,
        })),
      ].map(({ path, label }) => (
        <div
          key={path}
          className="rounded-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden"
        >
          <button
            onClick={() => setExpanded(expanded === path ? null : path)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-white/[0.03] transition-colors"
          >
            <span>
              <span className="text-white">{label}</span>
              <span className="text-white/30 ml-2 font-mono text-xs">{path}</span>
            </span>
            {expanded === path ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {expanded === path && (
            <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04]">
              <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { field: "title", label: "Title", placeholder: "Заголовок страницы" },
                  { field: "h1", label: "H1", placeholder: "Заголовок H1 на странице" },
                  { field: "description", label: "Description", placeholder: "Описание для поисковиков", multiline: true },
                  { field: "keywords", label: "Keywords", placeholder: "ключевое, слово, через, запятую" },
                  { field: "ogTitle", label: "OG Title", placeholder: "Заголовок для соцсетей" },
                  { field: "ogDescription", label: "OG Description", placeholder: "Описание для соцсетей", multiline: true },
                ].map(({ field, label: fLabel, placeholder, multiline }) => (
                  <div key={field} className={multiline ? "md:col-span-2" : ""}>
                    <label className="block text-xs text-white/40 mb-1">{fLabel}</label>
                    {multiline ? (
                      <textarea
                        value={getField(path, field as keyof PageMetaItem)}
                        onChange={(e) => updateDraft(path, field, e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
                        placeholder={placeholder}
                      />
                    ) : (
                      <input
                        type="text"
                        value={getField(path, field as keyof PageMetaItem)}
                        onChange={(e) => updateDraft(path, field, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
                        placeholder={placeholder}
                      />
                    )}
                  </div>
                ))}
                <div className="md:col-span-2">
                  <AdminMediaUpload
                    label={
                      path === "/services"
                        ? "OG + баннер на странице «Услуги» (одно изображение)"
                        : "OG изображение (превью в соцсетях)"
                    }
                    accept="image"
                    value={getField(path, "ogImage")}
                    onChange={(url) => updateDraft(path, "ogImage", url)}
                  />
                </div>

                {path === "/services" && (
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs text-white/40">
                      Текст страницы «Услуги» (показывается под баннером, над списком услуг)
                    </label>
                    <RichEditor
                      value={getField(path, "bodyHtml")}
                      onChange={(v) => updateDraft(path, "bodyHtml", v)}
                      placeholder="Введите текст страницы «Услуги»..."
                      minHeight="250px"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-white/40">
                  <input
                    type="checkbox"
                    checked={getNoindex(path)}
                    onChange={(e) => updateDraft(path, "noindex", e.target.checked)}
                    className="rounded"
                  />
                  noindex (скрыть от поисковиков)
                </label>
                <button
                  onClick={() => saveMeta(path)}
                  disabled={saving === path}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving === path ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RedirectsTab() {
  const [redirects, setRedirects] = useState<RedirectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");

  const loadRedirects = useCallback(() => {
    fetch("/api/admin/redirects")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRedirects(data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadRedirects(); }, [loadRedirects]);

  async function addRedirect() {
    if (!fromPath || !toPath) return;
    const res = await fetch("/api/admin/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromPath, toPath, permanent: true }),
    });
    if (res.ok) {
      setFromPath("");
      setToPath("");
      loadRedirects();
    }
  }

  async function removeRedirect(id: string) {
    await fetch(`/api/admin/redirects/${id}`, { method: "DELETE" });
    setRedirects((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <div className="p-8 text-center text-white/30">Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4">
        <h3 className="text-sm font-semibold text-white/60 mb-3">Добавить редирект</h3>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-white/40 mb-1">Откуда</label>
            <input
              type="text"
              value={fromPath}
              onChange={(e) => setFromPath(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="/old-page"
            />
          </div>
          <div className="text-white/20 pb-2">→</div>
          <div className="flex-1">
            <label className="block text-xs text-white/40 mb-1">Куда</label>
            <input
              type="text"
              value={toPath}
              onChange={(e) => setToPath(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
              placeholder="/new-page"
            />
          </div>
          <button
            onClick={addRedirect}
            className="px-4 py-2 rounded-lg bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {redirects.length === 0 ? (
        <p className="text-center text-sm text-white/20 py-8">Нет редиректов</p>
      ) : (
        <div className="space-y-1">
          {redirects.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]"
            >
              <div className="flex items-center gap-3 text-sm min-w-0">
                <span className="font-mono text-red-400/60 truncate">{r.fromPath}</span>
                <span className="text-white/20">→</span>
                <span className="font-mono text-green-400/60 truncate">{r.toPath}</span>
                <span className="text-xs text-white/20">{r.permanent ? "301" : "302"}</span>
                {r.hits > 0 && <span className="text-xs text-white/20">{r.hits} хитов</span>}
              </div>
              <button
                onClick={() => removeRedirect(r.id)}
                className="text-red-400/40 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorsTab() {
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadErrors = useCallback(() => {
    fetch("/api/admin/errors")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setErrors(data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadErrors(); }, [loadErrors]);

  async function clearAll() {
    await fetch("/api/admin/errors", { method: "DELETE" });
    setErrors([]);
  }

  async function removeError(id: string) {
    await fetch(`/api/admin/errors?id=${id}`, { method: "DELETE" });
    setErrors((prev) => prev.filter((e) => e.id !== id));
  }

  const filtered = errors.filter((e) =>
    e.path.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-white/30">Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
            placeholder="Поиск по URL..."
          />
        </div>
        {errors.length > 0 && (
          <button
            onClick={clearAll}
            className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors"
          >
            Очистить все
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle size={40} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/20">Нет 404 ошибок</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]"
            >
              <div className="min-w-0">
                <div className="text-sm font-mono text-red-400/70 truncate">{e.path}</div>
                <div className="text-xs text-white/20 mt-0.5">
                  {e.count}x · {e.referer ? `от ${e.referer}` : "прямой"} · {new Date(e.lastSeen).toLocaleString("ru")}
                </div>
              </div>
              <button
                onClick={() => removeError(e.id)}
                className="text-white/20 hover:text-red-400 transition-colors ml-2"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RobotsTab() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.robots_txt_custom) setContent(data.robots_txt_custom);
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ robots_txt_custom: content }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* */ }
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-center text-white/30">Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white/60">Robots.txt</h3>
            <p className="text-xs text-white/30 mt-0.5">
              Оставьте пустым для стандартных правил. Заполните для кастомных.
            </p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              saved
                ? "bg-green-500 text-black"
                : "bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4]"
            } disabled:opacity-50`}
          >
            <Save size={14} />
            {saving ? "..." : saved ? "Сохранено" : "Сохранить"}
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); setSaved(false); }}
          rows={12}
          className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/[0.08] text-sm text-white font-mono placeholder:text-white/20 resize-y focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
          placeholder={`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nHost: https://dom.ru\nSitemap: https://dom.ru/sitemap.xml`}
        />
      </div>
    </div>
  );
}
