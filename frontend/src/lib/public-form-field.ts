import type { CSSProperties } from "react";

/** Поля публичных форм (как на «О нас», калькуляторе, вход в ЛК). */
export const publicFormFieldClass =
  "funnel-text-input w-full !rounded-[1rem] border px-4 py-3.5 text-[15px] leading-snug outline-none transition-[box-shadow] placeholder:text-[var(--text-subtle)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]";

export const publicFormFieldStyle = {
  borderColor: "var(--border)",
  backgroundColor: "var(--card-bg)",
  color: "var(--text)",
} satisfies CSSProperties;
