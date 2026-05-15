-- Карта портфолио: регион, район, статус площадки; этажность как дробное число.
-- Идемпотентность: часть шагов безопасна, если на сервере уже делали `prisma db push`.

DO $enum$
BEGIN
  CREATE TYPE "BuiltObjectSiteStatus" AS ENUM ('COMPLETED', 'UNDER_CONSTRUCTION');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$enum$;

ALTER TABLE "BuiltObject" ALTER COLUMN "floors" TYPE DOUBLE PRECISION USING ("floors"::double precision);

ALTER TABLE "BuiltObject" ADD COLUMN IF NOT EXISTS "regionSlug" TEXT;
ALTER TABLE "BuiltObject" ADD COLUMN IF NOT EXISTS "district" TEXT;
ALTER TABLE "BuiltObject" ADD COLUMN IF NOT EXISTS "siteStatus" "BuiltObjectSiteStatus" NOT NULL DEFAULT 'COMPLETED';

CREATE INDEX IF NOT EXISTS "BuiltObject_published_regionSlug_idx" ON "BuiltObject"("published", "regionSlug");
