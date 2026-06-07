"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const POLL_MS = 10_000;

/** Опрос чатов ЛК, где клиент ждёт ответа. */
export function useAdminPendingTicketsNotify() {
  const pathname = usePathname();
  const prevCountRef = useRef<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [pulse, setPulse] = useState(false);

  const onTicketsSection = pathname.startsWith("/admin/tickets");

  const fetchCount = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/tickets/pending-count", { cache: "no-store" });
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
            new Notification("Сообщение от клиента", {
              body:
                delta === 1
                  ? "Новое сообщение в личном кабинете — откройте «Чат с клиентами»"
                  : `${delta} обращений ждут ответа`,
              icon: "/icon.png",
              tag: "admin-client-ticket",
            });
          } catch {
            /* */
          }
        }
      }

      prevCountRef.current = safe;
      setPendingCount(safe);
    } catch {
      /* сеть */
    }
  }, []);

  useEffect(() => {
    if (onTicketsSection) setPulse(false);
  }, [onTicketsSection]);

  useEffect(() => {
    void fetchCount();
    const id = setInterval(() => void fetchCount(), POLL_MS);
    return () => clearInterval(id);
  }, [fetchCount]);

  const highlight = pendingCount > 0 && (pulse || !onTicketsSection);

  return { pendingCount, highlight, pulse };
}
