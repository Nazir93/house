-- AlterTable
ALTER TABLE "BuiltObjectMedia" ADD COLUMN "phaseKey" TEXT;

-- CreateIndex
CREATE INDEX "BuiltObjectMedia_builtObjectId_phaseKey_idx" ON "BuiltObjectMedia"("builtObjectId", "phaseKey");
