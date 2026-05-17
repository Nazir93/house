import type { ClientNotificationType, Prisma } from "@prisma/client";

export type ClientNotificationCreateInput = {
  type: ClientNotificationType;
  title: string;
  body: string;
  payload?: Prisma.InputJsonValue;
};

/**
 * Создаёт уведомления в кабинете. Вызывать только из publishClientProjectToCabinet,
 * не при сохранении черновика в админке. В перспективе — SMS / мессенджер.
 */
export async function createClientNotifications(
  db: Prisma.TransactionClient | typeof import("@/lib/db").prisma,
  projectId: string,
  items: ClientNotificationCreateInput[]
): Promise<void> {
  if (items.length === 0) return;

  await db.clientNotification.createMany({
    data: items.map((item) => ({
      projectId,
      type: item.type,
      title: item.title,
      body: item.body,
      payload: item.payload ?? undefined,
    })),
  });

  await dispatchClientNotificationChannels(projectId, items);
}

/** Заглушка для будущих каналов (SMS, Telegram клиенту и т.д.). */
async function dispatchClientNotificationChannels(
  _projectId: string,
  _items: ClientNotificationCreateInput[]
): Promise<void> {
  // intentionally empty — in-app only for now
}

export async function countUnreadClientNotifications(projectId: string): Promise<number> {
  const { prisma } = await import("@/lib/db");
  return prisma.clientNotification.count({
    where: { projectId, readAt: null },
  });
}

export async function markClientNotificationsRead(
  projectId: string,
  ids?: string[]
): Promise<void> {
  const { prisma } = await import("@/lib/db");
  await prisma.clientNotification.updateMany({
    where: {
      projectId,
      readAt: null,
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    data: { readAt: new Date() },
  });
}
