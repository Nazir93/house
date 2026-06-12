-- Каталог проектов: author (/projects) и partner (/typical-projects)
ALTER TABLE "HouseProject" ADD COLUMN IF NOT EXISTS "catalogKind" TEXT NOT NULL DEFAULT 'author';

CREATE INDEX IF NOT EXISTS "HouseProject_published_catalogKind_idx" ON "HouseProject"("published", "catalogKind");
