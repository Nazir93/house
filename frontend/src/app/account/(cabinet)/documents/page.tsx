import { redirect } from "next/navigation";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { clientDocumentOrderBy, publishedDocumentWhere } from "@/lib/client-portal-order";
import { ClientDocumentsList } from "@/components/account/client-documents-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Документы — личный кабинет",
  robots: { index: false, follow: true },
};

export default async function AccountDocumentsPage() {
  const projectId = await getClientProjectIdFromSession();
  if (!projectId) redirect("/account/login");

  const documents = await prisma.clientDocument.findMany({
    where: { projectId, ...publishedDocumentWhere },
    orderBy: clientDocumentOrderBy,
    select: {
      id: true,
      filename: true,
      url: true,
      uploadedAt: true,
      signatureStatus: true,
      signedAt: true,
    },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-heading text-2xl font-bold">Документы</h1>
      <ClientDocumentsList documents={documents} />
    </div>
  );
}
