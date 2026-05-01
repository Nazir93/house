"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

const POLL_MS = 18_000;

/**
 * Опрос количества заявок со статусом NEW; при росте — подсветка и бейдж.
 * На странице /admin/leads считаем «просмотрено» и сбрасываем.
 */
export function useAdminNewLeadsNotify() {
  const pathname = usePathname();
  const baselineRef = useRef<number | null>(null);
  const [highlight, setHighlight] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  const syncBaselineFromServer = useCallback(() => {
    return fetch("/api/admin/leads/new-count")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { count?: number } | null) => {
        if (d && typeof d.count === "number") baselineRef.current = d.count;
      })
      .catch(() => {});
  }, []);

  const acknowledge = useCallback(() => {
    setHighlight(false);
    setBadgeCount(0);
    void syncBaselineFromServer();
  }, [syncBaselineFromServer]);

  useEffect(() => {
    if (pathname.startsWith("/admin/leads")) {
      acknowledge();
    }
  }, [pathname, acknowledge]);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const r = await fetch("/api/admin/leads/new-count");
        if (!r.ok || cancelled) return;
        const { count } = (await r.json()) as { count: number };
        if (baselineRef.current === null) {
          baselineRef.current = count;
          return;
        }
        if (count > baselineRef.current) {
          const delta = count - baselineRef.current;
          baselineRef.current = count;
          setBadgeCount((b) => b + delta);
          setHighlight(true);
          if (typeof window !== "undefined" && document.hidden && Notification.permission === "granted") {
            try {
              new Notification("Новая заявка", {
                body:
                  delta === 1
                    ? "Поступила новая заявка — откройте раздел «Заявки»"
                    : `Поступило ${delta} новых заявок`,
                icon: "/icon.png",
                tag: "admin-new-lead",
              });
            } catch {
              /* */
            }
          }
        } else if (count < baselineRef.current) {
          baselineRef.current = count;
        }
      } catch {
        /* сеть */
      }
    };

    void tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { highlight, badgeCount };
}
