import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  ClientProjectAdminForm,
  type ClientProjectAdminInitial,
} from "@/components/admin/client-project-admin-form";

export const dynamic = "force-dynamic";

export default async function EditClientProjectPage({ params }: { params: { id: string } }) {
  const project = await prisma.clientConstructionProject.findUnique({
    where: { id: params.id },
    include: {
      stages: { orderBy: { order: "asc" } },
      payments: { orderBy: [{ order: "asc" }, { dueDate: "asc" }] },
      documents: { orderBy: { uploadedAt: "desc" } },
      photoReports: { orderBy: [{ order: "asc" }, { shotAt: "desc" }] },
      tickets: {
        orderBy: { updatedAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
    },
  });

  if (!project) notFound();

  const initial: ClientProjectAdminInitial = {
    contractNumber: project.contractNumber,
    title: project.title,
    clientName: project.clientName,
    clientEmail: project.clientEmail,
    area: project.area,
    wallMaterial: project.wallMaterial,
    startDate: project.startDate?.toISOString() ?? null,
    plannedEndDate: project.plannedEndDate?.toISOString() ?? null,
    coverImageUrl: project.coverImageUrl,
    overallProgress: project.overallProgress,
    currentStageLabel: project.currentStageLabel,
    foremanName: project.foremanName,
    cameraStreamUrl: project.cameraStreamUrl,
    houseProjectId: project.houseProjectId,
    stages: project.stages.map((s) => ({
      order: s.order,
      title: s.title,
      iconKey: s.iconKey,
      status: s.status,
    })),
    payments: project.payments.map((p) => ({
      label: p.label,
      amountKopeks: p.amountKopeks,
      dueDate: p.dueDate?.toISOString() ?? null,
      status: p.status,
      paidAt: p.paidAt?.toISOString() ?? null,
      order: p.order,
    })),
    documents: project.documents.map((d) => ({ id: d.id, filename: d.filename, url: d.url })),
    photoReports: project.photoReports.map((p) => ({ id: p.id, url: p.url, caption: p.caption })),
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

  return <ClientProjectAdminForm projectId={project.id} initial={initial} />;
}
