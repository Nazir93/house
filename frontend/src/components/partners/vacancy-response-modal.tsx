"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, X } from "lucide-react";

import { FunnelInputField as InputField, FunnelFillButton as FillButton } from "@/components/ui/funnel-ui";
import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";
import { useContactConfig } from "@/lib/contact-config-context";
import { vacancyResponseFormSchema, type VacancyResponseFormData } from "@/lib/schemas";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";
import { cn } from "@/lib/utils";

async function readLeadError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    /* */
  }
  if (response.status === 429) return "Слишком много отправок. Подождите несколько минут.";
  if (response.status >= 500) return "Сервер временно недоступен. Позвоните нам.";
  return "Не удалось отправить отклик. Проверьте поля или напишите на info@chastdushi.ru";
}

type Props = {
  position: string;
  open: boolean;
  onClose: () => void;
};

export function VacancyResponseModal({ position, open, onClose }: Props) {
  const contact = useContactConfig();
  const getSmartCaptchaToken = useSmartCaptchaToken();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VacancyResponseFormData>({
    resolver: zodResolver(vacancyResponseFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      resume: "",
      message: "",
      privacy: false,
      honeypot: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    reset({
      name: "",
      phone: "",
      email: "",
      resume: "",
      message: "",
      privacy: false,
      honeypot: "",
    });
    lockBodyScroll();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, reset]);

  const onSubmit = async (data: VacancyResponseFormData) => {
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
          message: data.message || undefined,
          service: `Отклик: ${position}`,
          source: "partner-vacancy",
          pageUrl: window.location.href,
          honeypot: data.honeypot || "",
          recaptchaToken: recaptchaToken || undefined,
          utmSource: params.get("utm_source"),
          utmMedium: params.get("utm_medium"),
          utmCampaign: params.get("utm_campaign"),
          calcData: {
            kind: "vacancy-response",
            position,
            resume: data.resume || undefined,
            message: data.message || undefined,
          },
        }),
      });
      if (response.ok) {
        const result = (await response.json()) as { redirectUrl?: string };
        if (result.redirectUrl) {
          window.location.assign(result.redirectUrl);
        }
        return;
      }
      setSubmitError(await readLeadError(response));
    } catch {
      setSubmitError("Нет связи с сервером. Позвоните нам: " + contact.phone);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const inputClass =
    "w-full rounded-xl border bg-[var(--bg)] px-4 py-3 text-base text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vacancy-response-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Закрыть"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative z-[1] flex max-h-[min(94dvh,720px)] w-full flex-col",
          "rounded-t-[24px] border sm:max-w-md sm:rounded-[24px]",
        )}
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex shrink-0 items-center justify-center pt-3 sm:hidden"
          aria-hidden
        >
          <span className="h-1 w-10 rounded-full bg-[color-mix(in_srgb,var(--text)_18%,transparent)]" />
        </div>

        <div
          className="flex shrink-0 items-start justify-between gap-3 border-b px-4 py-3 sm:px-5 sm:py-4"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="min-w-0 pr-2">
            <h2
              id="vacancy-response-title"
              className="font-heading text-lg font-bold leading-snug text-[var(--graphite)] sm:text-xl"
            >
              Отклик: {position}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-full border transition hover:border-[var(--accent)]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4 sm:gap-5 sm:px-5 sm:py-5"
          style={{
            paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...register("honeypot")} />

          <InputField label="Имя" error={errors.name?.message}>
            <input
              type="text"
              autoComplete="name"
              className={inputClass}
              style={{ borderColor: "var(--border)" }}
              {...register("name")}
            />
          </InputField>

          <InputField label="Телефон" error={errors.phone?.message}>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={inputClass}
              style={{ borderColor: "var(--border)" }}
              {...register("phone")}
            />
          </InputField>

          <InputField label="Email" error={errors.email?.message}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              className={inputClass}
              style={{ borderColor: "var(--border)" }}
              {...register("email")}
            />
          </InputField>

          <InputField label="Резюме" error={errors.resume?.message}>
            <input
              type="text"
              className={inputClass}
              style={{ borderColor: "var(--border)" }}
              {...register("resume")}
            />
          </InputField>

          <InputField label="Комментарий" error={errors.message?.message}>
            <textarea
              rows={3}
              className={cn(inputClass, "min-h-[88px] resize-y")}
              style={{ borderColor: "var(--border)" }}
              {...register("message")}
            />
          </InputField>

          <div className="flex items-start gap-3">
            <Controller
              name="privacy"
              control={control}
              render={({ field }) => (
                <input
                  id="privacy-vacancy-response"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--accent)]"
                  checked={field.value === true}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
            <label
              htmlFor="privacy-vacancy-response"
              className="cursor-pointer text-sm leading-snug"
              style={{ color: "var(--text-muted)" }}
            >
              Согласен с{" "}
              <Link href="/privacy" className="underline" onClick={(event) => event.stopPropagation()}>
                политикой конфиденциальности
              </Link>
            </label>
          </div>
          {errors.privacy ? <p className="-mt-2 text-[11px] text-red-400">{errors.privacy.message}</p> : null}

          {submitError ? (
            <p className="text-sm text-red-400" role="alert">
              {submitError}
            </p>
          ) : null}

          <FillButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} aria-hidden />
                Отправка…
              </>
            ) : (
              "Отправить"
            )}
          </FillButton>
        </form>
      </div>
    </div>
  );
}
