"use client";

import { useState } from "react";
import { parseDownloadFilenameFromResponse } from "@/lib/client-upload-file";

async function readDownloadErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string };
    if (data.message?.trim()) return data.message.trim();
  } catch {
    /* not JSON */
  }
  if (res.status === 401) return "Войдите в личный кабинет.";
  if (res.status === 404) return "Файл удалён или недоступен. Обратитесь к менеджеру проекта.";
  return "Не удалось скачать файл. Попробуйте позже.";
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

/** Скачивание через API: фиксирует ознакомление и не открывает вкладку с JSON-ошибкой. */
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDownload() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/client/documents/${documentId}/download`, {
        credentials: "same-origin",
      });
      if (!res.ok) {
        setError(await readDownloadErrorMessage(res));
        return;
      }
      const blob = await res.blob();
      const filename = parseDownloadFilenameFromResponse(
        res.headers.get("Content-Disposition"),
        "document"
      );
      triggerBrowserDownload(blob, filename);
    } catch {
      setError("Не удалось скачать файл. Проверьте соединение и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void onDownload()}
        disabled={loading}
        className={[
          "inline bg-transparent border-0 p-0 cursor-pointer disabled:opacity-60",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        {loading ? "Загрузка…" : children}
      </button>
      {error ? (
        <span className="text-xs text-red-600 dark:text-red-400 max-w-[14rem] text-right leading-snug">
          {error}
        </span>
      ) : null}
    </span>
  );
}
