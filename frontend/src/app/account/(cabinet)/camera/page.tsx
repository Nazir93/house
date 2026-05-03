import { redirect } from "next/navigation";
import { getClientProjectIdFromSession } from "@/lib/client-session";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Онлайн камера — личный кабинет",
  robots: { index: false, follow: true },
};

export default async function AccountCameraPage() {
  const projectId = await getClientProjectIdFromSession();
  if (!projectId) redirect("/account/login");

  const project = await prisma.clientConstructionProject.findUnique({
    where: { id: projectId },
    select: { cameraStreamUrl: true },
  });

  const url = project?.cameraStreamUrl;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-2xl font-bold">Онлайн камера</h1>
        {url ? (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-red-600 text-white">
            Live
          </span>
        ) : null}
      </div>
      {url ? (
        <>
          <div className="relative aspect-video rounded-2xl overflow-hidden border bg-black" style={{ borderColor: "var(--border)" }}>
            <iframe
              src={url}
              className="absolute inset-0 w-full h-full border-0"
              title="Онлайн камера"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-sm font-semibold underline"
            style={{ color: "var(--accent)" }}
          >
            Открыть в новом окне
          </a>
        </>
      ) : (
        <p style={{ color: "var(--text-muted)" }}>
          Ссылка на трансляцию не настроена. Свяжитесь с менеджером.
        </p>
      )}
    </div>
  );
}
