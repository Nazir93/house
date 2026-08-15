-- Просмотры новостей (блог) для отчёта в админке.
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
