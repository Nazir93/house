import { prisma } from "@/lib/db";
import { clientDocumentOrderBy, clientPhotoReportOrderBy } from "@/lib/client-portal-order";
import {
  draftDocumentWhere,
  draftPhotoWhere,
  ensureDraftMediaWorkspace,
} from "@/lib/client-project-draft-media";
import { hasUnpublishedDraft, parseClientProjectDraftData } from "@/lib/client-project-draft";
import { resolveStageIconKeyForPersist } from "@/lib/client-project-stage-icons";
import type { ClientProjectAdminInitial } from "@/components/admin/client-project-admin-form";

export async function loadAdminClientProjectInitial(
  projectId: string
): Promise<ClientProjectAdminInitial | null> {
  const project = await prisma.clientConstructionProject.findUnique({
    where: { id: projectId },
    include: {
      stages: { orderBy: { order: "asc" } },
      payments: { orderBy: [{ order: "asc" }, { dueDate: "asc" }] },
      tickets: {
        orderBy: { updatedAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  if (!project) return null;

  await ensureDraftMediaWorkspace(projectId);

  const [photoReports, documents] = await Promise.all([
    prisma.clientPhotoReport.findMany({
      where: { projectId, ...draftPhotoWhere },
      orderBy: clientPhotoReportOrderBy,
    }),
    prisma.clientDocument.findMany({
      where: { projectId, ...draftDocumentWhere },
      orderBy: clientDocumentOrderBy,
    }),
  ]);

  const draft = parseClientProjectDraftData(project.draftData);

  return {
    contractNumber: draft?.contractNumber ?? project.contractNumber,
    title: draft?.title ?? project.title,
    clientName: draft?.clientName !== undefined ? draft.clientName : project.clientName,
    clientEmail: draft?.clientEmail !== undefined ? draft.clientEmail : project.clientEmail,
    area: draft?.area !== undefined ? draft.area : project.area,
    wallMaterial: draft?.wallMaterial !== undefined ? draft.wallMaterial : project.wallMaterial,
    startDate: draft?.startDate !== undefined ? draft.startDate : project.startDate?.toISOString() ?? null,
    plannedEndDate:
      draft?.plannedEndDate !== undefined
        ? draft.plannedEndDate
        : project.plannedEndDate?.toISOString() ?? null,
    coverImageUrl: draft?.coverImageUrl !== undefined ? draft.coverImageUrl : project.coverImageUrl,
    overallProgress: project.overallProgress,
    currentStageLabel: project.currentStageLabel,
    foremanName: draft?.foremanName !== undefined ? draft.foremanName : project.foremanName,
    cameraStreamUrl: draft?.cameraStreamUrl !== undefined ? draft.cameraStreamUrl : project.cameraStreamUrl,
    houseProjectId: draft?.houseProjectId !== undefined ? draft.houseProjectId : project.houseProjectId,
    showOnPublicSite: draft?.showOnPublicSite !== undefined ? draft.showOnPublicSite : project.showOnPublicSite,
    location: draft?.location !== undefined ? draft.location : project.location,
    latitude:
      draft?.latitude !== undefined
        ? draft.latitude
        : project.latitude != null
          ? String(project.latitude)
          : null,
    longitude:
      draft?.longitude !== undefined
        ? draft.longitude
        : project.longitude != null
          ? String(project.longitude)
          : null,
    builtObjectId: project.builtObjectId,
    hasUnpublishedDraft: hasUnpublishedDraft(project),
    draftSavedAt: project.draftSavedAt?.toISOString() ?? null,
    cabinetPublishedAt: project.cabinetPublishedAt?.toISOString() ?? null,
    stages:
      draft?.stages !== undefined
        ? draft.stages.map((s, i) => ({
            id: String(s.clientKey ?? `draft-stage-${i}`),
            parentId: s.parentClientKey ? String(s.parentClientKey) : null,
            order: typeof s.order === "number" ? s.order : i,
            title: String(s.title ?? `Этап ${i + 1}`),
            iconKey: resolveStageIconKeyForPersist(
              String(s.title ?? `Этап ${i + 1}`),
              String(s.iconKey ?? "circle")
            ),
            status: String(s.status ?? "NOT_STARTED"),
          }))
        : project.stages.map((s) => ({
            id: s.id,
            parentId: s.parentId,
            order: s.order,
            title: s.title,
            iconKey: resolveStageIconKeyForPersist(s.title, s.iconKey),
            status: s.status,
          })),
    payments:
      draft?.payments !== undefined
        ? draft.payments.map((p, i) => ({
            label: p.label,
            amountKopeks: Math.round(p.amountRubles * 100),
            dueDate: p.dueDate,
            status: p.status,
            paidAt: p.paidAt,
            order: p.order ?? i,
          }))
        : project.payments.map((p) => ({
            label: p.label,
            amountKopeks: p.amountKopeks,
            dueDate: p.dueDate?.toISOString() ?? null,
            status: p.status,
            paidAt: p.paidAt?.toISOString() ?? null,
            order: p.order,
          })),
    documents: documents.map((d) => ({
      id: d.id,
      filename: d.filename,
      url: d.url,
      order: d.order,
      signatureStatus: d.signatureStatus,
      signatureMethod: d.signatureMethod,
      signedByName: d.signedByName,
      signatureSmsPhone: d.signatureSmsPhone,
      signedResultUrl: d.signedResultUrl,
      signedAt: d.signedAt?.toISOString() ?? null,
    })),
    photoReports: photoReports.map((p) => ({
      id: p.id,
      url: p.url,
      caption: p.caption,
      order: p.order,
    })),
    tickets: project.tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      messages: t.messages.map((m) => ({
        authorType: m.authorType,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      })),
    })),
  };
}
