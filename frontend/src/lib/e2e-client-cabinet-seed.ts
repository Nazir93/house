import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { buildDocumentNewNotification } from "@/lib/client-notification-messages";
import { createClientNotifications } from "@/lib/client-notifications";

/** Фиксированные учётные данные для Playwright (только E2E). */
export const E2E_CLIENT_CONTRACT_NUMBER = "E2E-CABINET-TEST";
export const E2E_CLIENT_PASSWORD = "e2e-cabinet-pass";

const E2E_DOCUMENT_FILENAME = "E2E Тестовый договор.pdf";
/** Статический файл из public/ — редирект скачивания не падает. */
const E2E_DOCUMENT_URL = "/images/banner/banner-hero-05.png";

export type E2eClientCabinetSeedResult = {
  contractNumber: string;
  password: string;
  projectId: string;
  documentId: string;
  notificationId: string;
  documentFilename: string;
};

export async function seedE2eClientCabinet(): Promise<E2eClientCabinetSeedResult> {
  await cleanupE2eClientCabinet();

  const passwordHash = await hashPassword(E2E_CLIENT_PASSWORD);
  const docNotification = buildDocumentNewNotification({ filename: E2E_DOCUMENT_FILENAME });

  const project = await prisma.clientConstructionProject.create({
    data: {
      contractNumber: E2E_CLIENT_CONTRACT_NUMBER,
      passwordHash,
      title: "E2E — тестовый объект",
      clientName: "E2E Клиент",
      cabinetPublishedAt: new Date(),
    },
  });

  const document = await prisma.clientDocument.create({
    data: {
      projectId: project.id,
      filename: E2E_DOCUMENT_FILENAME,
      url: E2E_DOCUMENT_URL,
      order: 0,
      signatureStatus: "AWAITING_REVIEW",
      isDraft: false,
    },
  });

  await createClientNotifications(prisma, project.id, [docNotification]);

  const notification = await prisma.clientNotification.findFirstOrThrow({
    where: { projectId: project.id, type: "DOCUMENT_NEW" },
    select: { id: true },
  });

  return {
    contractNumber: E2E_CLIENT_CONTRACT_NUMBER,
    password: E2E_CLIENT_PASSWORD,
    projectId: project.id,
    documentId: document.id,
    notificationId: notification.id,
    documentFilename: E2E_DOCUMENT_FILENAME,
  };
}

export async function cleanupE2eClientCabinet(): Promise<void> {
  const existing = await prisma.clientConstructionProject.findUnique({
    where: { contractNumber: E2E_CLIENT_CONTRACT_NUMBER },
    select: { id: true },
  });
  if (!existing) return;

  await prisma.clientConstructionProject.delete({ where: { id: existing.id } });
}
