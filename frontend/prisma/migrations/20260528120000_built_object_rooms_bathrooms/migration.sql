-- Спальни и санузлы на карточке построенного объекта (свои значения или из проекта)
ALTER TABLE "BuiltObject" ADD COLUMN IF NOT EXISTS "rooms" INTEGER;
ALTER TABLE "BuiltObject" ADD COLUMN IF NOT EXISTS "bathrooms" INTEGER;
