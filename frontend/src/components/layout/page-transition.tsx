"use client";

import { usePathname } from "next/navigation";

/** Плавное появление контента после скелетона (без резкого «перескока»). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-content-ready">
      {children}
    </div>
  );
}
