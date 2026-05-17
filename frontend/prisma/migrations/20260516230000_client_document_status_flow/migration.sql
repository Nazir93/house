-- AlterEnum: UNSIGNED/SIGNED/SIGNED_ES -> AWAITING_REVIEW/AWAITING_SIGNATURE/SIGNED
CREATE TYPE "ClientDocumentSignatureStatus_new" AS ENUM ('AWAITING_REVIEW', 'AWAITING_SIGNATURE', 'SIGNED');

ALTER TABLE "ClientDocument" ADD COLUMN "downloadedAt" TIMESTAMP(3);

ALTER TABLE "ClientDocument" ALTER COLUMN "signatureStatus" DROP DEFAULT;

ALTER TABLE "ClientDocument"
  ALTER COLUMN "signatureStatus" TYPE "ClientDocumentSignatureStatus_new"
  USING (
    CASE "signatureStatus"::text
      WHEN 'UNSIGNED' THEN 'AWAITING_REVIEW'
      WHEN 'SIGNED' THEN 'SIGNED'
      WHEN 'SIGNED_ES' THEN 'AWAITING_SIGNATURE'
      ELSE 'AWAITING_REVIEW'
    END
  )::"ClientDocumentSignatureStatus_new";

ALTER TYPE "ClientDocumentSignatureStatus" RENAME TO "ClientDocumentSignatureStatus_old";
ALTER TYPE "ClientDocumentSignatureStatus_new" RENAME TO "ClientDocumentSignatureStatus";
DROP TYPE "ClientDocumentSignatureStatus_old";

ALTER TABLE "ClientDocument" ALTER COLUMN "signatureStatus" SET DEFAULT 'AWAITING_REVIEW';
