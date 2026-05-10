"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { AdminFormSection } from "@/components/admin/admin-form-section";
import { RichEditor } from "@/components/admin/rich-editor";
import { uploadAdminMedia } from "@/lib/admin-upload";
import { CmsImage } from "@/components/ui/cms-image";

type PlanInput = { url: string; label: string; floor: string };

interface HouseProjectFormState {
  id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  floors: string;
  area: string;
  price: string;
  rooms: string;
  bathrooms: string;
  materials: string;
  isNew: boolean;
  pricePromo: string;
  mortgageEnabled: boolean;
  mortgageMode: "CALCULATOR" | "LEAD";
  published: boolean;
  order: string;
  completionJson: string;
  constructionJson: string;
  anchorsJson: string;
  heroPricingJson: string;
  calculatorJson: string;
  renders: string[];
  plans: PlanInput[];
}

const defaultCompletion = JSON.stringify(
  [
    { title: "Теплый контур", items: ["Фундамент", "Стены", "Кровля", "Окна"] },
    { title: "Дополнительные опции", items: ["3D-моделирование", "Инженерные сети", "Отделка"] },
  ],
  null,
  2
);

const defaultSchedule = JSON.stringify(
  [
    { title: "Подготовка участка", term: "1-2 недели", description: "Разметка и подготовительные работы." },
    { title: "Фундамент", term: "3-4 недели", description: "Армирование, бетонные работы и набор прочности." },
    { title: "Коробка и кровля", term: "6-10 недель", description: "Стены, перекрытия и кровельный контур." },
  ],
  null,
  2
);

const defaultAnchors = JSON.stringify(
  [
    { id: "plans", label: "Планировки и фасады" },
    { id: "completion", label: "Комплектация" },
    { id: "schedule", label: "График строительства" },
    { id: "mortgage", label: "Ипотека" },
  ],
  null,
  2
);

export function mapHouseProjectToForm(data?: any): HouseProjectFormState {
  const media = Array.isArray(data?.media) ? data.media : [];
  return {
    id: data?.id,
    title: data?.title || "",
    slug: data?.slug || "",
    shortDescription: data?.shortDescription || "",
    description: data?.description || "",
    floors: String(data?.floors ?? 1),
    area: String(data?.area ?? ""),
    price: String(data?.price ?? ""),
    rooms: String(data?.rooms ?? 3),
    bathrooms: String(data?.bathrooms ?? 1),
    materials: Array.isArray(data?.materials) ? data.materials.join(", ") : "Газобетон, Кирпич, Керамический блок",
    isNew: Boolean(data?.isNew),
    pricePromo: data?.pricePromo || "",
    mortgageEnabled: data?.mortgageEnabled ?? true,
    mortgageMode: data?.mortgageMode === "CALCULATOR" ? "CALCULATOR" : "LEAD",
    published: Boolean(data?.published),
    order: String(data?.order ?? 0),
    completionJson: JSON.stringify(data?.completionJson ?? JSON.parse(defaultCompletion), null, 2),
    constructionJson: JSON.stringify(data?.constructionJson ?? JSON.parse(defaultSchedule), null, 2),
    anchorsJson: JSON.stringify(data?.anchorsJson ?? JSON.parse(defaultAnchors), null, 2),
    heroPricingJson: JSON.stringify(data?.heroPricingJson ?? {}, null, 2),
    calculatorJson: JSON.stringify(data?.calculatorJson ?? {}, null, 2),
    renders: media.filter((item: any) => item.type === "RENDER").map((item: any) => item.url),
    plans: media
      .filter((item: any) => item.type === "PLAN")
      .map((item: any) => ({ url: item.url, label: item.label || "", floor: item.floor ? String(item.floor) : "" })),
  };
}

