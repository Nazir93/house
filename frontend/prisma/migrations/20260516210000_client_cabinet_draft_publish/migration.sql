-- AlterTable: черновик проекта и дата публикации в ЛК
ALTER TABLE "ClientConstructionProject" ADD COLUMN "draftData" JSONB;
ALTER TABLE "ClientConstructionProject" ADD COLUMN "draftSavedAt" TIMESTAMP(3);
ALTER TABLE "ClientConstructionProject" ADD COLUMN "cabinetPublishedAt" TIMESTAMP(3);

-- AlterTable: черновики медиа (фото / документы)
ALTER TABLE "ClientPhotoReport" ADD COLUMN "isDraft" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ClientDocument" ADD COLUMN "isDraft" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ClientPhotoReport_projectId_isDraft_order_idx" ON "ClientPhotoReport"("projectId", "isDraft", "order");
CREATE INDEX "ClientDocument_projectId_isDraft_order_idx" ON "ClientDocument"("projectId", "isDraft", "order");

-- Существующие проекты считаем уже опубликованными в ЛК
UPDATE "ClientConstructionProject"
SET "cabinetPublishedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "cabinetPublishedAt" IS NULL;
