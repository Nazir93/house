import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveClientOverallProgress } from "@/lib/client-project-overall-progress";
import {
  clientDocumentOrderBy,
  clientPhotoReportOrderBy,
  publishedDocumentWhere,
  publishedPhotoWhere,
} from "@/lib/client-portal-order";
import { buildUpcomingPaymentSummary } from "@/lib/client-payments-dashboard";
import { formatCurrentStageLabel, getCurrentStagesInProgress } from "@/lib/client-project-stage-status";

export async function GET() {
  const session = await getServerSession(authOptions);
  const projectId = session?.user?.role === "client" ? session.user.clientProjectId : undefined;
  if (!projectId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [project, documentsTotal, photoReportsTotal] = await Promise.all([
      prisma.clientConstructionProject.findUnique({
        where: { id: projectId },
        include: {
          stages: { orderBy: { order: "asc" } },
          payments: { orderBy: [{ order: "asc" }, { dueDate: "asc" }] },
          documents: { where: publishedDocumentWhere, orderBy: clientDocumentOrderBy, take: 8 },
          photoReports: { where: publishedPhotoWhere, orderBy: clientPhotoReportOrderBy, take: 6 },
          tickets: {
            orderBy: { updatedAt: "desc" },
            take: 10,
            include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
          },
        },
      }),
      prisma.clientDocument.count({ where: { projectId, ...publishedDocumentWhere } }),
      prisma.clientPhotoReport.count({ where: { projectId, ...publishedPhotoWhere } }),
    ]);

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const upcomingSummary = buildUpcomingPaymentSummary(project.payments);

    const photoPreview = project.photoReports;
    const docPreview = project.documents.slice(0, 5);

    const stageNodes = project.stages.map((s) => ({
      id: s.id,
      parentId: s.parentId,
      status: s.status,
    }));
    const overallProgress = await resolveClientOverallProgress(
      project.id,
      stageNodes,
      project.overallProgress
    );

    const stagesWithMeta = project.stages.map((s) => ({
      id: s.id,
      parentId: s.parentId,
      status: s.status,
      title: s.title,
      iconKey: s.iconKey,
      order: s.order,
    }));
    const currentStagesInProgress = getCurrentStagesInProgress(stagesWithMeta);
    const currentStageLabel = formatCurrentStageLabel(stagesWithMeta);

    return NextResponse.json({
      project: {
        id: project.id,
        contractNumber: project.contractNumber,
        clientName: project.clientName,
        title: project.title,
        area: project.area,
        wallMaterial: project.wallMaterial,
        startDate: project.startDate?.toISOString() ?? null,
        plannedEndDate: project.plannedEndDate?.toISOString() ?? null,
        coverImageUrl: project.coverImageUrl,
        overallProgress,
        currentStageLabel,
        currentStagesInProgress,
        foremanName: project.foremanName,
        cameraStreamUrl: project.cameraStreamUrl,
        stages: project.stages,
        payments: project.payments,
        upcomingPayment: upcomingSummary,
        documents: docPreview,
        documentsTotal,
        photoReports: photoPreview,
        photoReportsTotal,
        tickets: project.tickets.map((t) => ({
          id: t.id,
          subject: t.subject,
          status: t.status,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          lastMessagePreview: t.messages[0]?.body?.slice(0, 120) ?? null,
        })),
      },
    });
  } catch (e) {
    console.error("[client/dashboard]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
