"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { shouldSendSpaMetrikaHit, trackMetrikaHit } from "@/lib/analytics-goals";
import { captureFirstTouchTrafficInSession } from "@/lib/analytics-traffic";

/**
 * Виртуальные просмотры при клиентской навигации Next.js.
 * Первый hit пропускаем — его даёт ym(...,"init") в SSR-сниппете.
 * Заодно фиксируем first-touch UTM на каждом заходе в приложение.
 */
export function MetrikaSpaHit() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);
  const prevUrl = useRef<string>("");

  useEffect(() => {
    captureFirstTouchTrafficInSession();
  }, []);

  useEffect(() => {
    const search = searchParams?.toString();
    const url = `${pathname}${search ? `?${search}` : ""}`;
    if (isFirst.current) {
      isFirst.current = false;
      prevUrl.current = url;
      return;
    }
    if (!shouldSendSpaMetrikaHit(false)) return;
    const referer = prevUrl.current
      ? `${window.location.origin}${prevUrl.current}`
      : document.referrer || undefined;
    trackMetrikaHit(`${window.location.origin}${url}`, {
      title: document.title,
      referer,
    });
    prevUrl.current = url;
  }, [pathname, searchParams]);

  return null;
}
