"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { shouldAnimatePageTransition } from "@/lib/page-transition";

/** Плавное появление только при клиентской навигации — без opacity:0 на первом paint. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    const shouldAnimate = shouldAnimatePageTransition({
      hasHydrated,
      pathname,
      previousPathname: previousPathname.current,
    });
    previousPathname.current = pathname;
    if (!shouldAnimate) {
      setAnimate(false);
      return;
    }
    setAnimate(true);
    const id = window.setTimeout(() => setAnimate(false), 420);
    return () => window.clearTimeout(id);
  }, [hasHydrated, pathname]);

  return <div className={animate ? "page-content-ready" : undefined}>{children}</div>;
}
