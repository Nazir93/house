import { FileText } from "lucide-react";
import type { ClientDocumentSignatureStatus } from "@prisma/client";
import { ClientDocumentDownloadLink } from "@/components/account/client-document-download-link";
import {
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

export function ClientDocumentsList({ documents }: { documents: ClientDocumentListItem[] }) {
  if (documents.length === 0) {
    return <p className="text-sm opacity-60">—</p>;
  }

  return (
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
          </li>
        );
      })}
    </ul>
  );
}
