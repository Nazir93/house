-- CreateEnum
CREATE TYPE "ClientDocumentSignatureStatus" AS ENUM ('UNSIGNED', 'SIGNED', 'SIGNED_ES');

-- AlterTable
ALTER TABLE "ClientDocument" ADD COLUMN "signatureStatus" "ClientDocumentSignatureStatus" NOT NULL DEFAULT 'UNSIGNED';
ALTER TABLE "ClientDocument" ADD COLUMN "signedAt" TIMESTAMP(3);
