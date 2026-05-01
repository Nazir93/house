"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

type AdminFormSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/** Всегда раскрытый блок с заголовком (основные поля формы). */
export function AdminFormSection({ title, subtitle, children }: AdminFormSectionProps) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <h2 className="text-sm font-semibold text-white/90 tracking-tight">{title}</h2>
        {subtitle ? <p className="text-[11px] text-white/35 mt-1.5 leading-relaxed">{subtitle}</p> : null}
      </div>
      <div className="px-5 pb-5 space-y-4">{children}</div>
    </div>
  );
}

type AdminFormCollapsibleProps = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/** Свернуть редкие поля (доп. блоки страницы). */
export function AdminFormCollapsible({ title, subtitle, defaultOpen = false, children }: AdminFormCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      className="rounded-2xl bg-white/[0.03] border border-white/[0.08] group"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 text-sm font-semibold text-white/80 hover:text-white/95 transition-colors">
        <span>
          {title}
          {subtitle ? <span className="block text-[11px] font-normal text-white/35 mt-1">{subtitle}</span> : null}
        </span>
        <ChevronDown size={18} className="shrink-0 text-white/40 group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-5 pb-5 pt-0 space-y-4 border-t border-white/[0.06]">{children}</div>
    </details>
  );
}
