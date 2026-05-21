import { redirect } from "next/navigation";
import { AccountPhotoGallery } from "@/components/account/account-photo-gallery";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";
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
    select: { id: true, url: true, caption: true, shotAt: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Фотоотчёты</h1>
      <AccountPhotoGallery
        photos={photos.map((ph) => ({
          id: ph.id,
          url: ph.url,
          caption: ph.caption,
          shotAt: ph.shotAt,
        }))}
      />
    </div>
  );
}
