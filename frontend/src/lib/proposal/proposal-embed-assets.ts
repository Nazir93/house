import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { normalizeClientUploadPath, resolveClientUploadFile } from "@/lib/client-upload-file";

function publicPathFromUrl(url: string): string | null {
  const normalized = normalizeClientUploadPath(url);
  if (normalized) return normalized;
  try {
    const u = new URL(url);
    if (u.pathname.startsWith("/images/")) return u.pathname;
  } catch {
    /* ignore */
  }
  return null;
}

/** Читает файл картинки с диска (public/uploads, public/images или абсолютный URL того же сайта). */
export async function readProposalImageBytes(imageUrl: string | null | undefined): Promise<Uint8Array | null> {
  if (!imageUrl?.trim()) return null;

  const upload = resolveClientUploadFile(imageUrl);
  if (upload) {
    try {
      return normalizeImageBytes(imageUrl, new Uint8Array(await readFile(upload.filePath)));
    } catch {
      return null;
    }
  }

  const publicPath = publicPathFromUrl(imageUrl);
  if (publicPath?.startsWith("/images/")) {
    const filePath = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    try {
      return normalizeImageBytes(imageUrl, new Uint8Array(await readFile(filePath)));
    } catch {
      return null;
    }
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    try {
      const res = await fetch(imageUrl, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) return null;
      return normalizeImageBytes(imageUrl, new Uint8Array(await res.arrayBuffer()));
    } catch {
      return null;
    }
  }

  return null;
}

async function normalizeImageBytes(imageUrl: string, bytes: Uint8Array): Promise<Uint8Array> {
  if (!imageUrl.toLowerCase().includes(".webp") && !(bytes[0] === 0x52 && bytes[1] === 0x49)) return bytes;
  try {
    return new Uint8Array(await sharp(bytes).jpeg({ quality: 92 }).toBuffer());
  } catch {
    return bytes;
  }
}

export function imageKindFromPath(imageUrl: string, bytes: Uint8Array): "png" | "jpg" | "webp" {
  const lower = imageUrl.toLowerCase();
  if (lower.includes(".png")) return "png";
  if (lower.includes(".webp")) return "webp";
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  return "jpg";
}
