-- Подэтапы в личном кабинете (п. 2 ТЗ)
ALTER TABLE "ClientProjectStage" ADD COLUMN "parentId" TEXT;

CREATE INDEX "ClientProjectStage_projectId_parentId_idx" ON "ClientProjectStage"("projectId", "parentId");

ALTER TABLE "ClientProjectStage" ADD CONSTRAINT "ClientProjectStage_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ClientProjectStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
