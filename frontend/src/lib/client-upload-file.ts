import path from "path";

const UPLOAD_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".zip": "application/zip",
  ".rar": "application/vnd.rar",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export type ResolvedClientUploadFile = {
  /** Абсолютный путь на диске */
  filePath: string;
  /** Путь вида /uploads/… */
  publicPath: string;
};

/** Нормализует URL документа/фото к пути /uploads/… */
export function normalizeClientUploadPath(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const u = new URL(trimmed);
      if (u.pathname.startsWith("/uploads/")) return u.pathname;
      return null;
    } catch {
      return null;
    }
  }

  if (trimmed.startsWith("//")) {
    try {
      const u = new URL(`https:${trimmed}`);
      if (u.pathname.startsWith("/uploads/")) return u.pathname;
      return null;
    } catch {
      return null;
    }
  }

  if (trimmed.startsWith("/uploads/")) return trimmed;
  if (trimmed.startsWith("uploads/")) return `/${trimmed}`;
  return null;
}

function safeUploadSegments(publicPath: string): string[] | null {
  const prefix = "/uploads/";
  if (!publicPath.startsWith(prefix)) return null;
  const rest = publicPath.slice(prefix.length);
  if (!rest || rest.includes("..")) return null;
  return rest.split("/").map((s) => s.replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]/g, "_"));
}

/** Сопоставляет URL из БД с файлом в public/uploads. */
export function resolveClientUploadFile(url: string): ResolvedClientUploadFile | null {
  const publicPath = normalizeClientUploadPath(url);
  if (!publicPath) return null;

  const segments = safeUploadSegments(publicPath);
  if (!segments || segments.length === 0) return null;

  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsRoot, ...segments);

  if (!filePath.startsWith(uploadsRoot)) return null;

  return { filePath, publicPath };
}

export function mimeTypeForUploadPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return UPLOAD_MIME[ext] ?? "application/octet-stream";
}

/** Заголовок Content-Disposition для скачивания с кириллическим именем. */
export function contentDispositionAttachment(filename: string): string {
  const trimmed = filename.trim() || "document";
  const ascii = trimmed.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_") || "document";
  const encoded = encodeURIComponent(trimmed);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export function parseDownloadFilenameFromResponse(
  contentDisposition: string | null,
  fallback: string
): string {
  if (!contentDisposition) return fallback;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1]);
    } catch {
      /* ignore */
    }
  }
  const plain = /filename="([^"]+)"/i.exec(contentDisposition);
  if (plain?.[1]) return plain[1];
  return fallback;
}
