import type { ClientPaymentStatus, ClientStageStatus } from "@prisma/client";
import type { AdminStagePayload } from "@/lib/client-project-stages-persist";
import {
  normalizeAdminStagesPayload,
  type NormalizedAdminStage,
} from "@/lib/client-project-stages-persist";
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

/** Этап в опубликованном ЛК (до публикации черновика). */
export type PublishOldStage = {
  id: string;
  parentId: string | null;
  order: number;
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
    .map((d) => buildDocumentNewNotification({ filename: d.filename, url: d.url }));
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

function stageSegment(order: number, title: string): string {
  return `${order}::${title.trim().toLowerCase()}`;
}

function publishOldStagePathKey(
  stage: PublishOldStage,
  oldById: Map<string, PublishOldStage>
): string {
  const segments: string[] = [];
  let current: PublishOldStage | undefined = stage;
  while (current) {
    segments.unshift(stageSegment(current.order, current.title));
    current = current.parentId ? oldById.get(current.parentId) : undefined;
  }
  return segments.join("/");
}

function incomingStagePathKey(
  stage: NormalizedAdminStage,
  incomingByKey: Map<string, NormalizedAdminStage>
): string {
  const segments: string[] = [];
  let current: NormalizedAdminStage | undefined = stage;
  while (current) {
    segments.unshift(stageSegment(current.order, current.title));
    current = current.parentClientKey
      ? incomingByKey.get(current.parentClientKey)
      : undefined;
  }
  return segments.join("/");
}

function buildPublishOldStageMaps(oldStages: PublishOldStage[]) {
  const oldById = new Map(oldStages.map((s) => [s.id, s]));
  const oldByPath = new Map(
    oldStages.map((s) => [publishOldStagePathKey(s, oldById), s])
  );
  return { oldById, oldByPath };
}

function resolvePreviousPublishStage(
  incoming: NormalizedAdminStage,
  oldById: Map<string, PublishOldStage>,
  oldByPath: Map<string, PublishOldStage>,
  incomingByKey: Map<string, NormalizedAdminStage>
): PublishOldStage | undefined {
  const byId = oldById.get(incoming.clientKey);
  if (byId) return byId;
  return oldByPath.get(incomingStagePathKey(incoming, incomingByKey));
}

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

export function detectStageStatusNotifications(
  oldStages: PublishOldStage[],
  incomingRaw: AdminStagePayload[]
): ReturnType<typeof buildStageStatusNotification>[] {
  const { stages: incoming } = normalizeAdminStagesPayload(incomingRaw);
  const { oldById, oldByPath } = buildPublishOldStageMaps(oldStages);
  const incomingByKey = new Map(incoming.map((s) => [s.clientKey, s]));

  const out: ReturnType<typeof buildStageStatusNotification>[] = [];
  for (const stage of incoming) {
    const prev = resolvePreviousPublishStage(stage, oldById, oldByPath, incomingByKey);
    const nextStatus = stage.status;
    if (nextStatus !== "IN_PROGRESS" && nextStatus !== "DONE") continue;
    if (prev?.status === nextStatus) continue;
    out.push(buildStageStatusNotification({ title: stage.title, status: nextStatus }));
  }
  return out;
}

/**
 * Уведомления только при публикации в ЛК.
 * Передавайте newPayments / draftStages / newDocuments / newPhotos только для блоков,
 * которые реально менялись в черновике (undefined = не трогали раздел).
 */
export function collectNotificationsForPublish(input: {
  oldPayments: OldPayment[];
  newPayments?: NewPayment[];
  oldStages: PublishOldStage[];
  draftStages?: AdminStagePayload[];
  oldDocuments?: PublishedDocumentRef[];
  newDocuments?: PublishedDocumentRef[];
  oldPhotos?: PublishedPhotoRef[];
  newPhotos?: PublishedPhotoRef[];
}): PublishNotificationSpec[] {
  const specs: PublishNotificationSpec[] = [];

  if (input.draftStages !== undefined) {
    specs.push(...detectStageStatusNotifications(input.oldStages, input.draftStages));
  }

  if (input.newPayments !== undefined) {
    specs.push(...detectPaymentExpectedNotifications(input.oldPayments, input.newPayments));
  }

  if (input.newDocuments !== undefined) {
    specs.push(
      ...detectNewDocumentNotifications(input.oldDocuments ?? [], input.newDocuments)
    );
  }

  if (input.newPhotos !== undefined) {
    specs.push(...detectNewPhotoNotifications(input.oldPhotos ?? [], input.newPhotos));
  }

  return specs;
}
