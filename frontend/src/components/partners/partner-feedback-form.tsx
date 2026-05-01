"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Section, SectionTitle } from "@/components/ui/section";
import { BackNavLink } from "@/components/ui/back-nav";
import { FunnelInputField as InputField, FunnelFillButton as FillButton } from "@/components/ui/funnel-ui";
import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";
import { partnerFeedbackFormSchema, type PartnerFeedbackFormData } from "@/lib/schemas";
import { useContactConfig } from "@/lib/contact-config-context";

async function readLeadError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    /* */
  }
  if (response.status === 429) return "Слишком много отправок. Подождите несколько минут.";
  if (response.status >= 500) return "Сервер временно недоступен. Позвоните нам.";
  return "Не удалось отправить заявку. Проверьте поля или позвоните нам.";
}

export function PartnerFeedbackForm({
  title,
  subtitle,
  source,
  service,
  topic,
}: {
  title: string;
  subtitle: string;
  source: string;
  service: string;
  topic: string;
}) {
  const contact = useContactConfig();
  const getSmartCaptchaToken = useSmartCaptchaToken();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnerFeedbackFormData>({
    resolver: zodResolver(partnerFeedbackFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      message: "",
      privacy: false,
      honeypot: "",
    },
  });

  const onSubmit = async (data: PartnerFeedbackFormData) => {
    if (data.honeypot) return;
    setSubmitError(null);
    setLoading(true);
    try {
      const recaptchaToken = await getSmartCaptchaToken();
      const params = new URLSearchParams(window.location.search);
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          message: data.message,
          service,
          source,
          pageUrl: window.location.href,
          honeypot: data.honeypot || "",
          recaptchaToken: recaptchaToken || undefined,
          utmSource: params.get("utm_source"),
          utmMedium: params.get("utm_medium"),
          utmCampaign: params.get("utm_campaign"),
          calcData: {
            kind: "partner-feedback",
            topic,
            message: data.message,
          },
        }),
      });
      if (response.ok) {
        const result = (await response.json()) as { redirectUrl?: string };
        if (result.redirectUrl) window.location.href = result.redirectUrl;
      } else {
        setSubmitError(await readLeadError(response));
      }
    } catch {
      setSubmitError("Нет связи с сервером. Позвоните нам: " + contact.phone);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-0 border-b border-[var(--border)] py-3 px-0 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors";

  return (
    <Section dark className="!pt-8 md:!pt-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <BackNavLink href="/">На главную</BackNavLink>
        </div>

        <SectionTitle subtitle={subtitle} className="!mb-8 md:!mb-10">
          {title}
        </SectionTitle>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...register("honeypot")} />

          <InputField label="Имя" error={errors.name?.message}>
            <input type="text" autoComplete="name" className={inputClass} {...register("name")} />
          </InputField>

          <InputField label="Телефон" error={errors.phone?.message}>
            <input type="tel" autoComplete="tel" className={inputClass} {...register("phone")} />
          </InputField>

          <InputField label="Email (необязательно)" error={errors.email?.message}>
            <input type="email" autoComplete="email" className={inputClass} {...register("email")} />
          </InputField>

          <InputField label="Сообщение" error={errors.message?.message}>
            <textarea
              rows={5}
              className={`${inputClass} border rounded-xl px-4 py-3 resize-y min-h-[120px]`}
              placeholder="Кратко опишите предложение или вопрос"
              {...register("message")}
            />
          </InputField>

          <div className="flex items-start gap-3">
            <Controller
              name="privacy"
              control={control}
              render={({ field }) => (
                <input
                  id="privacy-partner-feedback"
                  type="checkbox"
                  className="w-4 h-4 mt-0.5 accent-[var(--accent)] shrink-0 cursor-pointer relative z-10"
                  checked={field.value === true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
            <label htmlFor="privacy-partner-feedback" className="text-sm cursor-pointer" style={{ color: "var(--text-muted)" }}>
              Я согласен с{" "}
              <Link href="/privacy" className="underline" onClick={(e) => e.stopPropagation()}>
                политикой конфиденциальности
              </Link>
            </label>
          </div>
          {errors.privacy && <p className="text-[11px] text-red-400 -mt-2">{errors.privacy.message}</p>}

          {submitError && (
            <p className="text-sm text-red-400" role="alert">
              {submitError}
            </p>
          )}

          <div className="mt-2">
          <FillButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} aria-hidden />
                Отправка…
              </>
            ) : (
              "Отправить заявку"
            )}
          </FillButton>
          </div>

          <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
            Или по телефону:{" "}
            <a href={`tel:${contact.phoneRaw}`} className="underline" style={{ color: "var(--text-muted)" }}>
              {contact.phone}
            </a>
            {" / "}
            <a href={`tel:${contact.phone2Raw}`} className="underline" style={{ color: "var(--text-muted)" }}>
              {contact.phone2}
            </a>
          </p>
        </form>
      </div>
    </Section>
  );
}
