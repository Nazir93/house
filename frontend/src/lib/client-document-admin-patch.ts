import type { ClientDocumentSignatureMethod, ClientDocumentSignatureStatus } from "@prisma/client";
import { parseAdminSignedDateInput } from "@/lib/client-document-signed-date";

export const DEFAULT_NEW_DOCUMENT_SIGNATURE_STATUS: ClientDocumentSignatureStatus =
  "AWAITING_REVIEW";

export const MANUAL_SIGNATURE_METHOD: ClientDocumentSignatureMethod = "MANUAL";

export type AdminDocumentPatchBody = {
  signatureStatus?: unknown;
  signedAt?: unknown;
  signedByName?: unknown;
};

export type AdminDocumentPatchDoc = {
  signatureStatus: ClientDocumentSignatureStatus;
};

export type AdminDocumentMarkSignedData = {
  signedAt: Date;
  signatureStatus: "SIGNED";
  signatureMethod: ClientDocumentSignatureMethod;
  signedByName: string;
};

export type AdminDocumentPatchPlan =
  | { action: "update_signed_at"; signedAt: Date; signedByName?: string }
  | { action: "mark_signed"; data: AdminDocumentMarkSignedData };

export type AdminDocumentPatchError = {
  error: string;
  status: 400;
};

export function resolveSignedByNameForManualSign(
  bodyName: unknown,
  defaultClientName: string | null | undefined
): string {
  const trimmed = typeof bodyName === "string" ? bodyName.trim() : "";
  if (trimmed.length > 0) return trimmed;
  const client = defaultClientName?.trim();
  if (client) return client;
  return "Клиент";
}

/** Чистая логика PATCH документа администратором (п. 7–8 ТЗ). */
export function resolveAdminDocumentPatch(
  doc: AdminDocumentPatchDoc,
  body: AdminDocumentPatchBody,
  options?: { defaultClientName?: string | null }
): AdminDocumentPatchPlan | AdminDocumentPatchError {
  const signedAt = parseAdminSignedDateInput(body.signedAt);
  if (!signedAt) {
    return { error: "signedAt required (YYYY-MM-DD)", status: 400 };
  }

  const markSigned = body.signatureStatus === "SIGNED";
  const signedByName = resolveSignedByNameForManualSign(
    body.signedByName,
    options?.defaultClientName
  );

  if (doc.signatureStatus === "SIGNED") {
    if (body.signatureStatus !== undefined && body.signatureStatus !== "SIGNED") {
      return { error: "Cannot change status after signed", status: 400 };
    }
    return {
      action: "update_signed_at",
      signedAt,
      signedByName: typeof body.signedByName === "string" ? signedByName : undefined,
    };
  }

  if (!markSigned) {
    return { error: "Only manual SIGNED status is allowed", status: 400 };
  }

  return {
    action: "mark_signed",
    data: {
      signedAt,
      signatureStatus: "SIGNED",
      signatureMethod: MANUAL_SIGNATURE_METHOD,
      signedByName,
    },
  };
}
