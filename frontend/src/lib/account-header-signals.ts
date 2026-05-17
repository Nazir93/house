import { cache } from "react";
import { prisma } from "@/lib/db";

export type AccountHeaderSignals = {
  /** Сумма напоминаний: непрочитанные уведомления + платежи в горизонте + обращения */
  attentionCount: number;
  /** Непрочитанные уведомления в кабинете (п. 7 ТЗ) */
  notificationsUnread: number;
  /** Платежи с датой: просроченные и ближайшие 14 дней (статус ожидается / не выставлен) */
  paymentsDue: number;
  /** Обращения в работе (не закрыты) */
  ticketsActive: number;
};

/**
 * Счётчики для шапки ЛК и дашборда. Один запрос на рендер благодаря `cache` (layout + page).
 */
export const getAccountHeaderSignals = cache(
  async (projectId: string): Promise<AccountHeaderSignals> => {
    const horizon = new Date();
    horizon.setDate(horizon.getDate() + 14);

    const [paymentsDue, ticketsActive, notificationsUnread] = await Promise.all([
      prisma.clientPayment.count({
        where: {
          projectId,
          status: { in: ["EXPECTED", "NOT_ISSUED"] },
          dueDate: { not: null, lte: horizon },
        },
      }),
      prisma.clientSupportTicket.count({
        where: {
          projectId,
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
      }),
      prisma.clientNotification.count({
        where: { projectId, readAt: null },
      }),
    ]);

    return {
      paymentsDue,
      ticketsActive,
      notificationsUnread,
      attentionCount: notificationsUnread + paymentsDue + ticketsActive,
    };
  }
);
