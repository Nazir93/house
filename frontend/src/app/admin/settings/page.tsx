"use client";

import { useState, useEffect } from "react";
import { Save, AlertCircle } from "lucide-react";

type SettingsField = {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  mono?: boolean;
};

type SettingsGroup = {
  title: string;
  description?: string;
  fields: SettingsField[];
};

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: "Контакты",
    description:
      "Заполненные поля подставляются на сайт вместо значений по умолчанию из кода (constants / .env). Пустое поле — берётся дефолт.",
    fields: [
      { key: "phone", label: "Телефон 1 (отображение)", placeholder: "+7 (999) 123-45-67" },
      { key: "phone_raw", label: "Телефон 1 (для ссылки tel:)", placeholder: "+79991234567" },
      { key: "phone2", label: "Телефон 2 (отображение)", placeholder: "+7 (999) 765-43-21" },
      { key: "phone2_raw", label: "Телефон 2 (для ссылки tel:)", placeholder: "+79997654321" },
      { key: "email", label: "Email", placeholder: "office@example.com" },
      { key: "address", label: "Адрес офиса", placeholder: "г. Санкт-Петербург, ул. …" },
      { key: "working_hours", label: "Режим работы", placeholder: "Пн–Пт 9:00–17:00" },
    ],
  },
  {
    title: "Соцсети",
    fields: [
      { key: "social_telegram", label: "Telegram", placeholder: "https://t.me/..." },
      { key: "social_vk", label: "ВКонтакте", placeholder: "https://vk.ru/..." },
      {
        key: "social_max",
        label: "Max (чат)",
        placeholder: "https://web.max.ru/id5300018030_biz",
      },
    ],
  },
  {
    title: "Реквизиты",
    fields: [
      { key: "company_full_name", label: "Полное наименование", placeholder: "ИП ...", multiline: true },
      { key: "company_short_name", label: "Краткое наименование", placeholder: "ИП ..." },
      { key: "company_inn", label: "ИНН", placeholder: "000000000000" },
      { key: "company_ogrnip", label: "ОГРНИП", placeholder: "000000000000000" },
      { key: "company_postal_address", label: "Почтовый адрес", placeholder: "354068, ..." },
      { key: "bank_name", label: "Банк", placeholder: "АО \"Тинькофф Банк\"" },
      { key: "bank_account", label: "Р/с", placeholder: "40802810700003133044" },
      { key: "bank_corr_account", label: "К/с", placeholder: "30101810145250000974" },
      { key: "bank_bic", label: "БИК", placeholder: "044525974" },
    ],
  },
  {
    title: "Аналитика",
    description:
      "ID из этого блока имеют приоритет. Если пусто — подставляются NEXT_PUBLIC_YANDEX_METRIKA_ID и NEXT_PUBLIC_GA_ID из .env.",
    fields: [
      { key: "yandex_metrika_id", label: "ID Яндекс.Метрики", placeholder: "12345678" },
      { key: "google_analytics_id", label: "ID Google Analytics", placeholder: "G-XXXXXXXXXX" },
    ],
  },
  {
    title: "Telegram-уведомления",
    description:
      "Сохраняются в БД и используются для POST /api/leads, если в .env на сервере не заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID. Приоритет у переменных окружения.",
    fields: [
      { key: "telegram_bot_token", label: "Bot Token", placeholder: "123456:ABC-DEF..." },
      { key: "telegram_chat_id", label: "Chat ID", placeholder: "-100123456789 или личный id" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError("Не удалось загрузить настройки");
        } else {
          setSettings(data);
        }
      })
      .catch(() => setError("Ошибка подключения к БД"))
      .finally(() => setLoading(false));
  }, []);

  function updateField(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-white/30">Загрузка настроек...</div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Настройки</h1>
          <p className="text-sm text-white/40 mt-1">Общие настройки сайта</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            saved
              ? "bg-green-500 text-black"
              : "bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4]"
          } disabled:opacity-50`}
        >
          <Save size={16} />
          {saving ? "Сохранение..." : saved ? "Сохранено" : "Сохранить"}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {SETTINGS_GROUPS.map((group) => (
        <div key={group.title} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{group.title}</h2>
          {group.description && (
            <p className="text-xs text-white/35 leading-relaxed -mt-1">{group.description}</p>
          )}
          <div className="space-y-3">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-white/40 mb-1 tracking-wide">{field.label}</label>
                {"multiline" in field && field.multiline ? (
                  <textarea
                    value={settings[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    rows={field.rows ?? 2}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 resize-y focus:outline-none focus:border-[#0F3D2E]/50 transition-colors ${field.mono ? "font-mono text-[12px] leading-relaxed" : ""}`}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type="text"
                    value={settings[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
