import { NextRequest, NextResponse } from "next/server";
import { open, readFile, stat } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
  ".m4v": "video/x-m4v",
  ".avi": "video/x-msvideo",
  ".ogv": "video/ogg",
};

const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".mkv", ".m4v", ".avi", ".ogv"]);

type RangeResult =
  | { kind: "range"; start: number; end: number }
  | { kind: "ignore" }
  | { kind: "unsatisfiable" };

/** Safari / iOS требуют 206 + Content-Range для воспроизведения видео по запросам Range. */
function parseByteRange(rangeHeader: string | null, size: number): RangeResult {
  if (!rangeHeader?.trim()) return { kind: "ignore" };
  const trimmed = rangeHeader.trim();
  if (!/^bytes=/i.test(trimmed)) return { kind: "ignore" };

  const spec = trimmed.replace(/^bytes=/i, "").trim();

  if (spec.startsWith("-")) {
    const suffix = parseInt(spec.slice(1), 10);
    if (Number.isNaN(suffix) || suffix <= 0) return { kind: "ignore" };
    const start = Math.max(0, size - suffix);
    return { kind: "range", start, end: size - 1 };
  }

  const dash = spec.indexOf("-");
  if (dash < 0) return { kind: "ignore" };
  const startStr = spec.slice(0, dash);
  const endStr = spec.slice(dash + 1);

  const start = startStr === "" ? 0 : parseInt(startStr, 10);
  let end = endStr === "" ? size - 1 : parseInt(endStr, 10);

  if (Number.isNaN(start) || start < 0) return { kind: "ignore" };
  if (start >= size) return { kind: "unsatisfiable" };
  if (Number.isNaN(end)) return { kind: "ignore" };
  if (end >= size) end = size - 1;
  if (start > end) return { kind: "ignore" };

  return { kind: "range", start, end };
}

const sharedHeaders = {
  "Cache-Control": "public, max-age=604800, immutable",
} as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const segments = params.path;
  if (!segments || segments.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const safeName = segments
    .map((s) => s.replace(/[^a-zA-Z0-9а-яА-ЯёЁ._-]/g, "_"))
    .join("/");

  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsRoot, safeName);

  if (!filePath.startsWith(uploadsRoot)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const size = info.size;
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const rangeResult = parseByteRange(request.headers.get("range"), size);

    if (rangeResult.kind === "unsatisfiable") {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }

    if (rangeResult.kind === "range") {
      const { start, end } = rangeResult;
      const length = end - start + 1;
      const fh = await open(filePath, "r");
      try {
        const buf = Buffer.alloc(length);
        await fh.read(buf, 0, length, start);
        return new NextResponse(buf, {
          status: 206,
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(length),
            "Content-Range": `bytes ${start}-${end}/${size}`,
            "Accept-Ranges": "bytes",
            ...sharedHeaders,
          },
        });
      } finally {
        await fh.close();
      }
    }

    const buffer = await readFile(filePath);
    const isVideo = VIDEO_EXT.has(ext);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        ...(isVideo || size > 256 * 1024 ? { "Accept-Ranges": "bytes" } : {}),
        ...sharedHeaders,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
