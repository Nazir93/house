import Image from "next/image";
import Link from "next/link";
import { AccountPhotoGallery } from "@/components/account/account-photo-gallery";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { AccountPaymentsDashboardBlock } from "@/components/account/account-payments-dashboard-block";
import { AccountObjectCardProgress } from "@/components/account/account-object-card-progress";
import { DashboardStagesStrip } from "@/components/account/dashboard-stages-strip";
import { formatDateRu, ticketStatusLabel } from "@/lib/client-portal-labels";
import { ClientDocumentDownloadLink } from "@/components/account/client-document-download-link";
import { formatDocumentClientStatusLine, isDocumentSigned } from "@/lib/client-document-signature";
import { isStageCompleteForDisplay } from "@/lib/client-project-progress";
import { getCurrentStagesInProgress, getEffectiveStageStatus } from "@/lib/client-project-stage-status";
import { resolveClientOverallProgress } from "@/lib/client-project-overall-progress";
import { AccountAttentionStrip } from "@/components/account/account-attention-strip";
import { SupportNewTicketForm } from "@/components/account/support-new-ticket-form";
import {
  clientDocumentOrderBy,
  clientPhotoReportOrderBy,
  publishedDocumentWhere,
  publishedPhotoWhere,
} from "@/lib/client-portal-order";
import { safeIframeUrl } from "@/lib/safe-iframe-url";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Главная — личный кабинет",
  robots: { index: false, follow: true },
};

