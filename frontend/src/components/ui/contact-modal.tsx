"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ArrowRight, Paperclip, Loader2, CheckCircle, FileText, Eye, Calculator, Pizza, Clock } from "lucide-react";
import { SpinningPizzaAsset } from "@/components/ui/spinning-pizza";
import { useModal } from "@/lib/modal-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { SITE_NAME } from "@/lib/constants";
import { useContactConfig } from "@/lib/contact-config-context";
import { readLeadError } from "@/lib/read-lead-error";
import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";
import {
  FunnelFillButton as FillButton,
  FunnelInputField as InputField,
  FunnelSelect,
} from "@/components/ui/funnel-ui";
import { BackNavButton } from "@/components/ui/back-nav";
import { HouseConstructionCalculatorForm } from "@/components/construction/house-construction-calculator-form";

type WizardStep =
  | "q1"
  | "q2"
  | "form-project"
  | "form-inspection"
  | "form-calculator"
  | "success"
  | "timer"
  | "pizza";

/* ───── Schemas ───── */

const projectFormSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер"),
  email: z.string().email("Введите корректный email"),
  company: z.string().optional(),
  budget: z.string().optional(),
  description: z.string().min(10, "Опишите проект подробнее"),
  privacy: z.boolean().refine((v) => v === true, { message: "Необходимо согласие" }),
  honeypot: z.string().max(0).optional(),
});
type ProjectFormData = z.infer<typeof projectFormSchema>;

const inspectionFormSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер"),
  objectType: z.string().min(1, "Выберите тип объекта"),
  address: z.string().min(5, "Укажите адрес"),
  area: z.string().optional(),
  description: z.string().optional(),
  preferredTime: z.string().optional(),
  privacy: z.boolean().refine((v) => v === true, { message: "Необходимо согласие" }),
  honeypot: z.string().max(0).optional(),
});
type InspectionFormData = z.infer<typeof inspectionFormSchema>;

/* ───── Constants ───── */

const BUDGET_OPTIONS = [
  "Планируемый бюджет",
  "до 500 000 ₽",
  "500 000 – 1 000 000 ₽",
  "1 000 000 – 3 000 000 ₽",
  "3 000 000 – 5 000 000 ₽",
  "от 5 000 000 ₽",
];

const OBJECT_TYPES = [
  "Загородный дом",
  "Дача / сезонное проживание",
  "Таунхаус / дуплекс",
  "Коммерческий объект",
  "Другое",
];

const OBJECT_TYPE_SELECT_OPTIONS = [
  { value: "", label: "Выберите тип" },
  ...OBJECT_TYPES.map((t) => ({ value: t, label: t })),
];

const FLOOR_SELECT_OPTIONS = [
  { value: "", label: "Выберите" },
  ...["1", "2", "3", "4", "5+"].map((f) => ({ value: f, label: f })),
];

const PREFERRED_TIME_OPTIONS = [
  { value: "", label: "Любое" },
  { value: "morning", label: "Утро (9–12)" },
  { value: "afternoon", label: "День (12–17)" },
  { value: "evening", label: "Вечер (17–20)" },
];

const BUDGET_SELECT_OPTIONS = BUDGET_OPTIONS.map((opt, i) => ({
  value: i === 0 ? "" : opt,
  label: opt,
}));

/* ───── Shared UI ───── */

/* ───── Question Steps ───── */

function Question1({ onAnswer }: { onAnswer: (hasProject: boolean) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <p className="text-[10px] uppercase tracking-[0.3em] mb-6" style={{ color: "var(--text-muted)" }}>
        Шаг 1 из 2
      </p>
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center mb-12 sm:mb-16 leading-[1]">
        Есть проект?
      </h2>
      <div className="w-full max-w-md flex flex-col gap-4">
        <FillButton onClick={() => onAnswer(true)} icon={<FileText size={20} />}>
          Да, есть проект
        </FillButton>
        <FillButton onClick={() => onAnswer(false)}>
          Нет
        </FillButton>
      </div>
    </div>
  );
}

