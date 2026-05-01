import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif", "svg"]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov", "mkv", "m4v", "avi", "ogv"]);

/** Если в имени нет расширения или оно не из списка — определяем по MIME (важно для телефонов / «Без названия»). */
const MIME_TO_VIDEO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv",
  "video/x-msvideo": "avi",
  "video/avi": "avi",
  "video/3gpp": "mp4",
  "video/3gpp2": "mp4",
  "application/mp4": "mp4",
  "video/ogg": "ogv",
};

const MIME_TO_IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

function resolveExtAndKind(file: File): { ext: string; kind: "image" | "video" } | { error: string } {
  const rawName = file.name?.trim() || "";
  const fromName = rawName.includes(".") ? (rawName.split(".").pop()?.toLowerCase() ?? "") : "";
  const mime = (file.type || "").toLowerCase().split(";")[0]?.trim() ?? "";

  if (fromName && IMAGE_EXT.has(fromName)) {
    return { ext: fromName, kind: "image" };
  }
  if (fromName && VIDEO_EXT.has(fromName)) {
    return { ext: fromName, kind: "video" };
  }

  if (mime.startsWith("video/")) {
    const mapped = MIME_TO_VIDEO_EXT[mime];
    if (mapped && VIDEO_EXT.has(mapped)) {
      return { ext: mapped, kind: "video" };
    }
    if (mime === "video/mp4" || mime.endsWith("/mp4")) return { ext: "mp4", kind: "video" };
    return {
      error:
        `Неизвестный формат видео (${mime || "пустой MIME"}). Сохраните файл как .mp4, .webm или .mov, либо обновите браузер.`,
    };
  }

  if (mime.startsWith("image/")) {
    const mapped = MIME_TO_IMAGE_EXT[mime];
    if (mapped && IMAGE_EXT.has(mapped)) {
      return { ext: mapped, kind: "image" };
    }
  }

  if (!fromName && !mime) {
    return { error: "Нет расширения в имени файла и не передан MIME-тип. Переименуйте файл (например, video.mp4)." };
  }

  return {
    error: `Формат не поддерживается (расширение «${fromName || "—"}», MIME «${mime || "—"}»). Для видео: mp4, webm, mov, mkv, m4v, avi.`,
  };
}

/** Лимиты для self-hosted Node (при необходимости увеличьте в nginx / прокси) */
const MAX_IMAGE_BYTES = 30 * 1024 * 1024;
const MAX_VIDEO_BYTES = 250 * 1024 * 1024;

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const resolved = resolveExtAndKind(file);
    if ("error" in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }
    const { ext, kind } = resolved;
    const isImageType = kind === "image";
    const isVideoType = kind === "video";

    if (isImageType && buffer.length > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: `Изображение слишком большое (макс. ${MAX_IMAGE_BYTES / 1024 / 1024} МБ)` }, { status: 400 });
    }
    if (isVideoType && buffer.length > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: `Видео слишком большое (макс. ${MAX_VIDEO_BYTES / 1024 / 1024} МБ)` }, { status: 400 });
    }

    let baseStem = (file.name || "upload")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, "_")
      .slice(0, 60);
    if (!baseStem.trim()) baseStem = "upload";
    const timestamp = Date.now().toString(36);
    const fileName = `${baseStem}-${timestamp}`;

    const useSharp = isImageType && ext !== "svg" && ext !== "gif";

    let savedPath: string;

    if (useSharp) {
      const webpName = `${fileName}.webp`;
      const webpPath = path.join(uploadsDir, webpName);
      try {
        await sharp(buffer)
          .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(webpPath);
        savedPath = `/uploads/${webpName}`;
      } catch (sharpError) {
        // Sharp может падать на некоторых серверах (musl, Alpine) — сохраняем оригинал
        console.warn("[UPLOAD] Sharp failed, saving original:", sharpError);
        const finalName = `${fileName}.${ext}`;
        const filePath = path.join(uploadsDir, finalName);
        await writeFile(filePath, buffer);
        savedPath = `/uploads/${finalName}`;
      }
    } else if (ext === "svg") {
      let svgText = buffer.toString("utf-8");
      svgText = svgText
        .replace(/<script[\s>][\s\S]*?<\/script>/gi, "")
        .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
        .replace(/\son\w+\s*=\s*[^\s>]*/gi, "")
        .replace(/javascript\s*:/gi, "blocked:")
        .replace(/<\/?(foreignObject|iframe|embed|object|use[^r])[\s>][^>]*>/gi, "");
      const finalName = `${fileName}.svg`;
      const filePath = path.join(uploadsDir, finalName);
      await writeFile(filePath, svgText, "utf-8");
      savedPath = `/uploads/${finalName}`;
    } else {
      const finalName = `${fileName}.${ext}`;
      const filePath = path.join(uploadsDir, finalName);
      await writeFile(filePath, buffer);
      savedPath = `/uploads/${finalName}`;
    }

    return NextResponse.json({ url: savedPath });
  } catch (error) {
    console.error("[UPLOAD]", error);
    const err = error as NodeJS.ErrnoException;
    if (err?.code === "EACCES" || err?.code === "EPERM") {
      return NextResponse.json(
        {
          error:
            "Нет прав на запись в папку uploads (часто в Docker: смонтируйте volume на public/uploads или проверьте владельца каталога).",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Ошибка сохранения файла" }, { status: 500 });
  }
}
