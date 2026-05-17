import type { ClientNotificationType, ClientPaymentStatus, ClientStageStatus } from "@prisma/client";
import { formatRub } from "@/lib/construction-shared";
import { formatDateRu, kopeksToRubles, paymentStatusLabel } from "@/lib/client-portal-labels";

export type PaymentNotificationPayload = {
  kind: "payment";
  label: string;
  amountKopeks: number;
  dueDate: string | null;
  status: ClientPaymentStatus;
};

export type StageNotificationPayload = {
  kind: "stage";
  stageTitle: string;
  status: ClientStageStatus;
};

export type DocumentNotificationPayload = {
  kind: "document";
  filename: string;
  /** manual — подписание в офисе; es — электронная подпись (когда подключена) */
  signingMode: "manual" | "es";
};

export type PhotoNotificationPayload = {
  kind: "photo";
  caption: string | null;
};

/** Заголовок уведомления о новом документе в ЛК. */
export const DOCUMENT_NEW_NOTIFICATION_TITLE =
  "Вам доступен новый документ для ознакомления и подписания";

/** Текст при ручном подписании в офисе (п. 4 ТЗ). */
export function documentNewNotificationBodyManual(filename: string): string {
  return `Вам доступен документ: ${filename}. Пожалуйста, скачайте документ, ознакомьтесь с ним и подпишите его в офисе.`;
}

/** Текст после подключения электронной подписи (п. 4 ТЗ). */
export function documentNewNotificationBodyElectronic(filename: string): string {
  return `Вам доступен документ: ${filename}. Пожалуйста, ознакомьтесь с документом и подпишите его электронной подписью, если согласны с содержанием.`;
}

export function buildPaymentExpectedNotification(input: {
  label: string;
  amountKopeks: number;
  dueDate: Date | null;
}): { type: ClientNotificationType; title: string; body: string; payload: PaymentNotificationPayload } {
  const amount = formatRub(kopeksToRubles(input.amountKopeks));
  const date = formatDateRu(input.dueDate);
  const statusLabel = paymentStatusLabel("EXPECTED");

  return {
    type: "PAYMENT_EXPECTED",
    title: "Новый платёж",
    body: `Платёж «${input.label}» на сумму ${amount}${input.dueDate ? `, срок ${date}` : ""}. Статус: ${statusLabel}.`,
    payload: {
      kind: "payment",
      label: input.label,
      amountKopeks: input.amountKopeks,
      dueDate: input.dueDate?.toISOString() ?? null,
      status: "EXPECTED",
    },
  };
}

export function buildStageStatusNotification(input: {
  title: string;
  status: "IN_PROGRESS" | "DONE";
}): {
  type: ClientNotificationType;
  title: string;
  body: string;
  payload: StageNotificationPayload;
} {
  if (input.status === "IN_PROGRESS") {
    return {
      type: "STAGE_IN_PROGRESS",
      title: "Этап в работе",
      body: `Этап «${input.title}» начат и находится в работе.`,
      payload: { kind: "stage", stageTitle: input.title, status: "IN_PROGRESS" },
    };
  }

  return {
    type: "STAGE_DONE",
    title: "Этап завершён",
    body: `Этап «${input.title}» завершён и передан вам.`,
    payload: { kind: "stage", stageTitle: input.title, status: "DONE" },
  };
}

export const PHOTO_NEW_NOTIFICATION_TITLE = "Новый фотоотчёт на объекте";

export function photoNewNotificationBody(caption: string | null | undefined): string {
  const label = caption?.trim();
  if (label) {
    return `Добавлен фотоотчёт: ${label}. Посмотрите снимки в разделе «Фотоотчёты».`;
  }
  return "Добавлен новый фотоотчёт. Посмотрите снимки в разделе «Фотоотчёты».";
}

export function buildPhotoNewNotification(input: {
  caption?: string | null;
}): {
  type: ClientNotificationType;
  title: string;
  body: string;
  payload: PhotoNotificationPayload;
} {
  const caption = input.caption?.trim() || null;
  return {
    type: "PHOTO_NEW",
    title: PHOTO_NEW_NOTIFICATION_TITLE,
    body: photoNewNotificationBody(caption),
    payload: { kind: "photo", caption },
  };
}

export function buildDocumentNewNotification(input: {
  filename: string;
  /** По умолчанию manual; es — когда в проекте включена ЭП */
  electronicSign?: boolean;
}): {
  type: ClientNotificationType;
  title: string;
  body: string;
  payload: DocumentNotificationPayload;
} {
  const signingMode = input.electronicSign ? "es" : "manual";
  const body =
    signingMode === "es"
      ? documentNewNotificationBodyElectronic(input.filename)
      : documentNewNotificationBodyManual(input.filename);

  return {
    type: "DOCUMENT_NEW",
    title: DOCUMENT_NEW_NOTIFICATION_TITLE,
    body,
    payload: { kind: "document", filename: input.filename, signingMode },
  };
}
