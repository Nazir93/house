"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { X, CheckCircle } from "lucide-react";
import { useModal } from "@/lib/modal-context";
import { useContactConfig } from "@/lib/contact-config-context";
import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";
import { BackNavButton } from "@/components/ui/back-nav";
import { HouseConstructionCalculatorForm } from "@/components/construction/house-construction-calculator-form";
import { collectCurrentTrafficParams, trackLeadSuccess } from "@/lib/analytics-goals";

type Step = "form-calculator" | "success";

function SuccessScreen({ onClose }: { onClose: () => void }) {
  const contact = useContactConfig();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <CheckCircle size={56} style={{ color: "var(--accent)" }} className="mb-8" />
      <h2 className="mb-6 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
        Заявка отправлена
      </h2>
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

function ProjectEstimateLeadForm({
  onSuccess,
  getRecaptchaToken,
}: {
  onSuccess: () => void;
  getRecaptchaToken: ((action?: string) => Promise<string>) | null;
}) {
  const { estimatePayload } = useModal();
  const contact = useContactConfig();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const recaptchaToken = getRecaptchaToken ? await getRecaptchaToken("submit") : "";
      const source = estimatePayload?.source ?? "project-calculator";
      const trafficParams = collectCurrentTrafficParams();
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          service: estimatePayload?.service ?? "Детальная смета проекта",
          source,
          pageUrl: window.location.href,
          recaptchaToken: recaptchaToken || undefined,
          ...trafficParams,
          calcData: estimatePayload?.calcData ?? null,
        }),
      });

      if (response.ok) {
        trackLeadSuccess(source, { pageUrl: window.location.href });
        onSuccess();
        return;
      }

      const data = await response.json().catch(() => null);
      setStatus(data?.error || "Не удалось отправить заявку.");
    } catch {
      setStatus(`Нет связи с сервером. Позвоните нам: ${contact.phone}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center px-4 py-20">
      <div className="mx-auto w-full max-w-xl rounded-[28px] bg-[var(--bg-secondary)] p-6 md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Детальная смета
        </p>
        <h2 className="mt-3 font-heading text-3xl leading-tight text-[var(--graphite)]">
          Оставьте контакты
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
          Выбранные материалы, инженерия, доп. опции и сумма уже прикреплены к заявке.
        </p>

        <form onSubmit={submit} className="mt-7 grid gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ваше имя"
            className="rounded-2xl border bg-[var(--bg)] px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
            autoComplete="name"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="Телефон"
            className="rounded-2xl border bg-[var(--bg)] px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
            autoComplete="tel"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[var(--accent)] px-5 py-4 text-sm font-bold text-[var(--accent-contrast)] transition hover:bg-[var(--accent-hover)] disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "Отправляем..." : "Отправить заявку"}
          </button>
          {status ? <p className="text-sm text-[var(--text-muted)]">{status}</p> : null}
        </form>
      </div>
    </div>
  );
}

export function ContactModal() {
  const { isOpen, closeModal, estimatePayload } = useModal();
  const [step, setStep] = useState<Step>("form-calculator");
  const getSmartCaptchaToken = useSmartCaptchaToken();

  const handleClose = useCallback(() => {
    setStep("form-calculator");
    closeModal();
  }, [closeModal]);

  useEffect(() => {
    if (isOpen) {
      setStep("form-calculator");
      window.__lenis?.stop();
    } else {
      window.__lenis?.start();
    }
    return () => {
      window.__lenis?.start();
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ориентировочный расчёт стоимости"
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain safe-bottom"
      style={{ backgroundColor: "var(--bg)", WebkitOverflowScrolling: "touch" }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleClose}
        className="fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] md:top-6 md:right-6 z-[110] min-w-[44px] min-h-[44px] w-12 h-12 flex items-center justify-center transition-colors duration-200 touch-manipulation"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)";
        }}
        aria-label="Закрыть"
      >
        <X size={28} />
      </button>

      {step === "form-calculator" && (
        <>
          {estimatePayload ? (
            <ProjectEstimateLeadForm
              onSuccess={() => setStep("success")}
              getRecaptchaToken={getSmartCaptchaToken}
            />
          ) : (
            <>
              <BackNavButton
                className="fixed top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-[110] md:top-6 md:left-6 touch-manipulation"
                onClick={handleClose}
              />
              <HouseConstructionCalculatorForm
                onSuccess={() => setStep("success")}
                getRecaptchaToken={getSmartCaptchaToken}
              />
            </>
          )}
        </>
      )}
      {step === "success" && <SuccessScreen onClose={handleClose} />}
    </div>
  );
}
