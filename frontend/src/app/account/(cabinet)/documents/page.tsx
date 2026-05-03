import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { formatDateRu } from "@/lib/client-portal-labels";

export const metadata = {
  title: "Документы — личный кабинет",
  robots: { index: false, follow: true },
};

export default async function AccountDocumentsPage() {
  const projectId = await getClientProjectIdFromSession();
  if (!projectId) redirect("/account/login");

  const documents = await prisma.clientDocument.findMany({
    where: { projectId },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold">Документы</h1>
      {documents.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Документов пока нет.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-3 rounded-xl border p-4"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
            >
              <FileText className="h-8 w-8 shrink-0 opacity-70" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{d.filename}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {formatDateRu(d.uploadedAt)}
                </p>
              </div>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm font-semibold"
                style={{ color: "var(--accent)" }}
              >
                Скачать
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
