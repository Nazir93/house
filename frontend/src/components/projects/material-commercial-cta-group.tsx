"use client";

import Link from "next/link";

import type { MaterialCommercialCta } from "@/lib/seo/project-material-commercial";
import { useModal } from "@/lib/modal-context";
import { cn } from "@/lib/utils";

export function MaterialCommercialCtaGroup({
  ctas,
  className,
}: {
  ctas: MaterialCommercialCta[];
  className?: string;
}) {
  const { openModalToEstimate } = useModal();

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {ctas.map((cta) => {
        if (cta.id === "estimate" && cta.action === "estimate") {
          return (
            <button
              key={cta.id}
              type="button"
              onClick={() =>
                openModalToEstimate({ source: "material-gazobeton-estimate", service: "gazobeton" })
              }
              className="whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold transition hover:opacity-95"
              style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
            >
              {cta.label}
            </button>
          );
        }

        if (!("href" in cta)) return null;

        return (
          <Link
            key={cta.id}
            href={cta.href}
            className={cn(
              "whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold transition",
              cta.primary
                ? "border border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] text-[var(--text)] hover:border-[var(--accent)]"
                : "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]",
            )}
          >
            {cta.label}
          </Link>
        );
      })}
    </div>
  );
}
