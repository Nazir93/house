import type { ClientPaymentStatus } from "@prisma/client";

export type ClientPaymentScheduleItem = {
  id: string;
  label: string;
  amountKopeks: number;
  dueDate: Date | null;
  status: ClientPaymentStatus;
  paidAt: Date | null;
  order: number;
};

const UNPAID: ClientPaymentStatus[] = ["EXPECTED", "NOT_ISSUED"];

export function isUnpaidPayment(status: ClientPaymentStatus): boolean {
  return UNPAID.includes(status);
}

/** Ближайший неоплаченный платёж (п. 10 ТЗ). */
export function pickNextUnpaidPayment(
  payments: ClientPaymentScheduleItem[]
): ClientPaymentScheduleItem | null {
  const open = payments.filter((p) => isUnpaidPayment(p.status));
  if (open.length === 0) return null;

  const withDue = open
    .filter((p) => p.dueDate)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime());
  if (withDue.length > 0) return withDue[0]!;

  return [...open].sort((a, b) => a.order - b.order)[0] ?? null;
}

function sortPaymentsSchedule(payments: ClientPaymentScheduleItem[]): ClientPaymentScheduleItem[] {
  return [...payments].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    const ad = a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bd = b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return ad - bd;
  });
}

/** Первые N строк графика для главной (п. 10 ТЗ). */
export function pickDashboardPaymentPreview(
  payments: ClientPaymentScheduleItem[],
  limit = 2
): ClientPaymentScheduleItem[] {
  return sortPaymentsSchedule(payments).slice(0, limit);
}
