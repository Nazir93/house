-- CreateEnum
CREATE TYPE "LeadProposalStatus" AS ENUM ('NONE', 'PENDING', 'READY', 'FAILED', 'UNSUPPORTED');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "proposalStatus" "LeadProposalStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "Lead" ADD COLUMN "proposalPath" TEXT;
ALTER TABLE "Lead" ADD COLUMN "proposalFilename" TEXT;
ALTER TABLE "Lead" ADD COLUMN "proposalError" TEXT;
ALTER TABLE "Lead" ADD COLUMN "proposalReadyAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ThankYouToken" ADD COLUMN "leadId" TEXT;
