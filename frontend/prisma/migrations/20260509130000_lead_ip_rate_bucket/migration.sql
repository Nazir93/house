-- CreateTable
CREATE TABLE "LeadIpRateBucket" (
    "ipKey" TEXT NOT NULL,
    "bucketStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadIpRateBucket_pkey" PRIMARY KEY ("ipKey","bucketStart")
);

-- CreateIndex
CREATE INDEX "LeadIpRateBucket_bucketStart_idx" ON "LeadIpRateBucket"("bucketStart");
