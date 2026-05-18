import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clientDocumentDownloadUpdate } from "@/lib/client-document-download";
import { documentSignatureSyncWhere } from "@/lib/client-document-signature-sync";
import { prisma } from "@/lib/db";
import { publishedDocumentWhere } from "@/lib/client-portal-order";

export const dynamic = "force-dynamic";

/** Скачивание документа клиентом: фиксирует ознакомление и отдаёт файл. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const session = await getServerSession(authOptions);
  const projectId = session?.user?.role === "client" ? session.user.clientProjectId : undefined;
  if (!projectId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docId } = await params;

  try {
    const doc = await prisma.clientDocument.findFirst({
      where: { id: docId, projectId, ...publishedDocumentWhere },
    });
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
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

    return NextResponse.redirect(doc.url);
  } catch (e) {
    console.error("[CLIENT DOCUMENT DOWNLOAD]", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