function isValidJson(value: string) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export function HouseProjectForm({ initial }: { initial?: any }) {
  const router = useRouter();
  const [form, setForm] = useState<HouseProjectFormState>(() => mapHouseProjectToForm(initial));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"render" | "plan" | null>(null);
  const [error, setError] = useState("");

  const jsonValid = useMemo(
    () =>
      isValidJson(form.completionJson) &&
      isValidJson(form.constructionJson) &&
      isValidJson(form.anchorsJson) &&
      isValidJson(form.heroPricingJson) &&
      isValidJson(form.calculatorJson),
    [form.anchorsJson, form.calculatorJson, form.completionJson, form.constructionJson, form.heroPricingJson]
  );

  function set<K extends keyof HouseProjectFormState>(field: K, value: HouseProjectFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function upload(type: "render" | "plan", file: File) {
    setUploading(type);
    setError("");
    const { url, error: uploadError } = await uploadAdminMedia(file);
    setUploading(null);
    if (uploadError || !url) {
      setError(uploadError || "Не удалось загрузить файл.");
      return;
    }
    if (type === "render") set("renders", [...form.renders, url]);
    if (type === "plan") set("plans", [...form.plans, { url, label: "", floor: "" }]);
  }

  async function save() {
    if (!form.title.trim() || !jsonValid) return;
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      mortgageMode: form.mortgageMode,
      materials: form.materials,
      completionJson: JSON.parse(form.completionJson),
      constructionJson: JSON.parse(form.constructionJson),
      anchorsJson: JSON.parse(form.anchorsJson),
      heroPricingJson: (() => {
        const v = JSON.parse(form.heroPricingJson) as Record<string, unknown>;
        if (!v || typeof v !== "object") return null;
        if (Array.isArray(v.tiers) && v.tiers.length === 0) return null;
        return v;
      })(),
      calculatorJson: (() => {
        try {
          const v = JSON.parse(form.calculatorJson) as Record<string, unknown>;
          if (!v || typeof v !== "object" || Array.isArray(v)) return null;
          if (Object.keys(v).length === 0) return null;
          return v;
        } catch {
          return null;
        }
      })(),
    };
    const endpoint = form.id ? `/api/admin/house-projects/${form.id}` : "/api/admin/house-projects";
    const method = form.id ? "PUT" : "POST";
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Не удалось сохранить проект.");
      } else {
        router.push(`/admin/house-projects/${data.id || form.id}`);
      }
    } catch {
      setError("Не удалось отправить данные.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/house-projects" className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{form.id ? "Проект дома" : "Новый проект дома"}</h1>
          <p className="text-sm text-white/40 mt-1">Каталог типовых домов, фильтры и карточка проекта.</p>
        </div>
        <button
          onClick={save}
          disabled={saving || !form.title.trim() || !jsonValid}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#143f32] text-white text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}
      {!jsonValid ? <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">Проверьте JSON в комплектации, графике или якорях.</div> : null}

      <AdminFormSection title="Основное" subtitle="Эти поля попадают в каталог, фильтры, SEO-сниппет и верх карточки проекта.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="block text-xs font-medium text-white/40">Название</span>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
          </label>
          <label className="space-y-1">
            <span className="block text-xs font-medium text-white/40">Slug</span>
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono" />
          </label>
        </div>
        <label className="space-y-1">
          <span className="block text-xs font-medium text-white/40">Короткое описание</span>
          <textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        </label>
        <div>
          <span className="block text-xs font-medium text-white/40 mb-1">Полное описание</span>
          <RichEditor value={form.description} onChange={(value) => set("description", value)} minHeight="150px" />
        </div>
      </AdminFormSection>

      <AdminFormSection title="Характеристики и цена" subtitle="Используются в фильтрах, карточках и блоке технических характеристик.">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            ["floors", "Этажей"],
            ["area", "Площадь, м²"],
            ["price", "Цена, ₽"],
            ["rooms", "Комнат"],
            ["bathrooms", "Санузлов"],
          ].map(([field, label]) => (
            <label key={field} className="space-y-1">
              <span className="block text-xs font-medium text-white/40">{label}</span>
              <input type="number" value={form[field as keyof HouseProjectFormState] as string} onChange={(e) => set(field as keyof HouseProjectFormState, e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
            </label>
          ))}
        </div>
        <label className="space-y-1">
          <span className="block text-xs font-medium text-white/40">Материалы через запятую</span>
          <input value={form.materials} onChange={(e) => set("materials", e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-medium text-white/40">Промо-текст цены</span>
          <input value={form.pricePromo} onChange={(e) => set("pricePromo", e.target.value)} placeholder="Цена с 1 марта - 10,9 млн" className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white" />
        </label>
        <div className="flex flex-col gap-4 text-sm text-white/70">
          <div className="flex flex-wrap gap-5">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.isNew} onChange={(e) => set("isNew", e.target.checked)} /> Новый проект</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.mortgageEnabled} onChange={(e) => set("mortgageEnabled", e.target.checked)} /> Показывать блок ипотеки</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Опубликован</label>
          </div>
          <label className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-white/40 shrink-0">Режим блока ипотеки (если включён)</span>
            <select
              value={form.mortgageMode}
              onChange={(e) => set("mortgageMode", e.target.value as HouseProjectFormState["mortgageMode"])}
              className="rounded-xl bg-white/[0.05] border border-white/[0.08] px-3 py-2 text-sm text-white"
            >
              <option value="CALCULATOR">Калькулятор на карточке + заявка</option>
              <option value="LEAD">Заявка и ссылка на страницу ипотеки</option>
            </select>
          </label>
        </div>
      </AdminFormSection>

      <AdminFormSection title="Рендеры и планировки" subtitle="Рендеры идут в слайдере карточки, планировки открываются в lightbox.">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Рендеры ({form.renders.length})</p>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/70 text-xs cursor-pointer">
              <Plus size={14} /> {uploading === "render" ? "Загрузка..." : "Добавить"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => Array.from(e.target.files || []).forEach((file) => upload("render", file))} />
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {form.renders.map((url, index) => (
              <div key={`${url}-${index}`} className="relative rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08]">
                <CmsImage src={url} alt="" width={320} height={112} className="h-28 w-full object-cover" sizes="320px" />
                <button onClick={() => set("renders", form.renders.filter((_, i) => i !== index))} className="absolute top-2 right-2 rounded-lg bg-black/60 p-1 text-white/70"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Планировки ({form.plans.length})</p>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-white/70 text-xs cursor-pointer">
              <Plus size={14} /> {uploading === "plan" ? "Загрузка..." : "Добавить"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => Array.from(e.target.files || []).forEach((file) => upload("plan", file))} />
            </label>
          </div>
          <div className="space-y-2">
            {form.plans.map((plan, index) => (
              <div key={`${plan.url}-${index}`} className="grid grid-cols-[72px_1fr_90px_auto] gap-3 items-center rounded-xl bg-white/[0.03] border border-white/[0.08] p-2">
                <CmsImage src={plan.url} alt="" width={64} height={56} className="h-14 w-16 object-cover rounded-lg" sizes="64px" />
                <input value={plan.label} onChange={(e) => set("plans", form.plans.map((p, i) => i === index ? { ...p, label: e.target.value } : p))} placeholder="1 этаж" className="px-3 py-2 rounded-lg bg-white/[0.05] text-sm text-white" />
                <input value={plan.floor} onChange={(e) => set("plans", form.plans.map((p, i) => i === index ? { ...p, floor: e.target.value } : p))} placeholder="Этаж" className="px-3 py-2 rounded-lg bg-white/[0.05] text-sm text-white" />
                <button onClick={() => set("plans", form.plans.filter((_, i) => i !== index))} className="p-2 text-red-300/70"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </AdminFormSection>

      <AdminFormSection title="Структурные блоки" subtitle="JSON позволяет добавлять пункты комплектации, сроки графика и кнопки sticky-навигации без изменения кода.">
        <label className="space-y-1">
          <span className="block text-xs font-medium text-white/40">
            Герой карточки: цены по материалу (heroPricingJson). Пустой tiers — на сайте считаются от поля «Цена, ₽»
          </span>
          <textarea value={form.heroPricingJson} onChange={(e) => set("heroPricingJson", e.target.value)} rows={10} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono" spellCheck={false} />
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-medium text-white/40">
            Калькулятор (calculatorJson): этапы, опции, транспорт. В partOfSoul.defaultRoof укажите кровлю проекта: dual | triple | quad (на сайте не переключается). Пустой объект — для «Аврора» пресет.
          </span>
          <textarea value={form.calculatorJson} onChange={(e) => set("calculatorJson", e.target.value)} rows={12} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono" spellCheck={false} />
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-medium text-white/40">Комплектация JSON</span>
          <textarea value={form.completionJson} onChange={(e) => set("completionJson", e.target.value)} rows={8} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono" />
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-medium text-white/40">График строительства JSON</span>
          <textarea value={form.constructionJson} onChange={(e) => set("constructionJson", e.target.value)} rows={8} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono" />
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-medium text-white/40">Кнопки-якоря JSON</span>
          <textarea value={form.anchorsJson} onChange={(e) => set("anchorsJson", e.target.value)} rows={5} className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono" />
        </label>
      </AdminFormSection>
    </div>
  );
}
