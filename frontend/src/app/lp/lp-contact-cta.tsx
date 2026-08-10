"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import type { EstimateModalPayload } from "@/lib/modal-context";
import { useModal } from "@/lib/modal-context";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  style?: ButtonHTMLAttributes<HTMLButtonElement>["style"];
  "aria-label"?: string;
  /** Метка источника заявки в CRM / админке */
  source: string;
  service?: string;
  calcData?: EstimateModalPayload["calcData"];
};

/** CTA LP: сразу модалка контактов/перезвона, без перехода в квиз. */
export function LpContactCta({
  children,
  className,
  style,
  source,
  service,
  calcData,
  "aria-label": ariaLabel,
}: Props) {
  const { openModalToEstimate } = useModal();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn("relative z-10 cursor-pointer touch-manipulation", className)}
      style={style}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        openModalToEstimate({ source, service, calcData });
      }}
    >
      {children}
    </button>
  );
}

export { lpProjectCardLeadMeta, lpServiceLabel } from "@/lib/lp-contact-cta";