function Question2({ onAnswer, onBack }: { onAnswer: (answer: "yes" | "no" | "unsure") => void; onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-md">
        <BackNavButton onClick={onBack} className="mb-8" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.3em] mb-6" style={{ color: "var(--text-muted)" }}>
        Шаг 2 из 2
      </p>
      <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center mb-12 sm:mb-16 leading-[1]">
        Планируете<br />делать проект?
      </h2>
      <div className="w-full max-w-md flex flex-col gap-4">
        <FillButton onClick={() => onAnswer("yes")} icon={<FileText size={20} />}>
          Да
        </FillButton>
        <FillButton onClick={() => onAnswer("no")} icon={<Eye size={20} />}>
          Нет
        </FillButton>
        <FillButton onClick={() => onAnswer("unsure")} icon={<Calculator size={20} />}>
          Не уверен
        </FillButton>
      </div>
    </div>
  );
}

/* ───── Form: Project (existing) ───── */

function ProjectForm({ onBack, onSuccess, getRecaptchaToken }: { onBack: () => void; onSuccess: () => void; getRecaptchaToken?: (action: string) => Promise<string> }) {
  const contact = useContactConfig();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      company: "",
      budget: "",
      description: "",
      privacy: false,
      honeypot: "",
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    if (data.honeypot) return;
    setSubmitError(null);
    setLoading(true);
    try {
      const recaptchaToken = getRecaptchaToken ? await getRecaptchaToken("submit") : "";
      const params = new URLSearchParams(window.location.search);
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name, phone: data.phone, email: data.email,
          service: "Описание проекта",
          source: "project-form", pageUrl: window.location.href,
          honeypot: data.honeypot || "",
          recaptchaToken: recaptchaToken || undefined,
          utmSource: params.get("utm_source"), utmMedium: params.get("utm_medium"), utmCampaign: params.get("utm_campaign"),
          calcData: {
            company: data.company || null,
            budget: data.budget || null,
            description: data.description,
          },
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.redirectUrl) { window.location.href = result.redirectUrl; }
        else { reset(); onSuccess(); }
      } else {
        setSubmitError(await readLeadError(response));
      }
    } catch {
      setSubmitError("Нет связи с сервером. Позвоните нам: " + contact.phone);
    }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-start md:items-center">
      <div className="container mx-auto py-20 md:py-16">
        <div className="max-w-3xl mx-auto">
          <BackNavButton onClick={onBack} className="mb-8" />
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl leading-[1.05] mb-8">
            ОПИШИТЕ<br />ВАШ ПРОЕКТ
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="relative" style={{ border: "1px solid var(--border)" }}>
                <input type="text" placeholder="Имя*" className="funnel-text-input w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-transparent text-sm focus:outline-none" style={{ color: "var(--text)" }} {...register("name")} />
                {errors.name && <span className="absolute bottom-1 right-3 text-[10px] text-red-400">{errors.name.message}</span>}
              </div>
              <div className="relative border-phone-field" style={{ border: "1px solid var(--border)", borderTop: "none", borderLeft: "none" }}>
                <input type="tel" placeholder="Телефон*" inputMode="tel" autoComplete="tel" className="funnel-text-input w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-transparent text-sm focus:outline-none" style={{ color: "var(--text)" }} {...register("phone")} />
                {errors.phone && <span className="absolute bottom-1 right-3 text-[10px] text-red-400">{errors.phone.message}</span>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="relative" style={{ border: "1px solid var(--border)", borderTop: "none" }}>
                <input type="email" placeholder="E-mail*" className="funnel-text-input w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-transparent text-sm focus:outline-none" style={{ color: "var(--text)" }} {...register("email")} />
                {errors.email && <span className="absolute bottom-1 right-3 text-[10px] text-red-400">{errors.email.message}</span>}
              </div>
              <div className="border-phone-field" style={{ border: "1px solid var(--border)", borderTop: "none", borderLeft: "none" }}>
                <input type="text" placeholder="Компания" className="funnel-text-input w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-transparent text-sm focus:outline-none" style={{ color: "var(--text)" }} {...register("company")} />
              </div>
            </div>
            <div style={{ border: "1px solid var(--border)", borderTop: "none" }}>
              <Controller
                name="budget"
                control={control}
                render={({ field }) => (
                  <FunnelSelect
                    variant="panel"
                    className="[&_button]:text-sm"
                    options={BUDGET_SELECT_OPTIONS}
                    placeholder={BUDGET_OPTIONS[0]}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>
            <div className="relative" style={{ border: "1px solid var(--border)", borderTop: "none" }}>
              <textarea placeholder="Описание проекта*" rows={3} className="funnel-text-input w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-transparent text-sm focus:outline-none resize-none" style={{ color: "var(--text)" }} {...register("description")} />
              {errors.description && <span className="absolute bottom-3 right-3 text-[10px] text-red-400">{errors.description.message}</span>}
            </div>
            <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--text-muted)" }}>
                <Paperclip size={14} />
                <span>{fileName || "Загрузить файл"}</span>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.png,.dwg,.zip" onChange={(e) => setFileName(e.target.files?.[0]?.name || null)} />
              </label>
            </div>
            <div className="flex items-center gap-2 px-5 py-5">
              <Controller
                name="privacy"
                control={control}
                render={({ field }) => (
                  <input
                    id="privacy-project"
                    type="checkbox"
                    className="w-4 h-4 accent-[var(--accent)] cursor-pointer relative z-10 shrink-0"
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
              <label htmlFor="privacy-project" className="cursor-pointer text-xs" style={{ color: "var(--text-muted)" }}>
                Я согласен с{" "}
                <a href="/privacy" className="underline" target="_blank" rel="noopener noreferrer">
                  политикой конфиденциальности
                </a>
                {errors.privacy && <span className="text-red-400 text-[10px] ml-1">*</span>}
              </label>
            </div>
            <p className="text-[10px] px-5 -mt-2" style={{ color: "var(--text-subtle)" }}>
              Мы не передаём ваши данные третьим лицам.{" "}
              <Link href="/privacy" className="underline hover:text-[var(--accent)] transition-colors" onClick={(e) => e.stopPropagation()}>
                Политика конфиденциальности
              </Link>
            </p>
            <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true">
              <input tabIndex={-1} autoComplete="off" {...register("honeypot")} />
            </div>
            {submitError && (
              <p className="px-5 py-3 text-sm text-red-400 rounded-xl bg-red-500/10 border border-red-500/20 mb-3">
                {submitError}
              </p>
            )}
            <FillButton type="submit" disabled={loading}>
              {loading ? "Отправка..." : "Отправить заявку"}
            </FillButton>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ───── Form: Inspection (site visit) ───── */

function InspectionForm({ onBack, onSuccess, getRecaptchaToken }: { onBack: () => void; onSuccess: () => void; getRecaptchaToken?: (action: string) => Promise<string> }) {
  const contact = useContactConfig();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      objectType: "",
      address: "",
      area: "",
      description: "",
      preferredTime: "",
      privacy: false,
      honeypot: "",
    },
  });

  const onSubmit = async (data: InspectionFormData) => {
    if (data.honeypot) return;
    setSubmitError(null);
    setLoading(true);
    try {
      const recaptchaToken = getRecaptchaToken ? await getRecaptchaToken("submit") : "";
      const params = new URLSearchParams(window.location.search);
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name, phone: data.phone, service: "Выезд инженера", source: "inspection-request",
          pageUrl: window.location.href,
          honeypot: data.honeypot || "",
          recaptchaToken: recaptchaToken || undefined,
          utmSource: params.get("utm_source"), utmMedium: params.get("utm_medium"), utmCampaign: params.get("utm_campaign"),
          calcData: {
            objectType: data.objectType,
            address: data.address,
            area: data.area || null,
            description: data.description || null,
            preferredTime: data.preferredTime || null,
          },
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result.redirectUrl) { window.location.href = result.redirectUrl; }
        else { reset(); onSuccess(); }
      } else {
        setSubmitError(await readLeadError(response));
      }
    } catch {
      setSubmitError("Нет связи с сервером. Позвоните нам: " + contact.phone);
    }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-start md:items-center">
      <div className="container mx-auto py-20 md:py-16">
        <div className="max-w-2xl mx-auto">
          <BackNavButton onClick={onBack} className="mb-8" />
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl leading-[1.05] mb-3">
            ОПИСАНИЕ ОБЪЕКТА
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
            Заполните информацию — инженер свяжется для согласования выезда на осмотр
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Ваше имя" error={errors.name?.message}>
                <input type="text" placeholder="Иван" className="funnel-text-input w-full px-0 py-3 bg-transparent border-b text-base sm:text-sm focus:outline-none" style={{ borderColor: errors.name ? "#ef4444" : "var(--border)", color: "var(--text)" }} {...register("name")} />
              </InputField>
              <InputField label="Телефон" error={errors.phone?.message}>
                <input type="tel" placeholder="+7 (999) 000-00-00" inputMode="tel" autoComplete="tel" className="funnel-text-input w-full px-0 py-3 bg-transparent border-b text-base sm:text-sm focus:outline-none" style={{ borderColor: errors.phone ? "#ef4444" : "var(--border)", color: "var(--text)" }} {...register("phone")} />
              </InputField>
            </div>
            <InputField label="Тип объекта" error={errors.objectType?.message}>
              <Controller
                name="objectType"
                control={control}
                render={({ field }) => (
                  <FunnelSelect
                    variant="underline"
                    options={OBJECT_TYPE_SELECT_OPTIONS}
                    placeholder="Выберите тип"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={!!errors.objectType}
                  />
                )}
              />
            </InputField>
            <InputField label="Адрес объекта" error={errors.address?.message}>
              <input type="text" placeholder="г. Сочи, ул. ..." className="funnel-text-input w-full px-0 py-3 bg-transparent border-b text-base sm:text-sm focus:outline-none" style={{ borderColor: errors.address ? "#ef4444" : "var(--border)", color: "var(--text)" }} {...register("address")} />
            </InputField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Площадь (м²)">
                <input type="text" placeholder="100" inputMode="numeric" className="funnel-text-input w-full px-0 py-3 bg-transparent border-b text-base sm:text-sm focus:outline-none" style={{ borderColor: "var(--border)", color: "var(--text)" }} {...register("area")} />
              </InputField>
              <InputField label="Удобное время для звонка">
                <Controller
                  name="preferredTime"
                  control={control}
                  render={({ field }) => (
                    <FunnelSelect
                      variant="underline"
                      options={PREFERRED_TIME_OPTIONS}
                      placeholder="Любое"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </InputField>
            </div>
            <InputField label="Комментарий">
              <textarea placeholder="Опишите что нужно сделать..." rows={3} className="funnel-text-input w-full px-0 py-3 bg-transparent border-b text-base sm:text-sm focus:outline-none resize-none" style={{ borderColor: "var(--border)", color: "var(--text)" }} {...register("description")} />
            </InputField>
            <div className="flex items-center gap-2 mt-2">
              <Controller
                name="privacy"
                control={control}
                render={({ field }) => (
                  <input
                    id="privacy-inspection"
                    type="checkbox"
                    className="w-4 h-4 accent-[var(--accent)] cursor-pointer relative z-10 shrink-0"
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
              <label htmlFor="privacy-inspection" className="cursor-pointer text-xs" style={{ color: "var(--text-muted)" }}>
                Я согласен с{" "}
                <Link href="/privacy" className="underline" onClick={(e) => e.stopPropagation()}>
                  политикой конфиденциальности
                </Link>
                {errors.privacy && <span className="text-red-400 text-[10px] ml-1">*</span>}
              </label>
            </div>
            <p className="text-[10px] -mt-2" style={{ color: "var(--text-subtle)" }}>
              Мы не передаём ваши данные третьим лицам.{" "}
              <Link href="/consent" className="underline hover:text-[var(--accent)] transition-colors" onClick={(e) => e.stopPropagation()}>
                Согласие на обработку ПДн
              </Link>
            </p>
            <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true">
              <input tabIndex={-1} autoComplete="off" {...register("honeypot")} />
            </div>
            {submitError && (
              <p className="text-sm text-red-400 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                {submitError}
              </p>
            )}
            <FillButton type="submit" disabled={loading}>
              {loading ? "Отправка..." : "Заказать выезд инженера"}
            </FillButton>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ───── Form: Calculator ───── */

function CalculatorForm({ onBack: _onBack, onSuccess, getRecaptchaToken }: { onBack: () => void; onSuccess: (leadId: string, name: string, phone: string) => void; getRecaptchaToken?: (action: string) => Promise<string> }) {
  return <HouseConstructionCalculatorForm onSuccess={onSuccess} getRecaptchaToken={getRecaptchaToken} />;
}

/* ───── Success Screen ───── */

function SuccessScreen({ onClose }: { onClose: () => void }) {
  const contact = useContactConfig();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <CheckCircle size={56} style={{ color: "var(--accent)" }} className="mb-8" />
      <h2 className="font-heading text-3xl sm:text-4xl md:text-6xl mb-6">Заявка отправлена</h2>
      <p className="text-base md:text-lg mb-4 max-w-md" style={{ color: "var(--text-muted)" }}>
        Мы свяжемся с вами в ближайшее время
      </p>
      {contact.phone.trim() || contact.phone2.trim() ? (
        <p className="text-sm mb-10" style={{ color: "var(--text-subtle)" }}>
          Или позвоните нам:{" "}
          {contact.phone.trim() && contact.phoneRaw.trim() ? (
            <a href={`tel:${contact.phoneRaw}`} className="underline" style={{ color: "var(--text-muted)" }}>
              {contact.phone}
            </a>
          ) : null}
          {contact.phone.trim() && contact.phoneRaw.trim() && contact.phone2.trim() && contact.phone2Raw.trim()
            ? " / "
            : null}
          {contact.phone2.trim() && contact.phone2Raw.trim() ? (
            <a href={`tel:${contact.phone2Raw}`} className="underline" style={{ color: "var(--text-muted)" }}>
              {contact.phone2}
            </a>
          ) : null}
        </p>
      ) : (
        <p className="text-sm mb-10" style={{ color: "var(--text-subtle)" }}>
          Контактный телефон указан в разделе «Контакты» на сайте.
        </p>
      )}
      <button
        onClick={onClose}
        className="text-xs uppercase tracking-[0.15em] underline underline-offset-4 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        Закрыть
      </button>
    </div>
  );
}

/* ───── Timer + Pizza (после отправки «Ориентировочного расчёта») ───── */

function ModalTimerSection({ seconds }: { seconds: number }) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 py-2 md:flex-row md:items-center md:gap-6 max-w-2xl">
        <div className="flex shrink-0 justify-center md:w-[140px]">
          <SpinningPizzaAsset size="md" />
        </div>

        <div className="min-w-0 flex-1 text-center md:text-left">
          <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(15,61,46,0.15)" }}
            >
              <CheckCircle size={24} strokeWidth={2} style={{ color: "var(--accent)" }} />
            </div>
            <h2 className="font-heading text-lg sm:text-xl md:text-2xl" style={{ color: "var(--text)" }}>
              Заявка принята!
            </h2>
          </div>

          <p className="mb-4 text-xs leading-snug sm:text-sm" style={{ color: "var(--text-muted)" }}>
            Наш специалист свяжется с вами в течение 5 минут.
          </p>

          <div
            className="mb-4 inline-flex w-full flex-col items-center rounded-2xl border px-6 py-4 sm:inline-flex sm:max-w-none md:items-start"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-subtle)" }}>
              Осталось
            </p>
            <div
              className="font-heading text-4xl tabular-nums tracking-wider sm:text-5xl"
              style={{ color: "var(--accent)" }}
            >
              {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide" style={{ color: "var(--text-subtle)" }}>
              <Clock size={16} strokeWidth={2} style={{ color: "var(--accent)" }} />
              Ожидание
            </span>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide" style={{ color: "var(--text-subtle)" }}>
              <Pizza size={16} strokeWidth={2} style={{ color: "var(--accent)" }} />
              Бонус
            </span>
          </div>

          <p className="mt-3 text-[11px] leading-snug sm:text-xs" style={{ color: "var(--text-muted)" }}>
            Не дозвонимся за 5 минут — {SITE_NAME} пришлёт пиццу на выбор. Дальше откроется форма пожеланий на этом же экране.
          </p>
        </div>
      </div>
    </div>
  );
}

const pizzaCommentSchema = z.object({
  comment: z.string().min(2, "Напишите пожелание").max(500),
});

function ModalPizzaSection({
  leadId,
  contactName,
  contactPhone,
  onClose,
}: {
  leadId: string | null;
  contactName: string;
  contactPhone: string;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ comment: string }>({ resolver: zodResolver(pizzaCommentSchema) });

  const onSubmit = async (data: { comment: string }) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName.trim() || "Клиент",
          phone: contactPhone,
          service: "Пицца: пожелание",
          source: "calculator-pizza",
          calcData: {
            kind: "calculator-pizza",
            comment: data.comment,
            previousLeadId: leadId ?? undefined,
          },
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setSubmitError(json.error || "Не удалось отправить. Попробуйте ещё раз.");
        return;
      }
      setSent(true);
    } catch {
      setSubmitError("Ошибка сети. Попробуйте ещё раз.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 md:grid-cols-2 md:items-stretch md:gap-4">
        <div
          className="relative flex min-h-[160px] flex-col justify-center overflow-hidden rounded-2xl border p-4 md:min-h-0"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card-bg)",
            backgroundImage: "radial-gradient(ellipse 90% 70% at 50% 30%, rgba(15,61,46,0.08), transparent 55%)",
          }}
        >
          <div className="relative z-10 flex flex-col items-center gap-3 text-center md:py-2">
            <SpinningPizzaAsset size="lg" />
            <div>
              <h2 className="font-heading text-base sm:text-lg" style={{ color: "var(--accent)" }}>
                Пицца в подарок!
              </h2>
              <p className="mt-1 text-[11px] leading-snug sm:text-xs" style={{ color: "var(--text-muted)" }}>
                {SITE_NAME} — на ваш выбор. Форма пожеланий рядом.
              </p>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col justify-center rounded-2xl border p-4 sm:p-5"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
        >
          <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>
            <Pizza size={16} strokeWidth={2} style={{ color: "var(--accent)" }} />
            Пожелание
          </p>
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-3 text-center">
              <SpinningPizzaAsset size="lg" />
              <CheckCircle size={32} strokeWidth={2} style={{ color: "var(--accent)" }} />
              <p className="text-sm font-heading leading-snug" style={{ color: "var(--text)" }}>
                Отправлено! Ждите звонок и пиццу.
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-xs uppercase tracking-[0.15em] underline underline-offset-4 transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Закрыть
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Какую пиццу любите? Маргарита, пепперони..."
                className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
                {...register("comment")}
              />
              {errors.comment && <p className="text-xs text-red-400">{errors.comment.message}</p>}
              {submitError && <p className="text-xs text-red-400">{submitError}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-heading text-xs uppercase tracking-[0.1em] transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
              >
                <Pizza size={16} strokeWidth={2} />
                {isSubmitting ? "Отправка..." : "Отправить пожелание"}
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── Main Modal ───── */

export function ContactModal() {
  const { isOpen, closeModal, initialContactStep } = useModal();
  const [step, setStep] = useState<WizardStep>("q1");
  /** Вошли сразу в ориентировочный расчёт (без шагов «Есть проект?») — «Назад» закрывает модалку */
  const [directEstimateEntry, setDirectEstimateEntry] = useState(false);
  const router = useRouter();
  const getSmartCaptchaToken = useSmartCaptchaToken();

  const [pizzaLeadId, setPizzaLeadId] = useState<string | null>(null);
  const [pizzaName, setPizzaName] = useState("");
  const [pizzaPhone, setPizzaPhone] = useState("");
  const [timerSec, setTimerSec] = useState(300);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPizzaTimer = useCallback(() => {
    setTimerSec(300);
    setStep("timer");
    timerRef.current = setInterval(() => {
      setTimerSec((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setStep("pizza");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialContactStep === "form-calculator") {
        setStep("form-calculator");
        setDirectEstimateEntry(true);
      } else {
        setStep("q1");
        setDirectEstimateEntry(false);
      }
      window.__lenis?.stop();
    } else {
      window.__lenis?.start();
    }
    return () => {
      window.__lenis?.start();
    };
  }, [isOpen, initialContactStep]);

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("q1");
    setDirectEstimateEntry(false);
    closeModal();
  };

  const handleQ1 = (hasProject: boolean) => {
    if (hasProject) setStep("form-project");
    else setStep("q2");
  };

  const handleQ2 = (answer: "yes" | "no" | "unsure") => {
    if (answer === "yes") {
      handleClose();
      router.push("/services");
    } else if (answer === "no") {
      setStep("form-inspection");
    } else {
      setStep("form-calculator");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Форма обратной связи"
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain safe-bottom"
      style={{ backgroundColor: "var(--bg)", WebkitOverflowScrolling: "touch" }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleClose}
        className="fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] md:top-6 md:right-6 z-[110] min-w-[44px] min-h-[44px] w-12 h-12 flex items-center justify-center transition-colors duration-200 touch-manipulation"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
        aria-label="Закрыть"
      >
        <X size={28} />
      </button>

      {step === "form-calculator" && (
        <BackNavButton
          className="fixed top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-[110] md:top-6 md:left-6 touch-manipulation"
          onClick={() => {
            if (directEstimateEntry) handleClose();
            else setStep("q2");
          }}
        />
      )}

      {step === "q1" && <Question1 onAnswer={handleQ1} />}
      {step === "q2" && <Question2 onAnswer={handleQ2} onBack={() => setStep("q1")} />}
      {step === "form-project" && <ProjectForm onBack={() => setStep("q1")} onSuccess={() => setStep("success")} getRecaptchaToken={getSmartCaptchaToken} />}
      {step === "form-inspection" && <InspectionForm onBack={() => setStep("q2")} onSuccess={() => setStep("success")} getRecaptchaToken={getSmartCaptchaToken} />}
      {step === "form-calculator" && (
        <CalculatorForm
          onBack={directEstimateEntry ? handleClose : () => setStep("q2")}
          onSuccess={(id, name, phone) => {
            setPizzaLeadId(id);
            setPizzaName(name);
            setPizzaPhone(phone);
            startPizzaTimer();
          }}
          getRecaptchaToken={getSmartCaptchaToken}
        />
      )}
      {step === "timer" && <ModalTimerSection seconds={timerSec} />}
      {step === "pizza" && (
        <ModalPizzaSection
          leadId={pizzaLeadId}
          contactName={pizzaName}
          contactPhone={pizzaPhone}
          onClose={handleClose}
        />
      )}
      {step === "success" && <SuccessScreen onClose={handleClose} />}
    </div>
  );
}
