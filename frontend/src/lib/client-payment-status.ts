import type { ClientPaymentStatus } from "@prisma/client";

/** Статусы платежа в админке (п. 8 ТЗ). */
export const CLIENT_PAYMENT_STATUS_OPTIONS: { value: ClientPaymentStatus; label: string }[] = [
  { value: "NOT_ISSUED", label: "Не выставлен" },
  { value: "EXPECTED", label: "Ожидает оплаты" },
  { value: "PAID", label: "Оплачен" },
];
