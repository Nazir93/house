-- AlterTable
ALTER TABLE "ClientDocument" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "ClientDocument_projectId_order_idx" ON "ClientDocument"("projectId", "order");

-- Backfill order by upload time within each project
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY "projectId" ORDER BY "uploadedAt" ASC, id ASC) - 1 AS rn
  FROM "ClientDocument"
)
UPDATE "ClientDocument" d
SET "order" = ranked.rn
FROM ranked
WHERE d.id = ranked.id;
