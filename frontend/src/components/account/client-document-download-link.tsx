"use client";

/** Скачивание через API: фиксирует ознакомление и переводит в «Ожидает подписания». */
export function ClientDocumentDownloadLink({
  documentId,
  className,
  style,
  children = "Скачать",
}: {
  documentId: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={`/api/client/documents/${documentId}/download`}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}
