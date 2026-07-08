"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, RotateCcw, Save, Trash2 } from "lucide-react";

import { AdminMediaUpload } from "@/components/admin/admin-media-upload";
import {
  DEFAULT_HOME_HERO_BANNER,
  createEmptyHomeHeroPromo,
  homeHeroBannerSchema,
  type HomeHeroBanner,
  type HomeHeroPromoSlide,
} from "@/lib/home-hero-banner-schema";

export default function AdminHomeBannerPage() {
  const [data, setData] = useState<HomeHeroBanner>(DEFAULT_HOME_HERO_BANNER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/admin/home-hero-banner")
      .then((r) => r.json())
      .then((d: HomeHeroBanner | { error?: string }) => {
        if (d && typeof d === "object" && "promos" in d && Array.isArray((d as HomeHeroBanner).promos)) {
          setData(d as HomeHeroBanner);
        } else {
          setError("Не удалось загрузить настройки");
        }
      })
      .catch(() => setError("Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function patchPromo(index: number, partial: Partial<HomeHeroPromoSlide>) {
    setData((prev) => ({
      ...prev,
      promos: prev.promos.map((p, i) => (i === index ? { ...p, ...partial } : p)),
    }));
    setSaved(false);
  }

  function movePromo(index: number, dir: -1 | 1) {
    setData((prev) => {
      const next = index + dir;
      if (next < 0 || next >= prev.promos.length) return prev;
      const promos = [...prev.promos];
      const tmp = promos[index]!;
      promos[index] = promos[next]!;
      promos[next] = tmp;
      return { ...prev, promos };
    });
    setSaved(false);
  }

  function addPromo() {
    setData((prev) => ({
      ...prev,
      promos: [...prev.promos, createEmptyHomeHeroPromo(String(Date.now()))],
    }));
    setSaved(false);
  }

  function removePromo(index: number) {
    setData((prev) => {
      if (prev.promos.length <= 1) return prev;
      return { ...prev, promos: prev.promos.filter((_, i) => i !== index) };
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const payload: HomeHeroBanner = {
      ...data,
      headlineLines: data.headlineLines.map((line) => line.trim()).filter((line) => line.length > 0),
      subheadline: data.subheadline.trim(),
      steps: data.steps.map((step) => ({ ...step, text: step.text.trim() })),
      badges: data.badges.map((badge) => badge.trim()),
    };
    const validated = homeHeroBannerSchema.safeParse(payload);
    if (!validated.success) {
      setError(JSON.stringify(validated.error.flatten(), null, 2));
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/home-hero-banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.data),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(typeof j.error === "string" ? j.error : "Ошибка сохранения");
        setSaving(false);
        return;
      }
      setData(validated.data);
      setSaved(true);
    } catch {
      setError("Сеть недоступна");
    }
    setSaving(false);
  }

  function resetToDefaults() {
    if (!confirm("Подставить значения по умолчанию из кода? Сохраните отдельно, чтобы записать в БД.")) return;
    setData({ ...DEFAULT_HOME_HERO_BANNER });
    setSaved(false);
  }

  if (loading) {
    return <div className="p-12 text-center text-white/30">Загрузка...</div>;
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors";
  const labelClass = "block text-xs text-white/40 mb-1";

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Главный баннер</h1>
          <p className="text-sm text-white/40 mt-1">
            Фон день/ночь и промо-карусель на главной странице. Публично: /
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetToDefaults}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm hover:bg-white/[0.05]"
          >
            <RotateCcw size={16} /> Дефолты в форму
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-sm font-semibold disabled:opacity-50"
          >
            <Save size={16} /> {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[11px] text-red-200 whitespace-pre-wrap font-mono">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Сохранено. Главная страница обновится в течение минуты.
        </div>
      ) : null}

      <section className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white/90">Заголовок баннера</h2>
          <p className="text-sm text-white/40 mt-1">
            Каждая строка с новой строки — отдельная строка в крупном заголовке слева на баннере.
          </p>
        </div>
        <div>
          <label className={labelClass}>Текст заголовка</label>
          <textarea
            className={`${inputClass} min-h-[120px] resize-y font-medium`}
            value={data.headlineLines.join("\n")}
            onChange={(e) => {
              setData((prev) => ({
                ...prev,
                headlineLines: e.target.value.split("\n"),
              }));
              setSaved(false);
            }}
            placeholder={"Строим дома,\nв которые хочется\nвозвращаться"}
          />
        </div>
        <div>
          <label className={labelClass}>Текст под заголовком</label>
          <textarea
            className={`${inputClass} min-h-[88px] resize-y`}
            value={data.subheadline}
            onChange={(e) => {
              setData((prev) => ({ ...prev, subheadline: e.target.value }));
              setSaved(false);
            }}
            placeholder="От идеи до готового дома: …"
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white/90">Три шага под кнопками</h2>
          <p className="text-sm text-white/40 mt-1">Блок 01 / 02 / 03 под кнопками «Смотреть проекты» и «Рассчитать стоимость».</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {data.steps.map((step, index) => (
            <div key={step.num}>
              <label className={labelClass}>{step.num}</label>
              <input
                className={inputClass}
                value={step.text}
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    steps: prev.steps.map((s, i) => (i === index ? { ...s, text: e.target.value } : s)),
                  }));
                  setSaved(false);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white/90">Преимущества внизу баннера</h2>
          <p className="text-sm text-white/40 mt-1">Четыре плашки в нижней полосе главного баннера.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.badges.map((badge, index) => (
            <div key={index}>
              <label className={labelClass}>Преимущество {index + 1}</label>
              <input
                className={inputClass}
                value={badge}
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    badges: prev.badges.map((b, i) => (i === index ? e.target.value : b)),
                  }));
                  setSaved(false);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-5">
        <h2 className="text-lg font-semibold text-white/90">Фон баннера</h2>
        <p className="text-sm text-white/40 -mt-2">
          Дневное изображение — при светлой теме сайта, ночное — при тёмной. Рекомендуемый размер от 2400×1350 px.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <AdminMediaUpload
            label="День (светлая тема)"
            accept="image"
            profile="hero"
            value={data.backgrounds.light}
            onChange={(url) => {
              setData((prev) => ({ ...prev, backgrounds: { ...prev.backgrounds, light: url } }));
              setSaved(false);
            }}
          />
          <AdminMediaUpload
            label="Ночь (тёмная тема)"
            accept="image"
            profile="hero"
            value={data.backgrounds.dark}
            onChange={(url) => {
              setData((prev) => ({ ...prev, backgrounds: { ...prev.backgrounds, dark: url } }));
              setSaved(false);
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white/90">Промо и акции</h2>
            <p className="text-sm text-white/40 mt-1">
              Карусель справа на баннере — листается стрелками на сайте. Для акций загружайте горизонтальный баннер (примерно 4:3 или 16:9) — он показывается целиком, без обрезки.
            </p>
          </div>
          <button
            type="button"
            onClick={addPromo}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-sm text-white/80 hover:bg-white/[0.05]"
          >
            <Plus size={16} /> Добавить слайд
          </button>
        </div>

        <div className="space-y-4">
          {data.promos.map((promo, index) => (
            <div
              key={`${promo.id}-${index}`}
              className="rounded-xl border border-white/[0.08] bg-black/20 p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Слайд {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => movePromo(index, -1)}
                    disabled={index === 0}
                    className="p-2 rounded-lg border border-white/10 text-white/60 disabled:opacity-30 hover:bg-white/[0.05]"
                    aria-label="Выше"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePromo(index, 1)}
                    disabled={index === data.promos.length - 1}
                    className="p-2 rounded-lg border border-white/10 text-white/60 disabled:opacity-30 hover:bg-white/[0.05]"
                    aria-label="Ниже"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePromo(index)}
                    disabled={data.promos.length <= 1}
                    className="p-2 rounded-lg border border-red-500/20 text-red-300/80 disabled:opacity-30 hover:bg-red-500/10"
                    aria-label="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <AdminMediaUpload
                label="Изображение промо"
                accept="image"
                value={promo.image}
                onChange={(url) => patchPromo(index, { image: url })}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Метка (например «Сумерки»)</label>
                  <input
                    className={inputClass}
                    value={promo.label}
                    onChange={(e) => patchPromo(index, { label: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Заголовок</label>
                  <input
                    className={inputClass}
                    value={promo.title}
                    onChange={(e) => patchPromo(index, { title: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Описание</label>
                  <textarea
                    className={`${inputClass} min-h-[72px] resize-y`}
                    value={promo.caption}
                    onChange={(e) => patchPromo(index, { caption: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Ссылка «Подробнее»</label>
                  <input
                    className={inputClass}
                    value={promo.href}
                    onChange={(e) => patchPromo(index, { href: e.target.value })}
                    placeholder="/projects или https://…"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
