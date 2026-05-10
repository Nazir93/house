import { cache } from "react";
import { prisma } from "@/lib/db";

export type AccountHeaderSignals = {
  /** Сумма напоминаний: платежи в горизонте + открытые обращения */
  attentionCount: number;
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

    const [paymentsDue, ticketsActive] = await Promise.all([
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
    ]);

    return {
      paymentsDue,
      ticketsActive,
      attentionCount: paymentsDue + ticketsActive,
    };
  }
);
