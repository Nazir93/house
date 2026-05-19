import { readFile, stat } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clientDocumentDownloadUpdate } from "@/lib/client-document-download";
import { documentSignatureSyncWhere } from "@/lib/client-document-signature-sync";
import {
  contentDispositionAttachment,
  mimeTypeForUploadPath,
  resolveClientUploadFile,
} from "@/lib/client-upload-file";
import { prisma } from "@/lib/db";
import { publishedDocumentWhere } from "@/lib/client-portal-order";

export const dynamic = "force-dynamic";

const FILE_UNAVAILABLE = {
  error: "file_unavailable",
  message: "Файл удалён или недоступен. Обратитесь к менеджеру проекта.",
} as const;

function jsonError(status: number, body: { error: string; message: string }) {
  return NextResponse.json(body, { status });
}

/** Скачивание документа клиентом: фиксирует ознакомление и отдаёт файл. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const session = await getServerSession(authOptions);
  const projectId = session?.user?.role === "client" ? session.user.clientProjectId : undefined;
  if (!projectId) {
    return jsonError(401, { error: "unauthorized", message: "Войдите в личный кабинет." });
  }

  const { docId } = await params;

  try {
    const doc = await prisma.clientDocument.findFirst({
      where: { id: docId, projectId, ...publishedDocumentWhere },
    });
    if (!doc) {
      return jsonError(404, {
        error: "not_found",
        message: "Документ не найден или ещё не опубликован.",
      });
    }

    const resolved = resolveClientUploadFile(doc.url);
    if (!resolved) {
      return jsonError(404, FILE_UNAVAILABLE);
    }

    let fileStat;
    try {
      fileStat = await stat(resolved.filePath);
    } catch {
      return jsonError(404, FILE_UNAVAILABLE);
    }
    if (!fileStat.isFile()) {
      return jsonError(404, FILE_UNAVAILABLE);
    }

    const update = clientDocumentDownloadUpdate(doc);
    if (update) {
      await prisma.clientDocument.updateMany({
        where: documentSignatureSyncWhere(projectId, {
          url: doc.url,
          filename: doc.filename,
          order: doc.order,
        }),
        data: update,
      });
    }

    const buffer = await readFile(resolved.filePath);
    const downloadName = doc.filename.trim() || "document";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeTypeForUploadPath(resolved.filePath),
        "Content-Length": String(buffer.length),
        "Content-Disposition": contentDispositionAttachment(downloadName),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    console.error("[CLIENT DOCUMENT DOWNLOAD]", e);
    return jsonError(500, {
      error: "server_error",
      message: "Не удалось скачать файл. Попробуйте позже.",
    });
  }
}
