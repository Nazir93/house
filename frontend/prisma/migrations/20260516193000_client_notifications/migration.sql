-- CreateEnum
CREATE TYPE "ClientNotificationType" AS ENUM ('PAYMENT_EXPECTED', 'STAGE_IN_PROGRESS', 'STAGE_DONE');

-- CreateTable
CREATE TABLE "ClientNotification" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "ClientNotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientNotification_projectId_createdAt_idx" ON "ClientNotification"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientNotification_projectId_readAt_idx" ON "ClientNotification"("projectId", "readAt");

-- AddForeignKey
ALTER TABLE "ClientNotification" ADD CONSTRAINT "ClientNotification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
