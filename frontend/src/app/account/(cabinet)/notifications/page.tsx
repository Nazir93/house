import { redirect } from "next/navigation";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { listClientNotificationsForCabinet } from "@/lib/client-notifications-query";
import { ClientNotificationsList } from "@/components/account/client-notifications-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Уведомления — личный кабинет",
  robots: { index: false, follow: true },
};

export default async function AccountNotificationsPage() {
  const projectId = await getClientProjectIdFromSession();
  if (!projectId) redirect("/account/login");

  const { items, unreadCount } = await listClientNotificationsForCabinet(projectId);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold">Уведомления</h1>

      <section
        className="rounded-2xl border p-4 sm:p-6"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
      >
        <ClientNotificationsList
          initialItems={items.map((n) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            readAt: n.readAt?.toISOString() ?? null,
            createdAt: n.createdAt.toISOString(),
          }))}
          initialUnread={unreadCount}
        />
      </section>
    </div>
  );
}
