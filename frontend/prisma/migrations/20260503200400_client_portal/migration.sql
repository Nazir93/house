-- CreateEnum
CREATE TYPE "ClientStageStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "ClientPaymentStatus" AS ENUM ('NOT_ISSUED', 'EXPECTED', 'PAID');

-- CreateEnum
CREATE TYPE "ClientSupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "ClientTicketAuthorType" AS ENUM ('CLIENT', 'STAFF');

-- CreateTable
CREATE TABLE "ClientConstructionProject" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "clientName" TEXT,
    "clientEmail" TEXT,
    "title" TEXT NOT NULL,
    "area" INTEGER,
    "wallMaterial" TEXT,
    "startDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "coverImageUrl" TEXT,
    "overallProgress" INTEGER NOT NULL DEFAULT 0,
    "currentStageLabel" TEXT,
    "foremanName" TEXT,
    "cameraStreamUrl" TEXT,
    "houseProjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientConstructionProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectStage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL DEFAULT 'circle',
    "status" "ClientStageStatus" NOT NULL DEFAULT 'NOT_STARTED',

    CONSTRAINT "ClientProjectStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPayment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amountKopeks" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "ClientPaymentStatus" NOT NULL DEFAULT 'EXPECTED',
    "paidAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClientPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientDocument" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPhotoReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT DEFAULT '',
    "shotAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClientPhotoReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSupportTicket" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "ClientSupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientTicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorType" "ClientTicketAuthorType" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientTicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientConstructionProject_contractNumber_key" ON "ClientConstructionProject"("contractNumber");

-- CreateIndex
CREATE INDEX "ClientConstructionProject_houseProjectId_idx" ON "ClientConstructionProject"("houseProjectId");

-- CreateIndex
CREATE INDEX "ClientProjectStage_projectId_order_idx" ON "ClientProjectStage"("projectId", "order");

-- CreateIndex
CREATE INDEX "ClientPayment_projectId_order_idx" ON "ClientPayment"("projectId", "order");

-- CreateIndex
CREATE INDEX "ClientPayment_projectId_dueDate_idx" ON "ClientPayment"("projectId", "dueDate");

-- CreateIndex
CREATE INDEX "ClientDocument_projectId_uploadedAt_idx" ON "ClientDocument"("projectId", "uploadedAt");

-- CreateIndex
CREATE INDEX "ClientPhotoReport_projectId_order_idx" ON "ClientPhotoReport"("projectId", "order");

-- CreateIndex
CREATE INDEX "ClientSupportTicket_projectId_updatedAt_idx" ON "ClientSupportTicket"("projectId", "updatedAt");

-- CreateIndex
CREATE INDEX "ClientTicketMessage_ticketId_createdAt_idx" ON "ClientTicketMessage"("ticketId", "createdAt");

-- AddForeignKey
ALTER TABLE "ClientConstructionProject" ADD CONSTRAINT "ClientConstructionProject_houseProjectId_fkey" FOREIGN KEY ("houseProjectId") REFERENCES "HouseProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectStage" ADD CONSTRAINT "ClientProjectStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPayment" ADD CONSTRAINT "ClientPayment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDocument" ADD CONSTRAINT "ClientDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPhotoReport" ADD CONSTRAINT "ClientPhotoReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSupportTicket" ADD CONSTRAINT "ClientSupportTicket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ClientConstructionProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientTicketMessage" ADD CONSTRAINT "ClientTicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ClientSupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
