"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { PWA_ICON_PATHS } from "@/lib/pwa-config";

const POLL_MS = 12_000;

/**
 * Опрос количества заявок со статусом NEW.
 * Красный бейдж — пока есть необработанные; пульс — при росте счётчика.
 * На странице /admin/leads пульс гаснет, бейдж остаётся до смены статусов.
 */
export function useAdminNewLeadsNotify() {
  const pathname = usePathname();
  const prevCountRef = useRef<number | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [pulse, setPulse] = useState(false);

  const onLeadsSection = pathname.startsWith("/admin/leads");

  const fetchCount = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/leads/new-count", { cache: "no-store" });
      if (!r.ok) return;
      const { count } = (await r.json()) as { count: number };
      const safe = typeof count === "number" && count >= 0 ? count : 0;

      if (prevCountRef.current !== null && safe > prevCountRef.current) {
        const delta = safe - prevCountRef.current;
        setPulse(true);
        if (
          typeof window !== "undefined" &&
          document.hidden &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification("Новая заявка", {
              body:
                delta === 1
                  ? "Поступила новая заявка — откройте раздел «Заявки»"
                  : `Поступило ${delta} новых заявок`,
              icon: PWA_ICON_PATHS.png32,
              tag: "admin-new-lead",
            });
          } catch {
            /* */
          }
        }
      }

      prevCountRef.current = safe;
      setNewCount(safe);
    } catch {
      /* сеть */
    }
  }, []);

  useEffect(() => {
    if (onLeadsSection) setPulse(false);
  }, [onLeadsSection]);

  useEffect(() => {
    void fetchCount();
    const id = setInterval(() => void fetchCount(), POLL_MS);
    return () => clearInterval(id);
  }, [fetchCount]);

  const highlight = newCount > 0 && (pulse || !onLeadsSection);

  return { newCount, highlight, pulse };
}
