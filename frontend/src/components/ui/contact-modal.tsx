"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle } from "lucide-react";
import { useModal } from "@/lib/modal-context";
import { useContactConfig } from "@/lib/contact-config-context";
import { useSmartCaptchaToken } from "@/components/smartcaptcha-provider";
import { BackNavButton } from "@/components/ui/back-nav";
import { HouseConstructionCalculatorForm } from "@/components/construction/house-construction-calculator-form";

type Step = "form-calculator" | "success";

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

export function ContactModal() {
  const { isOpen, closeModal } = useModal();
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
      {step === "success" && <SuccessScreen onClose={handleClose} />}
    </div>
  );
}
