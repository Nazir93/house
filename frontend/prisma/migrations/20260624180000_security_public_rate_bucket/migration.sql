-- CreateTable
CREATE TABLE "PublicRateBucket" (
    "scopeKey" TEXT NOT NULL,
    "bucketStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicRateBucket_pkey" PRIMARY KEY ("scopeKey","bucketStart")
);

-- CreateIndex
CREATE INDEX "PublicRateBucket_bucketStart_idx" ON "PublicRateBucket"("bucketStart");

-- CreateIndex
CREATE INDEX "Lead_proposalStatus_createdAt_idx" ON "Lead"("proposalStatus", "createdAt");
