import type { ClientPaymentStatus, Prisma } from "@prisma/client";
import { Prisma as PrismaNamespace } from "@prisma/client";
import { prisma } from "@/lib/db";
import { paymentAmountKopeksFromAdminPayload } from "@/lib/client-payment-amount";
import { collectNotificationsForPublish } from "@/lib/client-notification-sync";
import { createClientNotifications } from "@/lib/client-notifications";
import { publishDraftMediaWithNotifications } from "@/lib/client-project-draft-media";
import { parseClientProjectDraftData, type ClientProjectDraftData } from "@/lib/client-project-draft";
import { syncClientProjectPublicSite } from "@/lib/client-project-public-site-sync";
import { formatCurrentStageLabel } from "@/lib/client-project-stage-status";
import { replaceClientProjectStages } from "@/lib/client-project-stages-persist";
import { hashPassword } from "@/lib/password";

function parsePaymentStatus(v: unknown): ClientPaymentStatus {
  return v === "PAID" || v === "EXPECTED" || v === "NOT_ISSUED" ? v : "EXPECTED";
}

/** Применяет черновик к опубликованным данным ЛК и шлёт уведомления только по изменённым блокам. */
export async function publishClientProjectToCabinet(projectId: string): Promise<void> {
  const project = await prisma.clientConstructionProject.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("NOT_FOUND");

  const draft = parseClientProjectDraftData(project.draftData);
  const paymentsInDraft = draft?.payments !== undefined;
  const stagesInDraft = draft?.stages !== undefined;

  const [oldPayments, oldStages] = await Promise.all([
    prisma.clientPayment.findMany({
      where: { projectId },
      select: { order: true, label: true, status: true },
    }),
    prisma.clientProjectStage.findMany({
      where: { projectId },
      select: { id: true, parentId: true, order: true, title: true, status: true },
    }),
  ]);

  let newPaymentsAfterPublish: Parameters<typeof collectNotificationsForPublish>[0]["newPayments"];

  await prisma.$transaction(async (tx) => {
    if (draft) {
      await applyDraftFields(tx, projectId, project.contractNumber, draft);
    }

    if (stagesInDraft) {
      const progressFromStages = await replaceClientProjectStages(tx, projectId, draft.stages!);
      const stageRows = await tx.clientProjectStage.findMany({
        where: { projectId },
        orderBy: { order: "asc" },
      });
      const currentStageLabel = formatCurrentStageLabel(
        stageRows.map((s) => ({
          id: s.id,
          parentId: s.parentId,
          status: s.status,
          title: s.title,
          iconKey: s.iconKey,
          order: s.order,
        }))
      );
      await tx.clientConstructionProject.update({
        where: { id: projectId },
        data: { overallProgress: progressFromStages, currentStageLabel },
      });
    }

    if (paymentsInDraft) {
      await tx.clientPayment.deleteMany({ where: { projectId } });
      if (draft!.payments!.length > 0) {
        await tx.clientPayment.createMany({
          data: draft.payments!.map((p, i) => ({
            projectId,
            label: p.label,
            amountKopeks: paymentAmountKopeksFromAdminPayload({
              amountRubles: p.amountRubles,
            }),
            dueDate: p.dueDate ? new Date(p.dueDate) : null,
            status: parsePaymentStatus(p.status),
            paidAt: p.paidAt ? new Date(p.paidAt) : null,
            order: p.order ?? i,
          })),
        });
      }
      newPaymentsAfterPublish = await tx.clientPayment.findMany({
        where: { projectId },
        select: { order: true, label: true, status: true, amountKopeks: true, dueDate: true },
      });
    }

    await publishDraftMediaWithNotifications(tx, projectId);

    const notificationSpecs = collectNotificationsForPublish({
      oldPayments,
      newPayments: paymentsInDraft ? newPaymentsAfterPublish : undefined,
      oldStages,
      draftStages: stagesInDraft ? draft!.stages : undefined,
    });

    if (notificationSpecs.length > 0) {
      await createClientNotifications(tx, projectId, notificationSpecs);
    }

    await tx.clientConstructionProject.update({
      where: { id: projectId },
      data: {
        cabinetPublishedAt: new Date(),
        ...(draft
          ? {
              draftData: PrismaNamespace.DbNull,
              draftSavedAt: null,
            }
          : {}),
      },
    });

    const publishedProject = await tx.clientConstructionProject.findUnique({
      where: { id: projectId },
      include: { stages: { orderBy: { order: "asc" } } },
    });
    if (publishedProject) {
      await syncClientProjectPublicSite(tx, {
        id: publishedProject.id,
        title: publishedProject.title,
        contractNumber: publishedProject.contractNumber,
        area: publishedProject.area,
        wallMaterial: publishedProject.wallMaterial,
        location: publishedProject.location,
        latitude: publishedProject.latitude,
        longitude: publishedProject.longitude,
        coverImageUrl: publishedProject.coverImageUrl,
        houseProjectId: publishedProject.houseProjectId,
        showOnPublicSite: publishedProject.showOnPublicSite,
        builtObjectId: publishedProject.builtObjectId,
        stages: publishedProject.stages.map((s) => ({
          id: s.id,
          parentId: s.parentId,
          status: s.status,
        })),
      });
    }
  });
}

