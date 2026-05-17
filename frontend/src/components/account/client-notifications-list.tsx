"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CreditCard, FileText, Images, ListOrdered, ChevronRight } from "lucide-react";
import { formatDateRu } from "@/lib/client-portal-labels";
import {
  clientNotificationReadLabel,
  clientNotificationTargetHref,
  isClientNotificationUnread,
} from "@/lib/client-notification-routes";
import type { ClientNotificationType } from "@prisma/client";

export type ClientNotificationItem = {
  id: string;
  type: ClientNotificationType;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

function typeIcon(type: ClientNotificationType) {
  switch (type) {
    case "PAYMENT_EXPECTED":
      return CreditCard;
    case "DOCUMENT_NEW":
      return FileText;
    case "PHOTO_NEW":
      return Images;
    case "STAGE_IN_PROGRESS":
    case "STAGE_DONE":
      return ListOrdered;
    default:
      return Bell;
  }
}

export function ClientNotificationsList({
  initialItems,
  initialUnread,
}: {
  initialItems: ClientNotificationItem[];
  initialUnread: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [unread, setUnread] = useState(initialUnread);
  const [busy, setBusy] = useState(false);

  const markRead = useCallback(
    async (ids?: string[]) => {
      setBusy(true);
      try {
        const res = await fetch("/api/client/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ids?.length ? { ids } : {}),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return;
        const now = new Date().toISOString();
        setItems((prev) =>
          prev.map((n) =>
            ids?.length
              ? ids.includes(n.id)
                ? { ...n, readAt: n.readAt ?? now }
                : n
              : { ...n, readAt: n.readAt ?? now }
          )
        );
        setUnread(data.unreadCount ?? 0);
        router.refresh();
      } finally {
        setBusy(false);
      }
    },
    [router]
  );

  async function openNotification(n: ClientNotificationItem) {
    if (isClientNotificationUnread(n.readAt)) {
      await markRead([n.id]);
    }
    router.push(clientNotificationTargetHref(n.type));
  }

  if (items.length === 0) {
    return <p className="text-sm py-8 text-center opacity-60">—</p>;
  }

  return (
    <div className="space-y-4">
      {unread > 0 ? (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => markRead()}
            className="inline-flex items-center gap-2 text-sm font-medium disabled:opacity-50"
            style={{ color: "var(--accent)" }}
          >
            <CheckCheck className="h-4 w-4" aria-hidden />
            Прочитать все
          </button>
        </div>
      ) : null}

      <ul className="space-y-2 list-none p-0 m-0">
        {items.map((n) => {
          const isUnread = isClientNotificationUnread(n.readAt);
          const Icon = typeIcon(n.type);

          return (
            <li key={n.id}>
              <article
                className="rounded-2xl border overflow-hidden transition"
                style={{
                  borderColor: isUnread
                    ? "color-mix(in srgb, var(--accent) 35%, var(--border))"
                    : "var(--border)",
                  backgroundColor: isUnread
                    ? "color-mix(in srgb, var(--accent) 6%, var(--card-bg))"
                    : "var(--card-bg)",
                  opacity: isUnread ? 1 : 0.92,
                }}
              >
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void openNotification(n)}
                  className="flex w-full min-w-0 text-left p-4 sm:p-5 gap-3 items-center disabled:opacity-70"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                      color: "var(--accent)",
                    }}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                      <h2 className="font-heading text-base font-bold">{n.title}</h2>
                      <span
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isUnread
                            ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                            : "color-mix(in srgb, var(--text) 6%, transparent)",
                          color: isUnread ? "var(--accent)" : "var(--text-muted)",
                        }}
                      >
                        {clientNotificationReadLabel(n.readAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs tabular-nums opacity-70">{formatDateRu(n.createdAt)}</p>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 opacity-40" aria-hidden />
                </button>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
