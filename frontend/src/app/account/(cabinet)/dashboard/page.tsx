import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { formatRub } from "@/lib/construction-shared";
import { StageIcon } from "@/components/account/stage-icon";
import {
  formatDateRu,
  kopeksToRubles,
  paymentStatusLabel,
  stageStatusLabel,
  ticketStatusLabel,
} from "@/lib/client-portal-labels";
import { AccountAttentionStrip } from "@/components/account/account-attention-strip";

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
        documents: { orderBy: { uploadedAt: "desc" }, take: 5 },
        photoReports: { orderBy: [{ order: "asc" }, { shotAt: "desc" }], take: 6 },
        tickets: {
          orderBy: { updatedAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.clientDocument.count({ where: { projectId } }),
    prisma.clientPhotoReport.count({ where: { projectId } }),
  ]);

  if (!project) redirect("/account/login");

  const paymentsOpen = project.payments.filter(
    (p) => p.status === "EXPECTED" || p.status === "NOT_ISSUED"
  );
  const upcoming =
    paymentsOpen
      .filter((p) => p.dueDate)
      .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())[0]
      ?? paymentsOpen[0]
      ?? null;

  const cover = project.coverImageUrl || "/images/banner-hero.png";

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
          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
            {project.area != null ? (
              <p>
                <span className="font-medium" style={{ color: "var(--text)" }}>Площадь:</span> {project.area} м²
              </p>
            ) : null}
            {project.wallMaterial ? (
              <p>
                <span className="font-medium" style={{ color: "var(--text)" }}>Стены:</span> {project.wallMaterial}
              </p>
            ) : null}
            <p>
              <span className="font-medium" style={{ color: "var(--text)" }}>Начало:</span>{" "}
              {formatDateRu(project.startDate)}
            </p>
            <p>
              <span className="font-medium" style={{ color: "var(--text)" }}>Сдача (план):</span>{" "}
              {formatDateRu(project.plannedEndDate)}
            </p>
            <p>
              <span className="font-medium" style={{ color: "var(--text)" }}>Договор:</span>{" "}
              {project.contractNumber}
            </p>
            {project.foremanName ? (
              <p>
                <span className="font-medium" style={{ color: "var(--text)" }}>Бригадир:</span>{" "}
                {project.foremanName}
              </p>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[140px]">
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: "var(--text-muted)" }}>Готовность</span>
                <span className="font-bold">{project.overallProgress}%</span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "color-mix(in srgb, var(--text) 12%, transparent)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, project.overallProgress))}%`,
                    backgroundColor: "var(--accent)",
                  }}
                />
              </div>
            </div>
            {project.currentStageLabel ? (
              <div
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border"
                style={{ borderColor: "var(--border)" }}
              >
                <StageIcon iconKey="hammer" className="h-4 w-4 opacity-80" />
                {project.currentStageLabel}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Этапы — горизонтальная лента */}
      <section>
        <h2 className="font-heading text-lg font-bold mb-4">Этапы строительства</h2>
        <div
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
          style={{ scrollbarColor: "var(--border) transparent" }}
        >
          {project.stages.map((stage) => (
            <div
              key={stage.id}
              className="min-w-[120px] sm:min-w-[140px] rounded-xl border p-3 text-center"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
            >
              <div className="flex justify-center mb-2">
                {stage.status === "DONE" ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" aria-hidden />
                ) : (
                  <StageIcon iconKey={stage.iconKey} className="h-8 w-8 opacity-80" />
                )}
              </div>
              <p className="text-xs font-semibold leading-tight line-clamp-2">{stage.title}</p>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                {stageStatusLabel(stage.status)}
              </p>
            </div>
          ))}
        </div>
        <Link href="/account/stages" className="inline-block mt-3 text-sm font-medium underline-offset-2 hover:underline" style={{ color: "var(--accent)" }}>
          Все этапы
        </Link>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Камера */}
        <section
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-heading font-bold">Онлайн камера</h2>
            {project.cameraStreamUrl ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                Live
              </span>
            ) : null}
          </div>
          {project.cameraStreamUrl ? (
            <div className="space-y-3">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/80">
                <iframe
                  src={project.cameraStreamUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  title="Онлайн камера"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
              <a
                href={project.cameraStreamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium underline"
                style={{ color: "var(--accent)" }}
              >
                Открыть в новом окне
              </a>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Трансляция пока не подключена.
            </p>
          )}
        </section>

        {/* Фото */}
        <section
          className="rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold">Фотоотчёты</h2>
            <Link href="/account/photos" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              Все ({photoReportsTotal})
            </Link>
          </div>
          {project.photoReports.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Фото появятся по мере строительства.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {project.photoReports.map((ph) => (
                <Link key={ph.id} href="/account/photos" className="relative aspect-square rounded-lg overflow-hidden bg-black/5">
                  <Image src={ph.url} alt={ph.caption || ""} fill className="object-cover" sizes="120px" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Платежи */}
      <section
        className="rounded-2xl border p-4 sm:p-6"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
      >
        <h2 className="font-heading font-bold mb-4">Платежи</h2>
        {upcoming ? (
          <div
            className="mb-6 rounded-xl p-4 border"
            style={{ borderColor: "var(--accent)", background: "color-mix(in srgb, var(--accent) 8%, var(--card-bg))" }}
          >
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>
              Следующий платёж
            </p>
            <p className="text-2xl font-bold mt-1">{formatRub(kopeksToRubles(upcoming.amountKopeks))}</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {upcoming.label}
              {upcoming.dueDate ? ` · до ${formatDateRu(upcoming.dueDate)}` : ""}
            </p>
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--text-muted)", borderColor: "var(--border)" }} className="text-left border-b">
                <th className="pb-2 pr-3 font-medium">Этап / основание</th>
                <th className="pb-2 pr-3 font-medium">Сумма</th>
                <th className="pb-2 pr-3 font-medium">Статус</th>
                <th className="pb-2 font-medium">Срок</th>
              </tr>
            </thead>
            <tbody>
              {project.payments.map((p) => (
                <tr key={p.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 pr-3">{p.label}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatRub(kopeksToRubles(p.amountKopeks))}</td>
                  <td className="py-2 pr-3">{paymentStatusLabel(p.status)}</td>
                  <td className="py-2">{formatDateRu(p.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/account/payments" className="inline-block mt-4 text-sm font-medium" style={{ color: "var(--accent)" }}>
          Подробнее о платежах
        </Link>
      </section>

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
              <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate" title={d.filename}>{d.filename}</span>
                <span className="shrink-0 text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatDateRu(d.uploadedAt)}
                </span>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs font-semibold"
                  style={{ color: "var(--accent)" }}
                >
                  Скачать
                </a>
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
              Все
            </Link>
          </div>
          <ul className="space-y-2">
            {project.tickets.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="truncate flex-1 min-w-[120px]">{t.subject}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatDateRu(t.createdAt)}
                </span>
                <span
                  className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border"
                  style={{ borderColor: "var(--border)" }}
                >
                  {ticketStatusLabel(t.status)}
                </span>
              </li>
            ))}
          </ul>
          {project.tickets.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Обращений пока нет.</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
