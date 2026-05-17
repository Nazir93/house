-- CreateEnum
CREATE TYPE "ClientDocumentSignatureMethod" AS ENUM ('MANUAL', 'ES');

-- AlterTable
ALTER TABLE "ClientDocument" ADD COLUMN "signedByName" TEXT;
ALTER TABLE "ClientDocument" ADD COLUMN "signatureMethod" "ClientDocumentSignatureMethod";
ALTER TABLE "ClientDocument" ADD COLUMN "signatureSmsPhone" TEXT;
ALTER TABLE "ClientDocument" ADD COLUMN "signedResultUrl" TEXT;