export default async function AccountDashboardPage() {
  const projectId = await getClientProjectIdFromSession();
  if (!projectId) redirect("/account/login");

  const [project, documentsTotal, photoReportsTotal] = await Promise.all([
    prisma.clientConstructionProject.findUnique({
      where: { id: projectId },
      include: {
        stages: { orderBy: { order: "asc" } },
        payments: { orderBy: [{ order: "asc" }, { dueDate: "asc" }] },
        documents: { where: publishedDocumentWhere, orderBy: clientDocumentOrderBy, take: 5 },
        photoReports: { where: publishedPhotoWhere, orderBy: clientPhotoReportOrderBy, take: 6 },
        tickets: {
          orderBy: { updatedAt: "desc" },
          take: 5,
        },
        houseProject: { select: { slug: true, title: true } },
      },
    }),
    prisma.clientDocument.count({ where: { projectId, ...publishedDocumentWhere } }),
    prisma.clientPhotoReport.count({ where: { projectId, ...publishedPhotoWhere } }),
  ]);

  if (!project) redirect("/account/login");

  const topLevelStages = project.stages
    .filter((s) => !s.parentId)
    .sort((a, b) => a.order - b.order);
  const stagesForComplete = project.stages.map((s) => ({
    id: s.id,
    parentId: s.parentId,
    status: s.status,
  }));

  const overallProgress = await resolveClientOverallProgress(
    project.id,
    stagesForComplete,
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

  const cover = project.coverImageUrl || "/images/banner-hero.png";
  const cameraStreamUrl = safeIframeUrl(project.cameraStreamUrl);

  return (
    <div className="space-y-8">
      <AccountAttentionStrip projectId={projectId} />

      {/* Карточка объекта */}
      <section
        className="rounded-2xl border overflow-hidden grid lg:grid-cols-[1fr_1.2fr] gap-0"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
      >
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[280px] bg-black/5">
          <Image src={cover} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" priority />
        </div>
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">{project.title}</h1>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
            <div className="space-y-2.5">
              <p>
                <span className="font-medium" style={{ color: "var(--text)" }}>Договор:</span> {project.contractNumber}
              </p>
              <p>
                <span className="font-medium" style={{ color: "var(--text)" }}>Начало:</span>{" "}
                {formatDateRu(project.startDate)}
              </p>
              <p>
                <span className="font-medium" style={{ color: "var(--text)" }}>Сдача дома:</span>{" "}
                {formatDateRu(project.plannedEndDate)}
              </p>
            </div>
            <div className="space-y-2.5">
              <p>
                <span className="font-medium" style={{ color: "var(--text)" }}>Площадь:</span>{" "}
                {project.area != null ? `${project.area} м²` : "—"}
              </p>
              <p>
                <span className="font-medium" style={{ color: "var(--text)" }}>Стены:</span> {project.wallMaterial || "—"}
              </p>
              <p>
                <span className="font-medium" style={{ color: "var(--text)" }}>Руководитель проекта:</span> {project.foremanName || "—"}
              </p>
            </div>
          </div>
          {project.houseProject?.slug ? (
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="font-medium" style={{ color: "var(--text)" }}>Типовой проект:</span>{" "}
              <Link
                href={`/projects/${project.houseProject.slug}`}
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--accent)" }}
              >
                {project.houseProject.title || project.houseProject.slug}
              </Link>
            </p>
          ) : null}
          <AccountObjectCardProgress overallProgress={overallProgress} currentStages={currentStagesInProgress} />
        </div>
      </section>

      <DashboardStagesStrip
        stages={topLevelStages.map((stage) => {
          const children = project.stages.filter((s) => s.parentId === stage.id);
          return {
            id: stage.id,
            title: stage.title,
            iconKey: stage.iconKey,
            displayStatus:
              children.length > 0
                ? getEffectiveStageStatus(stage, stagesForComplete)
                : stage.status,
            complete: isStageCompleteForDisplay(stage, stagesForComplete),
          };
        })}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Камера */}
        <section
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-heading font-bold">Онлайн камера</h2>
            {cameraStreamUrl ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                Live
              </span>
            ) : null}
          </div>
          {cameraStreamUrl ? (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/80">
                <iframe
                  src={cameraStreamUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  title="Онлайн камера"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
              <a
                href={cameraStreamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium underline"
                style={{ color: "var(--accent)" }}
              >
                Открыть в новом окне
              </a>
            </div>
          ) : (
            <p className="text-sm opacity-60">—</p>
          )}
        </section>

        {/* Фото */}
        <section
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-3">
            <h2 className="font-heading font-bold">Фотоотчёты</h2>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Всего фото: {photoReportsTotal}
              </p>
              <Link href="/account/photos" className="text-sm font-medium shrink-0" style={{ color: "var(--accent)" }}>
                Смотреть все
              </Link>
            </div>
          </div>
          <AccountPhotoGallery
            variant="preview"
            photos={project.photoReports.map((ph) => ({
              id: ph.id,
              url: ph.url,
              caption: ph.caption,
              shotAt: ph.shotAt,
            }))}
          />
        </section>
      </div>

      <AccountPaymentsDashboardBlock payments={project.payments} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Документы */}
        <section
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold">Документы</h2>
            <Link href="/account/documents" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              Все ({documentsTotal})
            </Link>
          </div>
          <ul className="space-y-2">
            {project.documents.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2 text-sm rounded-xl border p-3" style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--bg) 40%, transparent)" }}>
                <FileText className="h-7 w-7 shrink-0 opacity-70" aria-hidden />
                <span className="truncate flex-1 min-w-0" title={d.filename}>{d.filename}</span>
                <span
                  className="shrink-0 text-xs font-medium whitespace-nowrap"
                  style={{
                    color: isDocumentSigned(d.signatureStatus) ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  {formatDocumentClientStatusLine(d.signatureStatus, d.signedAt)}
                </span>
                {!isDocumentSigned(d.signatureStatus) ? (
                  <span className="shrink-0 text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {formatDateRu(d.uploadedAt)}
                  </span>
                ) : null}
                <ClientDocumentDownloadLink
                  documentId={d.id}
                  className="shrink-0 text-xs font-semibold"
                  style={{ color: "var(--accent)" }}
                />
              </li>
            ))}
          </ul>
          {project.documents.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Документов пока нет.</p>
          ) : null}
        </section>

        {/* Обращения */}
        <section
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold">Обращения</h2>
            <Link href="/account/support" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              Вся история
            </Link>
          </div>
          <div className="mb-4">
            <SupportNewTicketForm variant="compact" />
          </div>
          <ul className="space-y-2">
            {project.tickets.map((t) => (
              <li key={t.id}>
                <Link
                  href="/account/support"
                  className="flex flex-wrap items-center gap-2 text-sm rounded-xl border px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--text)_4%,transparent)]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="truncate flex-1 min-w-[120px] font-medium">{t.subject}</span>
                  <span className="text-xs tabular-nums" style={{ color: "var(--text-muted)" }}>
                    {formatDateRu(t.createdAt)}
                  </span>
                  <span
                    className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {ticketStatusLabel(t.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {project.tickets.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Обращений пока нет — отправьте вопрос через форму выше.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
