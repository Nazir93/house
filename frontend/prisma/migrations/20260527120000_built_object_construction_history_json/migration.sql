-- История строительства: кастомные этапы (карточки на карточке объекта)
ALTER TABLE "BuiltObject" ADD COLUMN IF NOT EXISTS "constructionHistoryJson" JSONB;
