import { FileText } from "lucide-react";
import type { ClientDocumentSignatureStatus } from "@prisma/client";
import { ClientDocumentDownloadLink } from "@/components/account/client-document-download-link";
import { DocumentSignedDateField } from "@/components/account/document-signed-date-field";
import {
  documentSigningHint,
  formatDocumentClientStatusLine,
  isDocumentSigned,
} from "@/lib/client-document-signature";

export type ClientDocumentListItem = {
  id: string;
  filename: string;
  url: string;
  uploadedAt: Date;
  signatureStatus: ClientDocumentSignatureStatus;
  signedAt: Date | null;
};

/** Список документов в ЛК (макет: название — статус — скачать). */
export function ClientDocumentsList({ documents }: { documents: ClientDocumentListItem[] }) {
  if (documents.length === 0) {
    return <p style={{ color: "var(--text-muted)" }}>Документов пока нет.</p>;
  }

  return (
    <div className="space-y-4">
      <h2
        className="font-heading text-sm font-bold tracking-wide uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        Документы
      </h2>
      <ul className="space-y-0 divide-y" style={{ borderColor: "var(--border)" }}>
        {documents.map((d) => {
          const signed = isDocumentSigned(d.signatureStatus);
          const statusLine = formatDocumentClientStatusLine(d.signatureStatus, d.signedAt);
          return (
            <li key={d.id} className="flex flex-wrap items-center gap-3 py-4 first:pt-0">
              <FileText className="h-8 w-8 shrink-0 opacity-70" aria-hidden />
              <p className="min-w-0 flex-1 text-sm font-medium leading-snug break-words">
                {d.filename}
              </p>
              <span
                className="shrink-0 text-sm font-semibold whitespace-nowrap"
                style={{ color: signed ? "var(--accent)" : "var(--text)" }}
              >
                {statusLine}
              </span>
              <ClientDocumentDownloadLink
                documentId={d.id}
                className="shrink-0 text-sm font-semibold whitespace-nowrap"
                style={{ color: "var(--accent)" }}
              />

              {!signed ? (
                <div
                  className="w-full rounded-lg border p-3 mt-1 space-y-2 text-sm"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "color-mix(in srgb, var(--bg) 35%, transparent)",
                  }}
                >
                  <p style={{ color: "var(--text-muted)" }}>{documentSigningHint(d.signatureStatus)}</p>
                  <button
                    type="button"
                    disabled
                    title="Скоро — подписание электронной подписью с подтверждением по SMS"
                    className="inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: "var(--accent)", color: "var(--accent-fg, #fff)" }}
                  >
                    Подписать ЭП
                  </button>
                </div>
              ) : (
                <DocumentSignedDateField signedAt={d.signedAt} className="w-full mt-1" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