async function applyDraftFields(
  tx: Prisma.TransactionClient,
  projectId: string,
  currentContract: string,
  draft: ClientProjectDraftData
) {
  const nextContract = draft.contractNumber?.trim();
  if (nextContract && nextContract !== currentContract) {
    const clash = await tx.clientConstructionProject.findUnique({
      where: { contractNumber: nextContract },
    });
    if (clash && clash.id !== projectId) {
      throw new Error("CONTRACT_EXISTS");
    }
  }

  const passwordHash =
    draft.plainPassword && draft.plainPassword.length > 0
      ? await hashPassword(draft.plainPassword)
      : undefined;

  await tx.clientConstructionProject.update({
    where: { id: projectId },
    data: {
      ...(nextContract ? { contractNumber: nextContract } : {}),
      ...(passwordHash ? { passwordHash } : {}),
      ...(draft.title != null ? { title: draft.title } : {}),
      ...(draft.clientName !== undefined ? { clientName: draft.clientName } : {}),
      ...(draft.clientEmail !== undefined ? { clientEmail: draft.clientEmail } : {}),
      ...(draft.area !== undefined ? { area: draft.area } : {}),
      ...(draft.wallMaterial !== undefined ? { wallMaterial: draft.wallMaterial } : {}),
      ...(draft.startDate !== undefined
        ? { startDate: draft.startDate ? new Date(draft.startDate) : null }
        : {}),
      ...(draft.plannedEndDate !== undefined
        ? { plannedEndDate: draft.plannedEndDate ? new Date(draft.plannedEndDate) : null }
        : {}),
      ...(draft.coverImageUrl !== undefined ? { coverImageUrl: draft.coverImageUrl } : {}),
      ...(draft.foremanName !== undefined ? { foremanName: draft.foremanName } : {}),
      ...(draft.cameraStreamUrl !== undefined ? { cameraStreamUrl: draft.cameraStreamUrl } : {}),
      ...(draft.houseProjectId !== undefined ? { houseProjectId: draft.houseProjectId } : {}),
      ...(draft.showOnPublicSite !== undefined ? { showOnPublicSite: draft.showOnPublicSite } : {}),
      ...(draft.location !== undefined ? { location: draft.location } : {}),
      ...(draft.latitude !== undefined
        ? { latitude: draft.latitude ? parseFloat(draft.latitude) || null : null }
        : {}),
      ...(draft.longitude !== undefined
        ? { longitude: draft.longitude ? parseFloat(draft.longitude) || null : null }
        : {}),
    },
  });
}
