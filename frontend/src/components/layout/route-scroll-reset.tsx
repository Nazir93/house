"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** После смены маршрута сбрасываем скролл (и нативный, и Lenis), иначе возможен «клин» с предыдущей позицией. */
export function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    const run = () => {
      window.scrollTo(0, 0);
      try {
        window.__lenis?.scrollTo(0, { immediate: true });
      } catch {
        /* */
      }
    };
    run();
    const id = requestAnimationFrame(run);
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
