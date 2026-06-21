"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, X } from "lucide-react";

import { FunnelInputField as InputField } from "@/components/ui/funnel-ui";
import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";
import { useContactConfig } from "@/lib/contact-config-context";
import { vacancyResponseFormSchema, type VacancyResponseFormData } from "@/lib/schemas";
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

const INPUT_CLASS =
  "funnel-text-input touch-manipulation w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-base text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_18%,transparent)]";

export function VacancyResponseModal({ position, open, onClose }: Props) {
  const contact = useContactConfig();
  const getSmartCaptchaToken = useSmartCaptchaToken();
  const [portalReady, setPortalReady] = useState(false);
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
    setPortalReady(true);
  }, []);

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

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.__lenis?.start();
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

  const scrollFieldIntoView = (event: React.FocusEvent<HTMLElement>) => {
    window.requestAnimationFrame(() => {
      event.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  };

  if (!open || !portalReady || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] lg:flex lg:items-center lg:justify-center lg:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vacancy-response-title"
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] touch-manipulation"
        aria-label="Закрыть"
        onClick={onClose}
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-[var(--mobile-bottom-nav-offset)] flex max-h-[min(70dvh,calc(100dvh-var(--mobile-bottom-nav-offset)-var(--site-header-sticky-offset)-0.75rem))] flex-col",
          "rounded-t-[24px] border lg:static lg:bottom-auto lg:z-[1] lg:max-h-[min(85dvh,640px)] lg:w-full lg:max-w-md lg:rounded-[24px]",
        )}
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-center pt-3 lg:hidden" aria-hidden>
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
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4 sm:gap-5 sm:px-5 sm:py-5"
          style={{
            WebkitOverflowScrolling: "touch",
            paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex flex-col gap-4 sm:gap-5">
            <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...register("honeypot")} />

            <InputField label="Имя" error={errors.name?.message}>
              <input
                type="text"
                autoComplete="name"
                enterKeyHint="next"
                className={INPUT_CLASS}
                onFocus={scrollFieldIntoView}
                {...register("name")}
              />
            </InputField>

            <InputField label="Телефон" error={errors.phone?.message}>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="next"
                className={INPUT_CLASS}
                onFocus={scrollFieldIntoView}
                {...register("phone")}
              />
            </InputField>

            <InputField label="Email" error={errors.email?.message}>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                enterKeyHint="next"
                className={INPUT_CLASS}
                onFocus={scrollFieldIntoView}
                {...register("email")}
              />
            </InputField>

            <InputField label="Резюме" error={errors.resume?.message}>
              <input
                type="text"
                enterKeyHint="next"
                className={INPUT_CLASS}
                onFocus={scrollFieldIntoView}
                {...register("resume")}
              />
            </InputField>

            <InputField label="Комментарий" error={errors.message?.message}>
              <textarea
                rows={2}
                enterKeyHint="done"
                className={cn(INPUT_CLASS, "min-h-[72px] resize-y")}
                onFocus={scrollFieldIntoView}
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
                    className="relative z-10 mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--accent)]"
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

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-95 disabled:cursor-wait disabled:opacity-60"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} aria-hidden />
                  Отправка…
                </>
              ) : (
                "Отправить"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
