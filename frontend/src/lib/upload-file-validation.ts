type UploadKind = "image" | "video" | "document";

type SignatureRule = {
  ext: string;
  test: (buffer: Buffer) => boolean;
};

function startsWith(buffer: Buffer, bytes: number[]): boolean {
  if (buffer.length < bytes.length) return false;
  return bytes.every((b, i) => buffer[i] === b);
}

function asciiAt(buffer: Buffer, offset: number, text: string): boolean {
  if (buffer.length < offset + text.length) return false;
  return buffer.toString("ascii", offset, offset + text.length) === text;
}

const SIGNATURE_RULES: Record<string, SignatureRule[]> = {
  pdf: [{ ext: "pdf", test: (b) => startsWith(b, [0x25, 0x50, 0x44, 0x46]) }],
  png: [{ ext: "png", test: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) }],
  jpg: [{ ext: "jpg", test: (b) => startsWith(b, [0xff, 0xd8, 0xff]) }],
  jpeg: [{ ext: "jpeg", test: (b) => startsWith(b, [0xff, 0xd8, 0xff]) }],
  gif: [{ ext: "gif", test: (b) => startsWith(b, [0x47, 0x49, 0x46, 0x38]) }],
  webp: [{ ext: "webp", test: (b) => startsWith(b, [0x52, 0x49, 0x46, 0x46]) && asciiAt(b, 8, "WEBP") }],
  avif: [{ ext: "avif", test: (b) => startsWith(b, [0x00, 0x00, 0x00]) && (asciiAt(b, 4, "ftyp") || asciiAt(b, 8, "ftyp")) }],
  mp4: [{ ext: "mp4", test: (b) => b.length >= 12 && asciiAt(b, 4, "ftyp") }],
  webm: [{ ext: "webm", test: (b) => startsWith(b, [0x1a, 0x45, 0xdf, 0xa3]) }],
  mov: [{ ext: "mov", test: (b) => b.length >= 12 && asciiAt(b, 4, "ftyp") }],
  mkv: [{ ext: "mkv", test: (b) => startsWith(b, [0x1a, 0x45, 0xdf, 0xa3]) }],
  m4v: [{ ext: "m4v", test: (b) => b.length >= 12 && asciiAt(b, 4, "ftyp") }],
  avi: [{ ext: "avi", test: (b) => startsWith(b, [0x52, 0x49, 0x46, 0x46]) && asciiAt(b, 8, "AVI ") }],
  ogv: [{ ext: "ogv", test: (b) => startsWith(b, [0x4f, 0x67, 0x67, 0x53]) }],
  zip: [
    { ext: "zip", test: (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]) },
    { ext: "zip", test: (b) => startsWith(b, [0x50, 0x4b, 0x05, 0x06]) },
  ],
  xlsx: [{ ext: "xlsx", test: (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]) }],
  docx: [{ ext: "docx", test: (b) => startsWith(b, [0x50, 0x4b, 0x03, 0x04]) }],
  xls: [{ ext: "xls", test: (b) => startsWith(b, [0xd0, 0xcf, 0x11, 0xe0]) }],
  doc: [{ ext: "doc", test: (b) => startsWith(b, [0xd0, 0xcf, 0x11, 0xe0]) }],
  rar: [{ ext: "rar", test: (b) => startsWith(b, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]) }],
};

function matchesExt(buffer: Buffer, ext: string): boolean {
  const rules = SIGNATURE_RULES[ext];
  if (!rules) return true;
  return rules.some((rule) => rule.test(buffer));
}

/** Проверяет, что содержимое файла соответствует заявленному расширению. */
export function validateUploadMagicBytes(
  buffer: Buffer,
  ext: string,
  kind: UploadKind
): { ok: true } | { ok: false; error: string } {
  if (ext === "svg") {
    const text = buffer.toString("utf-8", 0, Math.min(buffer.length, 4096)).trimStart();
    if (!text.startsWith("<") || !/<svg[\s>]/i.test(text)) {
      return { ok: false, error: "Файл не похож на SVG." };
    }
    if (/<script[\s>]/i.test(text) || /\son\w+\s*=/i.test(text)) {
      return { ok: false, error: "SVG содержит небезопасные элементы." };
    }
    return { ok: true };
  }

  if (kind === "document" && (ext === "txt" || ext === "csv")) {
    if (buffer.includes(0)) {
      return { ok: false, error: "Текстовый файл содержит бинарные данные." };
    }
    return { ok: true };
  }

  if (!matchesExt(buffer, ext)) {
    return {
      ok: false,
      error: `Содержимое файла не совпадает с расширением «.${ext}».`,
    };
  }

  return { ok: true };
}

const PRIVATE_CLIENT_DOCUMENT_PREFIX = "/private-uploads/client-documents/";

/** Клиентские документы должны храниться только во внутреннем private storage. */
export function isAllowedClientDocumentUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith(PRIVATE_CLIENT_DOCUMENT_PREFIX)) return true;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed).pathname.startsWith(PRIVATE_CLIENT_DOCUMENT_PREFIX);
    } catch {
      return false;
    }
  }
  return false;
}
