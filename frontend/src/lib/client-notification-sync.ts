import type { ClientPaymentStatus, ClientStageStatus } from "@prisma/client";
import type { AdminStagePayload } from "@/lib/client-project-stages-persist";
import { normalizeAdminStagesPayload } from "@/lib/client-project-stages-persist";
import {
  buildDocumentNewNotification,
  buildPaymentExpectedNotification,
  buildPhotoNewNotification,
  buildStageStatusNotification,
} from "@/lib/client-notification-messages";

export function paymentMatchKey(order: number, label: string): string {
  return `${order}::${label.trim().toLowerCase()}`;
}

type OldPayment = {
  order: number;
  label: string;
  status: ClientPaymentStatus;
};

type NewPayment = OldPayment & {
  amountKopeks: number;
  dueDate: Date | null;
};

/** Платёж стал «Ожидает оплаты» (новый или смена статуса). */
export function detectPaymentExpectedNotifications(
  oldPayments: OldPayment[],
  newPayments: NewPayment[]
): ReturnType<typeof buildPaymentExpectedNotification>[] {
  const oldByKey = new Map(oldPayments.map((p) => [paymentMatchKey(p.order, p.label), p]));

  const out: ReturnType<typeof buildPaymentExpectedNotification>[] = [];
  for (const p of newPayments) {
    if (p.status !== "EXPECTED") continue;
    const key = paymentMatchKey(p.order, p.label);
    const prev = oldByKey.get(key);
    if (prev?.status === "EXPECTED") continue;
    out.push(
      buildPaymentExpectedNotification({
        label: p.label,
        amountKopeks: p.amountKopeks,
        dueDate: p.dueDate,
      })
    );
  }
  return out;
}

type OldStage = {
  id: string;
  title: string;
  status: ClientStageStatus;
};

/** Уведомление по этапу/подэтапу, у которого изменился собственный статус. */
export type PublishNotificationSpec =
  | ReturnType<typeof buildPaymentExpectedNotification>
  | ReturnType<typeof buildStageStatusNotification>
  | ReturnType<typeof buildDocumentNewNotification>
  | ReturnType<typeof buildPhotoNewNotification>;

type PublishedDocumentRef = { url: string; filename: string };
type PublishedPhotoRef = { url: string; caption: string | null };

export function documentMatchKey(doc: { url: string }): string {
  return doc.url;
}

/** Уведомление о документах, появившихся в кабинете после публикации. */
export function detectNewDocumentNotifications(
  oldDocuments: PublishedDocumentRef[],
  newDocuments: PublishedDocumentRef[]
): ReturnType<typeof buildDocumentNewNotification>[] {
  const oldUrls = new Set(oldDocuments.map((d) => documentMatchKey(d)));
  return newDocuments
    .filter((d) => !oldUrls.has(documentMatchKey(d)))
    .map((d) => buildDocumentNewNotification({ filename: d.filename }));
}

export function photoMatchKey(photo: { url: string }): string {
  return photo.url;
}

/** Уведомление о фотоотчётах, появившихся в кабинете после публикации. */
export function detectNewPhotoNotifications(
  oldPhotos: PublishedPhotoRef[],
  newPhotos: PublishedPhotoRef[]
): ReturnType<typeof buildPhotoNewNotification>[] {
  const oldUrls = new Set(oldPhotos.map((p) => photoMatchKey(p)));
  return newPhotos
    .filter((p) => !oldUrls.has(photoMatchKey(p)))
    .map((p) => buildPhotoNewNotification({ caption: p.caption }));
}

/**
 * Уведомления только при публикации в ЛК: сравниваем опубликованное «до» с тем, что выгружаем.
 * При сохранении черновика в админке не вызывать.
 */
export function collectNotificationsForPublish(input: {
  oldPayments: OldPayment[];
  newPayments?: NewPayment[];
  oldStages: OldStage[];
  draftStages?: AdminStagePayload[];
  oldDocuments?: PublishedDocumentRef[];
  newDocuments?: PublishedDocumentRef[];
  oldPhotos?: PublishedPhotoRef[];
  newPhotos?: PublishedPhotoRef[];
}): PublishNotificationSpec[] {
  const specs: PublishNotificationSpec[] = [];

  if (input.draftStages) {
    specs.push(...detectStageStatusNotifications(input.oldStages, input.draftStages));
  }

  if (input.newPayments) {
    specs.push(...detectPaymentExpectedNotifications(input.oldPayments, input.newPayments));
  }

  if (input.newDocuments) {
    specs.push(
      ...detectNewDocumentNotifications(input.oldDocuments ?? [], input.newDocuments)
    );
  }

  if (input.newPhotos) {
    specs.push(...detectNewPhotoNotifications(input.oldPhotos ?? [], input.newPhotos));
  }

  return specs;
}

export function detectStageStatusNotifications(
  oldStages: OldStage[],
  incomingRaw: AdminStagePayload[]
): ReturnType<typeof buildStageStatusNotification>[] {
  const { stages: incoming } = normalizeAdminStagesPayload(incomingRaw);
  const oldById = new Map(oldStages.map((s) => [s.id, s]));

  const out: ReturnType<typeof buildStageStatusNotification>[] = [];
  for (const stage of incoming) {
    const prev = oldById.get(stage.clientKey);
    const nextStatus = stage.status;
    if (nextStatus !== "IN_PROGRESS" && nextStatus !== "DONE") continue;
    if (prev?.status === nextStatus) continue;
    out.push(buildStageStatusNotification({ title: stage.title, status: nextStatus }));
  }
  return out;
}
