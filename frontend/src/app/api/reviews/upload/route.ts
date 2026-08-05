import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

import { REVIEW_PHOTO_MAX_BYTES, REVIEW_PHOTO_URL_PREFIX } from "@/lib/review-content";
import { checkReviewUploadRateLimit } from "@/lib/review-rate-limit";
import { validateUploadMagicBytes } from "@/lib/upload-file-validation";
import { getUploadImageOptimizeLimits } from "@/lib/upload-image-optimize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    if (!(await checkReviewUploadRateLimit(ip))) {
      return NextResponse.json(
        { error: "Слишком много загрузок. Попробуйте позже." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    const mime = (file.type || "").toLowerCase().split(";")[0]?.trim() ?? "";
    const ext = MIME_TO_EXT[mime];
    if (!ext) {
      return NextResponse.json(
        { error: "Допустимы только JPEG, PNG или WebP." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > REVIEW_PHOTO_MAX_BYTES) {
      return NextResponse.json(
        { error: `Фото слишком большое (макс. ${REVIEW_PHOTO_MAX_BYTES / 1024 / 1024} МБ).` },
        { status: 400 },
      );
    }

    const magic = validateUploadMagicBytes(buffer, ext, "image");
    if (!magic.ok) {
      return NextResponse.json({ error: magic.error }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "reviews");
    await mkdir(uploadsDir, { recursive: true });

    const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const webpName = `review-${stamp}.webp`;
    const webpPath = path.join(uploadsDir, webpName);

    try {
      const limits = getUploadImageOptimizeLimits("default");
      await sharp(buffer)
        .rotate()
        .resize({
          width: limits.maxEdgePx,
          height: limits.maxEdgePx,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: limits.webpQuality })
        .toFile(webpPath);
    } catch (sharpError) {
      console.warn("[REVIEW UPLOAD] Sharp failed, saving original:", sharpError);
      const fallbackName = `review-${stamp}.${ext}`;
      await writeFile(path.join(uploadsDir, fallbackName), buffer);
      return NextResponse.json({ url: `${REVIEW_PHOTO_URL_PREFIX}${fallbackName}` });
    }

    return NextResponse.json({ url: `${REVIEW_PHOTO_URL_PREFIX}${webpName}` });
  } catch (error) {
    console.error("[REVIEW UPLOAD]", error);
    return NextResponse.json({ error: "Не удалось сохранить фото" }, { status: 500 });
  }
}
