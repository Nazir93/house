"use client";

/**
 * Раньше здесь был fade с opacity:0 при каждом pathname — из‑за этого при переходах
 * мигал пустой кадр и казалось, что «сначала главная, потом страница». Контент без лишней анимации.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
