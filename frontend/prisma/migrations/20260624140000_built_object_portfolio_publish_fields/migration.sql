-- Портфолио: этапы кейса, отзыв клиента, дата публикации на сайт.
ALTER TABLE "BuiltObject" ADD COLUMN IF NOT EXISTS "caseStudyPhasesJson" JSONB;
ALTER TABLE "BuiltObject" ADD COLUMN IF NOT EXISTS "clientReviewText" TEXT;
ALTER TABLE "BuiltObject" ADD COLUMN IF NOT EXISTS "clientReviewVideoUrl" TEXT;
ALTER TABLE "BuiltObject" ADD COLUMN IF NOT EXISTS "sitePublishedAt" TIMESTAMP(3);
