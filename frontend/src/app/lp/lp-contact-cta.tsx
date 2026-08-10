"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import type { EstimateModalPayload } from "@/lib/modal-context";
import { useModal } from "@/lib/modal-context";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  style?: ButtonHTMLAttributes<HTMLButtonElement>["style"];
  /** Метка источника заявки в CRM / админке */
  source: string;
  service?: string;
  calcData?: EstimateModalPayload["calcData"];
};

/** CTA LP: сразу модалка контактов/перезвона, без перехода в квиз. */
export function LpContactCta({ children, className, style, source, service, calcData }: Props) {
  const { openModalToEstimate } = useModal();

  return (
    <button
      type="button"
      className={cn(className)}
      style={style}
      onClick={() => openModalToEstimate({ source, service, calcData })}
    >
      {children}
    </button>
  );
}

export { lpProjectCardLeadMeta, lpServiceLabel } from "@/lib/lp-contact-cta";
