import { formatDocumentSignedAtRu } from "@/lib/client-document-signed-date";

/** Поле «Дата подписания» в личном кабинете. */
export function DocumentSignedDateField({
  signedAt,
  className = "",
}: {
  signedAt: Date | string | null;
  className?: string;
}) {
  if (!signedAt) return null;

  return (
    <p className={`text-sm ${className}`.trim()}>
      <span style={{ color: "var(--text-muted)" }}>Дата подписания: </span>
      <span className="font-medium tabular-nums">{formatDocumentSignedAtRu(signedAt)}</span>
    </p>
  );
}
