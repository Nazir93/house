"use client";

import type { ReactNode, SelectHTMLAttributes } from "react";

const base =
  "w-full px-4 py-2.5 rounded-xl border border-white/[0.08] text-sm text-white " +
  "bg-white/[0.05] focus:outline-none focus:border-[#0F3D2E]/50 transition-colors " +
  "[color-scheme:dark]";

type AdminNativeSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/** Нативный select в едином стиле админки; color-scheme тёмный — список ближе к интерфейсу. */
export function AdminNativeSelect({ className = "", children, ...rest }: AdminNativeSelectProps) {
  return (
    <select {...rest} className={`${base} ${className}`.trim()}>
      {children}
    </select>
  );
}

export function AdminSelectOption({ value, children }: { value: string; children: ReactNode }) {
  return (
    <option value={value} className="bg-[#141414] text-white">
      {children}
    </option>
  );
}
