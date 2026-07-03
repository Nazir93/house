-- Публичный сайт: строящиеся объекты из личного кабинета
ALTER TABLE "ClientConstructionProject" ADD COLUMN IF NOT EXISTS "showOnPublicSite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ClientConstructionProject" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "ClientConstructionProject" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "ClientConstructionProject" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "ClientConstructionProject" ADD COLUMN IF NOT EXISTS "builtObjectId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "ClientConstructionProject_builtObjectId_key" ON "ClientConstructionProject"("builtObjectId");

DO $$ BEGIN
  ALTER TABLE "ClientConstructionProject" ADD CONSTRAINT "ClientConstructionProject_builtObjectId_fkey"
    FOREIGN KEY ("builtObjectId") REFERENCES "BuiltObject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
