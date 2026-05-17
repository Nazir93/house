import Image from "next/image";
import { redirect } from "next/navigation";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
import { formatDateRu } from "@/lib/client-portal-labels";
import { clientPhotoReportOrderBy, publishedPhotoWhere } from "@/lib/client-portal-order";

export const metadata = {
  title: "Фотоотчёты — личный кабинет",
  robots: { index: false, follow: true },
};

export default async function AccountPhotosPage() {
  const projectId = await getClientProjectIdFromSession();
  if (!projectId) redirect("/account/login");

  const photos = await prisma.clientPhotoReport.findMany({
    where: { projectId, ...publishedPhotoWhere },
    orderBy: clientPhotoReportOrderBy,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Фотоотчёты</h1>
      {photos.length === 0 ? (
        <p className="text-sm opacity-60">—</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((ph) => (
            <figure
              key={ph.id}
              className="rounded-xl overflow-hidden border bg-black/5"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="relative aspect-square">
                <Image src={ph.url} alt={ph.caption || "Фото объекта"} fill className="object-cover" sizes="200px" />
              </div>
              {(ph.caption || ph.shotAt) ? (
                <figcaption className="p-2 text-[11px] leading-snug" style={{ color: "var(--text-muted)" }}>
                  {ph.caption ? <span>{ph.caption}</span> : null}
                  {ph.shotAt ? <span className="block">{formatDateRu(ph.shotAt)}</span> : null}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
